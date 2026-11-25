import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/client.js";
import { servidoresIce } from "../utils/directos.js";
import { consultarVoz } from "../utils/voz.js";
const pausa = ms => new Promise(r => setTimeout(r, ms));

function AudioRemoto({ stream, silencio }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]);
  return <audio ref={ref} autoPlay controls muted={silencio} aria-label="Audio de participante" />;
}

export default function SalaVoz({ sala, usuario }) {
  const sesion = useRef(null);
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [miembros, setMiembros] = useState([]);
  const [remotos, setRemotos] = useState({});
  const [micro, setMicro] = useState(true);
  const [auriculares, setAuriculares] = useState(true);
  const ruta = "/api/v1/voz/" + sala;

  function cerrar(s) {
    if (!s || s.fin) return;
    s.fin = true;
    s.stream?.getTracks().forEach(t => t.stop());
    s.peers.forEach(p => p.close());
    s.context?.close().catch(() => {});
    if (s.entro) apiRequest(s.ruta, { method: "DELETE" }).catch(() => {});
  }
  useEffect(() => () => { cerrar(sesion.current); sesion.current = null; }, [sala, usuario.id]);
  function salir() {
    cerrar(sesion.current); sesion.current = null;
    setEstado(""); setMiembros([]); setRemotos({}); setMicro(true); setAuriculares(true);
  }
  async function entrar() {
    if (sesion.current) return;
    const s = { fin:false, peers:new Map(), ruta, entro:false };
    sesion.current = s; setEstado("Conectando"); setError("");
    const yo = String(usuario.id);
    const request = (path, options={}) => apiRequest(ruta+path, {...options, signal:AbortSignal.timeout(10000)});
    try {
      if (!navigator.mediaDevices) throw Error("Se necesita HTTPS o localhost para usar el microfono.");
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      if(s.fin){stream.getTracks().forEach(t=>t.stop());return;}
      s.stream=stream;
      if (window.AudioContext) {
        s.context=new AudioContext();
        s.analyser=s.context.createAnalyser(); s.analyser.fftSize=256;
        s.context.createMediaStreamSource(stream).connect(s.analyser);
        s.context.resume().catch(()=>{});
      }
      await request("", { method:"POST",body:{nombre:usuario.nombre} });
      s.entro=true;
      if(s.fin){await apiRequest(ruta,{method:"DELETE"});return;}
      setEstado("Conectado");
      const send = (destino,tipo,sdp) => request("/senal",{method:"POST",body:{destino,tipo,sdp}});
      async function local(peer,tipo) {
        await peer.setLocalDescription(await (tipo==="offer"?peer.createOffer():peer.createAnswer()));
        for(let i=0;i<80 && peer.iceGatheringState!=="complete" && !s.fin;i++)await pausa(100);
        if(s.fin) return null;
        return peer.localDescription.sdp;
      }
      function crear(id) {
        const peer=new RTCPeerConnection({iceServers:servidoresIce(import.meta.env.VITE_ICE_SERVERS)});
        s.peers.set(id,peer);stream.getTracks().forEach(t=>peer.addTrack(t,stream));
        peer.ontrack=e=>{if(!s.fin && s.peers.get(id)===peer)setRemotos(r=>({...r,[id]:e.streams[0]}));};
        return peer;
      }
      while(!s.fin){
        const track=stream.getAudioTracks()[0];
        let hablando=false;
        if(s.analyser && track.enabled){
          const data=new Uint8Array(s.analyser.fftSize);s.analyser.getByteTimeDomainData(data);
          hablando=Math.sqrt(data.reduce((sum,x)=>sum+((x-128)/128)**2,0)/data.length)>0.025;
        }
        const res=await consultarVoz(request,{hablando,silencio:!track.enabled},{pausa,activo:()=>!s.fin,estado:setEstado});
        if(s.fin || !res)break;
        setMiembros(res.miembros);
        const otros=res.miembros.filter(m=>m.id!==yo);
        for(const [id,peer] of s.peers)if(!otros.some(m=>m.id===id)){
          peer.close();s.peers.delete(id);setRemotos(r=>{const next={...r};delete next[id];return next;});
        }
        for(const m of otros)if(yo<m.id && !s.peers.has(m.id) && !s.fin){
          const peer=crear(m.id);const sdp=await local(peer,"offer");
          if(sdp && !s.fin)await send(m.id,"offer",sdp);
        }
        for(const msg of res.senales){
          if(s.fin || !otros.some(m=>m.id===msg.de))continue;
          if(msg.tipo==="offer" && msg.de<yo){
            s.peers.get(msg.de)?.close();const peer=crear(msg.de);
            await peer.setRemoteDescription({type:"offer",sdp:msg.sdp});
            const sdp=await local(peer,"answer");if(sdp && !s.fin)await send(msg.de,"answer",sdp);
          }else if(msg.tipo==="answer"){
            const peer=s.peers.get(msg.de);
            if(peer && peer.signalingState==="have-local-offer")await peer.setRemoteDescription({type:"answer",sdp:msg.sdp});
          }
        }
        await pausa(750);
      }
    }catch(e){if(!s.fin){salir();setError(e.message);}}
  }
  return <section className="p-3 border rounded m-3" aria-label="Sala de voz">
    <h2 className="h5">Voz en comunidad</h2>
    <p>{estado || "Conecta tu microfono para conversar en esta sala."}</p>
    {!estado ? <button className="btn btn-primary" onClick={entrar}>Conectar voz</button> : <>
      <button className="btn btn-outline-info me-2" disabled={estado!=="Conectado"} onClick={()=>{
        const t=sesion.current?.stream?.getAudioTracks()[0];if(t){t.enabled=!t.enabled;setMicro(t.enabled);}
      }}>{micro?"Silenciar microfono":"Activar microfono"}</button>
      <button className="btn btn-outline-info me-2" onClick={()=>setAuriculares(x=>!x)}>{auriculares?"Silenciar auriculares":"Activar auriculares"}</button>
      <button className="btn btn-danger" onClick={salir}>Desconectar voz</button>
      <p className="mt-3">{miembros.length} participantes</p>
      <ul>{miembros.map(m=><li key={m.id}>{m.nombre} — {m.silencio?"Silenciado":m.hablando?"Hablando":"Conectado"}</li>)}</ul>
      {Object.entries(remotos).map(([id,stream])=><AudioRemoto key={id} stream={stream} silencio={!auriculares}/>)}
    </>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
