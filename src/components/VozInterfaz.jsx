import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import "../styles/voz.css";

export const salasVoz = { "Sala general":"general", Ranked:"ranked" };

export function useSalasVoz(autenticado) {
  const [salas,setSalas]=useState(null);
  useEffect(()=>{
    if(!autenticado)return;
    let activo=true,timer;
    async function actualizar(){
      try{
        const [general,ranked]=await Promise.all(Object.values(salasVoz).map(s=>apiRequest("/api/v1/voz/"+s,{signal:AbortSignal.timeout(5000)})));
        if(activo)setSalas({general,ranked});
      }catch{if(activo)setSalas(null);}
      if(activo)timer=setTimeout(actualizar,2500);
    }
    actualizar();
    return()=>{activo=false;clearTimeout(timer);};
  },[autenticado]);
  return salas;
}

export function AvatarVoz({ miembro, grande=false }) {
  const iniciales=String(miembro.nombre||"?").trim().split(/\s+/).slice(0,2).map(n=>n[0]).join("").toUpperCase();
  return <span className={"nx-voice-avatar"+(grande?" grande":"")+(miembro.hablando&&!miembro.silencio?" hablando":"")}>
    {iniciales}<span className={"nx-voice-dot"+(miembro.silencio?" muted":"")}><i className={"bi bi-"+(miembro.silencio?"mic-mute-fill":"mic-fill")} aria-hidden="true"/></span>
  </span>;
}

export function ArbolVoz({ sala, miembros, conectado, usuario }) {
  if(!miembros?.length)return null;
  return <div className="nx-voice-tree" aria-label={"Participantes de "+sala}>{miembros.map(m=><div className={"nx-voice-tree-member"+(m.hablando&&!m.silencio?" hablando":"")} key={m.id}>
    <AvatarVoz miembro={m}/><span>{m.nombre}{String(m.id)===String(usuario.id)&&conectado?" (tú)":""}</span>{m.silencio?<i className="bi bi-mic-mute-fill" title="Silenciado"/>:m.hablando?<i className="bi bi-soundwave" title="Hablando"/>:null}
  </div>)}</div>;
}

export function ControlesVoz({ info, control, compacto=false }) {
  return <div className={"nx-voice-controls"+(compacto?" compacto":"")}>
    <button type="button" className={"nx-voice-control"+(!info.micro?" off":"")} aria-label={info.micro?"Silenciar micrófono":"Activar micrófono"} title={info.micro?"Silenciar micrófono":"Activar micrófono"} aria-pressed={!info.micro} disabled={info.estado!=="Conectado"} onClick={()=>control.current?.alternarMicro()}><i className={"bi bi-"+(info.micro?"mic-fill":"mic-mute-fill")} aria-hidden="true"/></button>
    <button type="button" className={"nx-voice-control"+(!info.auriculares?" off":"")} aria-label={info.auriculares?"Silenciar auriculares":"Activar auriculares"} title={info.auriculares?"Silenciar auriculares":"Activar auriculares"} aria-pressed={!info.auriculares} onClick={()=>control.current?.alternarAudio()}><i className={"bi bi-"+(info.auriculares?"headphones":"volume-mute-fill")} aria-hidden="true"/></button>
    <button type="button" className="nx-voice-control hangup" aria-label="Desconectar voz" title="Desconectar voz" onClick={()=>control.current?.salir()}><i className="bi bi-telephone-x-fill" aria-hidden="true"/>{!compacto&&<span>Salir</span>}</button>
  </div>;
}

export function EscenarioVoz({ nombre, participantes, info, control, usuario }) {
  const conectado=Boolean(info?.estado);
  return <section className="nx-voice-stage" aria-label={"Sala de voz "+nombre}>
    <header className="nx-voice-stage-header"><div><div className="nx-voice-kicker"><i className="bi bi-broadcast-pin"/> CANAL DE VOZ</div><h1>{nombre}</h1><p>{participantes===null?"Consultando participantes":participantes.length+" / 6 participantes"} · Gaming Chile</p></div><span className={"nx-voice-status"+(conectado?" on":"")}><span/>{conectado?info.estado:"Sin conectar"}</span></header>
    <div className="nx-voice-stage-body">{participantes?.length? <div className="nx-voice-tiles">{participantes.map(m=><article className={"nx-voice-tile"+(m.hablando&&!m.silencio?" hablando":"")} key={m.id}><AvatarVoz miembro={m} grande/><strong>{m.nombre}{String(m.id)===String(usuario.id)&&conectado?" (tú)":""}</strong><small>{m.silencio?"Micrófono silenciado":m.hablando?"Hablando":"En la sala"}</small></article>)}</div>:<div className="nx-voice-empty"><i className="bi bi-headphones"/><h2>{participantes===null?"Sala de voz":"La sala está tranquila"}</h2><p>Conecta tu micrófono y conversa con tus amigos mientras navegas por la comunidad.</p></div>}</div>
    <footer className="nx-voice-stage-footer">{conectado?<ControlesVoz info={info} control={control}/>:<button className="nx-voice-join" onClick={()=>control.current?.entrar()} disabled={participantes?.length>=6}><i className="bi bi-telephone-fill" aria-hidden="true"/> {participantes?.length>=6?"Sala llena":"Unirse al canal de voz"}</button>}{info?.error&&<p className="nx-voice-error" role="status">{info.error}</p>}<small>El audio sigue activo al cambiar de canal de texto.</small></footer>
  </section>;
}
