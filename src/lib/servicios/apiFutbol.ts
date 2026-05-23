import { crearClienteNavegador } from '@/lib/supabase/cliente';

const LIGA_ECUADOR_ID = 4686; // ID de la Serie A de Ecuador en TheSportsDB
const TEMPORADA_ACTUAL = 2024; // Usaremos 2024 que es la última completa/activa registrada en TheSportsDB gratuita

// Mapeo de estados de TheSportsDB a los ENUMs de nuestra BD
function mapearEstado(status: string) {
  switch (status) {
    case 'NS':
    case 'Not Started':
      return 'PROGRAMADO';
    case 'FT':
    case 'AET':
    case 'PEN':
    case 'Match Finished':
      return 'FINALIZADO';
    case 'HT':
    case '1H':
    case '2H':
      return 'EN_CURSO';
    case 'PST':
    case 'CANC':
      return 'SUSPENDIDO';
    default:
      return 'PROGRAMADO';
  }
}

export const sincronizarPartidos = async () => {
  const supabase = crearClienteNavegador();
  
  // 1. Obtener clubes existentes en la BD para hacer match
  const { data: clubesDB, error: errClubes } = await supabase.from('clubes').select('id, nombre, nombre_corto');
  if (errClubes || !clubesDB) return { exito: false, error: 'Error al obtener clubes de la BD' };
  
  // 2. Obtener la competición activa (LigaPro)
  const { data: competicionesDB, error: errComp } = await supabase
    .from('competiciones')
    .select('id')
    .limit(1);
  if (errComp || !competicionesDB || competicionesDB.length === 0) {
    return { exito: false, error: 'No se encontró ninguna competición activa en la BD' };
  }
  const competicionId = competicionesDB[0].id;

  // 3. Obtener datos de la API (TheSportsDB es 100% gratuita y no requiere API Key)
  const url = `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${LIGA_ECUADOR_ID}&s=${TEMPORADA_ACTUAL}`;
  
  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    if (!datos.events || datos.events.length === 0) {
      throw new Error("No hay datos de la API o la respuesta está vacía");
    }

    // 4. Formatear y preparar para inserción
    const partidosAInsertar: any[] = [];

    for (const item of datos.events) {
      const apiId = parseInt(item.idEvent);
      const estadoApi = item.strStatus;
      const equipoLocalApi = item.strHomeTeam;
      const equipoVisitanteApi = item.strAwayTeam;
      const golesLocal = item.intHomeScore !== null ? parseInt(item.intHomeScore) : 0;
      const golesVisitante = item.intAwayScore !== null ? parseInt(item.intAwayScore) : 0;
      
      // Buscar match de club (búsqueda flexible)
      const buscarClub = (nombreApi: string) => {
        if (!nombreApi) return undefined;
        const lowerApi = nombreApi.toLowerCase();
        return clubesDB.find(c => 
          c.nombre.toLowerCase().includes(lowerApi) || 
          lowerApi.includes(c.nombre.toLowerCase()) ||
          (c.nombre_corto && lowerApi.includes(c.nombre_corto.toLowerCase()))
        );
      };

      const clubLocal = buscarClub(equipoLocalApi);
      const clubVisitante = buscarClub(equipoVisitanteApi);

      if (!clubLocal || !clubVisitante) {
        // Saltamos este partido si no identificamos a los equipos en nuestra BD
        continue; 
      }

      // Determinar jornada
      const jornada = item.intRound ? parseInt(item.intRound) : 1;

      partidosAInsertar.push({
        api_id: apiId,
        competicion_id: competicionId,
        club_local_id: clubLocal.id,
        club_visitante_id: clubVisitante.id,
        fecha_hora: item.strTimestamp || item.dateEvent,
        estado: mapearEstado(estadoApi),
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
        jornada: jornada,
        fase: 'FASE_1', // Por defecto a FASE_1
      });
    }

    if (partidosAInsertar.length === 0) {
      return { exito: false, error: 'Ningún partido pudo ser emparejado con los clubes de la BD' };
    }

    // 5. Inserción Masiva (Upsert)
    const { error: upsertError } = await supabase
      .from('partidos')
      .upsert(partidosAInsertar, { onConflict: 'api_id' });

    if (upsertError) throw upsertError;

    return { 
      exito: true, 
      mensaje: `¡ÉXITO CON THESPORTSDB! Se sincronizaron correctamente ${partidosAInsertar.length} partidos.`,
      cantidad: partidosAInsertar.length
    };

  } catch (error: any) {
    console.error("Error al consumir TheSportsDB:", error);
    return { exito: false, error: error.message };
  }
};
