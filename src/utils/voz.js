import { errorTransitorio } from "./directos.js";

// A bounded retry preserves the current room membership during short network failures.
export async function consultarVoz(request, presencia, { pausa, activo, estado }) {
  for(let intento=0;activo();intento++){
    try{
      const resultado=await request("/estado",{method:"POST",body:presencia});
      if(activo())estado("Conectado");
      return resultado;
    }catch(e){
      if(!activo())return null;
      if(!errorTransitorio(e)||intento>=3)throw e;
      estado("Reconectando voz ("+(intento+1)+"/3)");
      await pausa(1000*2**intento);
    }
  }
  return null;
}
