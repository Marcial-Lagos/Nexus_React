import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";

function unir(a,b){return [...new Map([...a,...b].map(m=>[m.id,m])).values()].sort((x,y)=>x.id-y.id);}
export default function ChatDirecto({ id, canal, soloLectura=false, busqueda="" }) {
  const [mensajes,setMensajes]=useState([]), [texto,setTexto]=useState("");
  const [error,setError]=useState(""), [enviando,setEnviando]=useState(false);
  const [anteriores,setAnteriores]=useState([]), [cargando,setCargando]=useState(false), [fin,setFin]=useState(false);
  const ruta=canal ? "/api/v1/comunidad/chat?canal="+encodeURIComponent(canal) : "/api/v1/directos/"+id+"/chat";
  const lista=unir(anteriores,mensajes);
  const visibles=lista.filter(m=>(m.texto+" "+m.usuario).toLocaleLowerCase("es").includes(busqueda.toLocaleLowerCase("es")));
  useEffect(()=>{
    let vivo=true, timer;
    async function poll(){
      try{
        const recibidos=await apiRequest(ruta,{signal:AbortSignal.timeout(10000)});
        if(vivo){setMensajes(recibidos);setError("");}
      }catch(e){if(vivo)setError(e.message);}
      if(vivo&&!soloLectura)timer=setTimeout(poll,1200);
    }
    poll();
    return ()=>{vivo=false;clearTimeout(timer);};
  },[ruta,soloLectura]);
  async function cargar(){
    if(cargando||fin||!lista.length)return;
    setCargando(true);
    try{
      const prev=await apiRequest(ruta+(canal?"&":"?")+"antes="+lista[0].id);
      setAnteriores(a=>unir(a,prev));setFin(prev.length<100);
    }catch(e){setError(e.message);}
    finally{setCargando(false);}
  }
  async function enviar(e){
    e.preventDefault();if(soloLectura||enviando||!texto.trim())return;
    setEnviando(true);
    try{
      const m=await apiRequest(ruta,{method:"POST",body:{texto:texto.trim()},signal:AbortSignal.timeout(10000)});
      setMensajes(prev=>unir(prev,[m]));setTexto("");setError("");
    }catch(e){setError(e.message);}
    finally{setEnviando(false);}
  }
  return <aside className={canal?"nx-community-chat":"border rounded p-3 mt-3"}>
    <h2 className="h5">{canal?"Chat de la comunidad":soloLectura?"Historial del directo":"Chat en directo"}</h2>
    {lista.length>=100 && !fin && <button className="btn btn-outline-secondary btn-sm mb-2" onClick={cargar} disabled={cargando}>Cargar mensajes anteriores</button>}
    <div role="log" aria-label={canal?"Mensajes de la comunidad":"Mensajes del directo"} className={canal?"nx-community-log":undefined} style={canal?undefined:{maxHeight:"240px",overflowY:"auto"}}>
      {lista.length===0 && <p>{soloLectura?"No hay mensajes guardados.":"Inicia la conversacion."}</p>}
      {visibles.map(m=>canal?<article key={m.id} className="nx-chat-message"><span className="nx-voice-avatar">{String(m.usuario).slice(0,2)}</span><div className="nx-chat-message-body"><strong>Usuario {m.usuario}</strong>{m.fecha&&<small>{new Date(m.fecha).toLocaleString("es-CL")}</small>}<p>{m.texto}</p></div></article>:<p key={m.id} className="mb-2"><strong>Usuario {m.usuario}: </strong>{m.texto} {m.fecha&&<small className="text-secondary">{new Date(m.fecha).toLocaleString("es-CL")}</small>}</p>)}
    </div>
    {!soloLectura&&<form onSubmit={enviar} className={canal?"nx-chat-input":"d-flex gap-2"}>
      <input className="form-control" aria-label={canal?"Mensaje para la comunidad":"Mensaje del directo"} placeholder={canal?"Mensaje en "+canal:"Escribe un mensaje"} maxLength={canal?2000:500} value={texto} onChange={e=>setTexto(e.target.value)} />
      <button className="btn btn-primary" disabled={enviando||!texto.trim()}>Enviar</button>
    </form>}
    {error && <p role="alert">{error}</p>}
  </aside>;
}
