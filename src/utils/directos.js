export function servidoresIce(raw = "[]") {
  let servers;
  try { servers = JSON.parse(raw || "[]"); }
  catch { throw new Error("Configuracion ICE invalida: se esperaba JSON."); }
  if (!Array.isArray(servers) || servers.some(s => {
    const urls = Array.isArray(s?.urls) ? s.urls : [s?.urls];
    return !urls.length || urls.some(u => typeof u !== "string" || !/^(stun|stuns|turn|turns):.+$/i.test(u));
  })) throw new Error("Configuracion ICE invalida: revisa las URL STUN/TURN.");
  return servers;
}

export function errorTransitorio(error) {
  return error?.status === 0 || error?.status === 408 || error?.status === 429 ||
    (error?.status >= 500 && error?.status < 600) || error?.name === "TimeoutError";
}

// Cada intento crea una oferta nueva. El emisor reemplaza la conexion anterior.
export async function verDirecto({ s, canal, conexion, descripcion, apiRequest, base, pausa, setFase, video }) {
  const ruta = base + "/" + canal.id;
  s.id = canal.id;
  let reintentos = 0;
  while (!s.fin) {
    let peer;
    try {
      peer = conexion();
      s.peers.set("emisor", peer);
      peer.ontrack = e => {
        if (!s.fin && video.current && s.peers.get("emisor") === peer)
          video.current.srcObject = e.streams[0];
      };
      peer.addTransceiver("video", { direction: "recvonly" });
      peer.addTransceiver("audio", { direction: "recvonly" });
      const sdp = await descripcion(peer, "offer");
      if (s.fin) return;
      await apiRequest(ruta + "/oferta", { method: "PUT", body: { sdp }, signal: AbortSignal.timeout(10000) });
      const inicio = Date.now();
      let desconectado = null, estableDesde = null;
      while (!s.fin) {
        const respuesta = await apiRequest(ruta + "/respuesta", { signal: AbortSignal.timeout(10000) });
        if (s.fin) return;
        if (respuesta?.sdp && !peer.remoteDescription)
          await peer.setRemoteDescription({ type: "answer", sdp: respuesta.sdp });
        const estado = peer.connectionState;
        const ahora = Date.now();
        if (estado === "connected") {
          setFase("Viendo " + canal.titulo);
          desconectado = null;
          estableDesde ??= ahora;
          if (ahora - estableDesde >= 30000) reintentos = 0;
        } else {
          estableDesde = null;
          if (estado === "disconnected") desconectado ??= ahora;
          else desconectado = null;
          if (estado === "failed" || estado === "closed" ||
              (desconectado !== null && ahora - desconectado >= 10000) ||
              (estableDesde === null && ahora - inicio >= 60000 && estado !== "disconnected")) {
            const error = new Error("No se pudo establecer la conexion multimedia.");
            error.status = 0;
            throw error;
          }
        }
        await pausa(1000);
      }
    } catch (error) {
      if (s.fin) return;
      if (!errorTransitorio(error) || reintentos >= 3) throw error;
      reintentos++;
      setFase("Reconectando (" + reintentos + "/3)");
    } finally {
      peer?.close();
      s.peers.delete("emisor");
      if (!s.fin && video.current) video.current.srcObject = null;
    }
    if (!s.fin) await pausa(1000 * 2 ** (reintentos - 1));
  }
}
