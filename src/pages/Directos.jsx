import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../api/client.js";
import { servidoresIce, verDirecto } from "../utils/directos.js";
import ChatDirecto from "../components/ChatDirecto.jsx";

const base = "/api/v1/directos";
const pausa = ms => new Promise(done => setTimeout(done, ms));
function conexion() {
  return new RTCPeerConnection({iceServers: servidoresIce(import.meta.env.VITE_ICE_SERVERS)});
}
async function descripcion(peer, tipo) {
  await peer.setLocalDescription(await (tipo === "offer" ? peer.createOffer() : peer.createAnswer()));
  for (let i=0; i<80 && peer.iceGatheringState !== "complete" && peer.signalingState !== "closed"; i++) await pausa(100);
  if (peer.signalingState === "closed") throw Error("Conexión cerrada");
  return peer.localDescription.sdp;
}
function detener(s) {
  if (!s || s.fin) return;
  s.fin=true;
  s.stream?.getTracks().forEach(t=>t.stop());
  s.peers.forEach(p=>p.close());
  if(s.id) apiRequest(base+"/"+s.id+(s.emite?"":"/oferta"),{method:"DELETE"}).catch(()=>{});
}
export default function Directos({usuario}) {
  const [lista,setLista]=useState([]), [titulo,setTitulo]=useState(""), [modo,setModo]=useState("cámara");
  const [fase,setFase]=useState(""), [error,setError]=useState(""), [micro,setMicro]=useState(true);
  const [canalId,setCanalId]=useState(null), [dispositivos,setDispositivos]=useState([]);
  const [camara,setCamara]=useState(""), [microfono,setMicrofono]=useState("");
  const [videoActivo,setVideoActivo]=useState(true);
  useEffect(()=>{
    let vivo=true;
    if(usuario?.autenticadoApi) navigator.mediaDevices?.enumerateDevices?.().then(ds=>{if(vivo)setDispositivos(ds);}).catch(()=>{});
    return ()=>{vivo=false;};
  },[usuario?.autenticadoApi]);
  const actual=useRef(null), video=useRef(null); const [emitiendo,setEmitiendo]=useState(false);
  useEffect(()=>{
    let activo=true;
    async function actualizar(){
      while(activo && usuario?.autenticadoApi){
        try{const canales=await apiRequest(base); if(activo)setLista(canales);}catch(e){if(activo)setError(e.message);}
        await pausa(2000);
      }
    }
    actualizar();
    return ()=>{activo=false; detener(actual.current); actual.current=null;};
  },[usuario?.id,usuario?.autenticadoApi]);
  function salir(){
    detener(actual.current); actual.current=null;
    if(video.current)video.current.srcObject=null;
    setFase(""); setMicro(true); setCanalId(null); setVideoActivo(true);
  }
  async function iniciar(canal){
    if(actual.current)return;
    const s={emite:!canal,peers:new Map(),fin:false};
    actual.current=s; setEmitiendo(s.emite); setError(""); setFase(canal?"Conectando":"Preparando transmisión");
    try{
      if(!canal){
        if(!navigator.mediaDevices)throw Error("Abre Nexus en localhost o mediante HTTPS para usar la cámara.");
        const medios=modo==="pantalla"?await navigator.mediaDevices.getDisplayMedia({video:true}):await navigator.mediaDevices.getUserMedia({audio:microfono?{deviceId:{exact:microfono}}:true,video:camara?{deviceId:{exact:camara}}:true});
        if(s.fin){medios.getTracks().forEach(t=>t.stop());return;}
        s.stream=medios;
        if(modo==="pantalla"){
          const voz=await navigator.mediaDevices.getUserMedia({audio:microfono?{deviceId:{exact:microfono}}:true});
          if(s.fin){voz.getTracks().forEach(t=>t.stop());return;}
          voz.getAudioTracks().forEach(t=>medios.addTrack(t));
        }
        medios.getVideoTracks()[0].onended=()=>{if(actual.current===s)salir();};
        video.current.srcObject=medios;
        const alta=await apiRequest(base,{method:"POST",body:{titulo:titulo.trim()}});
        s.id=alta.id;
        if(s.fin){await apiRequest(base+"/"+s.id,{method:"DELETE"});return;}
        setCanalId(alta.id); setFase("Transmitiendo");
        const conocidas=new Map();
        while(!s.fin){
          const ofertas=await apiRequest(base+"/"+s.id+"/ofertas");
          if(s.fin)break;
          for(const [uid,p] of s.peers)if(!ofertas.some(o=>o.espectador===uid)){p.close();s.peers.delete(uid);conocidas.delete(uid);}
          for(const {espectador:uid,sdp} of ofertas){
            if(s.fin||conocidas.get(uid)===sdp)continue;
            s.peers.get(uid)?.close();const peer=conexion();s.peers.set(uid,peer);conocidas.set(uid,sdp);
            try{
              await peer.setRemoteDescription({type:"offer",sdp});
              medios.getTracks().forEach(t=>peer.addTrack(t,medios));
              const respuesta=await descripcion(peer,"answer");
              if(!s.fin)await apiRequest(base+"/"+s.id+"/respuesta/"+uid,{method:"PUT",body:{sdp:respuesta,oferta:sdp}});
            }catch{peer.close();conocidas.delete(uid);}
          }
          await pausa(750);
        }
      }else{
        setCanalId(canal.id);
        await verDirecto({ s, canal, conexion, descripcion, apiRequest, base, pausa, setFase, video });
      }
    }catch(e){if(!s.fin){setError(e.status===410?"La transmisión terminó.":e.message);salir();}}
  }
  return <main className="container py-4"><h1>Transmisiones en vivo</h1>
    {!usuario?.autenticadoApi ? <p>Inicia sesión con una cuenta para emitir o ver un directo.</p> : <>
    {!fase && <><form onSubmit={e=>{e.preventDefault();iniciar();}} className="mb-4">
      <label className="d-block mb-2">Título del directo<input className="form-control" required maxLength={80} value={titulo} onChange={e=>setTitulo(e.target.value)}/></label>
      <label className="d-block mb-3">Fuente de video<select className="form-select" value={modo} onChange={e=>setModo(e.target.value)}><option>cámara</option><option>pantalla</option></select></label>
      <div className="row g-2 mb-3">
        {modo!=="pantalla" && <label className="col-md-6">Camara<select className="form-select" value={camara} onChange={e=>setCamara(e.target.value)}><option value="">Predeterminada</option>{dispositivos.filter(d=>d.kind==="videoinput").map((d,i)=><option key={i} value={d.deviceId}>{d.label||"Camara "+(i+1)}</option>)}</select></label>}
        <label className="col-md-6">Microfono<select className="form-select" value={microfono} onChange={e=>setMicrofono(e.target.value)}><option value="">Predeterminado</option>{dispositivos.filter(d=>d.kind==="audioinput").map((d,i)=><option key={i} value={d.deviceId}>{d.label||"Microfono "+(i+1)}</option>)}</select></label>
      </div>
      <button className="btn btn-primary" disabled={!titulo.trim()}>Iniciar transmisión</button></form>
      <h2>Canales en vivo</h2>{lista.length?lista.map(c=><button className="btn btn-outline-info me-2" key={c.id} onClick={()=>iniciar(c)}>Ver {c.titulo} ({c.espectadores??0} espectadores)</button>):<p>Todavía no hay transmisiones.</p>}</>}
    <video className="rounded shadow" ref={video} hidden={!fase} autoPlay playsInline controls muted={emitiendo} style={{width:"100%",maxHeight:"65vh",background:"#111"}}/>
    {fase && <><p role="status">{fase}</p>{canalId && <p>{lista.find(c=>c.id===canalId)?.espectadores??0} espectadores conectados</p>}<button className="btn btn-outline-secondary me-2" onClick={()=>video.current?.requestFullscreen?.().catch(()=>{})}>Pantalla completa</button>{emitiendo && <button className="btn btn-outline-info me-2" onClick={()=>{const t=actual.current?.stream?.getVideoTracks()[0];if(t){t.enabled=!t.enabled;setVideoActivo(t.enabled);}}}>{videoActivo?"Ocultar video":"Activar video"}</button>}{emitiendo && <button className="btn btn-outline-info me-2" onClick={()=>{const t=actual.current?.stream?.getAudioTracks()[0];if(t){t.enabled=!t.enabled;setMicro(t.enabled);}}}>{micro?"Silenciar micrófono":"Activar micrófono"}</button>}
    <button className="btn btn-danger" onClick={salir}>{emitiendo?"Finalizar transmisión":"Salir del directo"}</button></>}
    {canalId && <ChatDirecto key={canalId} id={canalId} />}
    {error && <p role="alert">{error}</p>}</>}</main>;
}
