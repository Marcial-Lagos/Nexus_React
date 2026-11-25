import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";

export default function ChatDirecto({ id }) {
  const [mensajes,setMensajes]=useState([]), [texto,setTexto]=useState("");
  const [error,setError]=useState(""), [enviando,setEnviando]=useState(false);
  const ruta="/api/v1/directos/"+id+"/chat";
  useEffect(()=>{
    let vivo=true, timer;
    async function poll(){
      try{
        const lista=await apiRequest(ruta,{signal:AbortSignal.timeout(10000)});
        if(vivo){setMensajes(lista);setError("");}
      }catch(e){if(vivo)setError(e.message);}
      if(vivo)timer=setTimeout(poll,1200);
    }
    poll();
    return ()=>{vivo=false;clearTimeout(timer);};
  },[ruta]);
  async function enviar(e){
    e.preventDefault();if(enviando||!texto.trim())return;
    setEnviando(true);
    try{
      const m=await apiRequest(ruta,{method:"POST",body:{texto:texto.trim()},signal:AbortSignal.timeout(10000)});
      setMensajes(prev=>prev.some(x=>x.id===m.id)?prev:[...prev,m]);setTexto("");setError("");
    }catch(e){setError(e.message);}
    finally{setEnviando(false);}
  }
  return <aside className="border rounded p-3 mt-3">
    <h2 className="h5">Chat en directo</h2>
    <div role="log" aria-label="Mensajes del directo" style={{maxHeight:"240px",overflowY:"auto"}}>
      {mensajes.length===0 && <p>Inicia la conversacion.</p>}
      {mensajes.map(m=><p key={m.id} className="mb-2"><strong>Usuario {m.usuario}: </strong>{m.texto}</p>)}
    </div>
    <form onSubmit={enviar} className="d-flex gap-2">
      <input className="form-control" aria-label="Mensaje del directo" maxLength={500} value={texto} onChange={e=>setTexto(e.target.value)} />
      <button className="btn btn-primary" disabled={enviando||!texto.trim()}>Enviar</button>
    </form>
    {error && <p role="alert">{error}</p>}
  </aside>;
}
