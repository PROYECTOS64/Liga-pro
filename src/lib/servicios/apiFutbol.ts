import { crearClienteNavegador } from '@/lib/supabase/cliente';

const LIGA_ECUADOR_ID = 242; // ID de la LigaPro en API-Football
const TEMPORADA_ACTUAL = new Date().getFullYear();

// Mapeo de estados de la API a los ENUMs de nuestra BD
function mapearEstado(statusLong: string) {
  switch (statusLong) {
    case 'Not Started':
    case 'Time to be defined':
      return 'PROGRAMADO';
    case 'Match Finished':
    case 'Finished After Extra Time':
    case 'Finished After Penalty':
      return 'FINALIZADO';
    case 'First Half':
    case 'Kick Off':
    case 'Halftime':
    case 'Second Half':
    case 'Extra Time':
    case 'Penalty In Progress':
      return 'EN_CURSO';
    case 'Match Postponed':
    case 'Match Cancelled':
    case 'Match Suspended':
    case 'Match Interrupted':
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

  // 3. Obtener datos de la API
  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${LIGA_ECUADOR_ID}&season=${TEMPORADA_ACTUAL}`;
  const opciones = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    }
  };

  try {
    // === MOCK MODE: Simulación de API-Football ===
    // Ya que hubo problemas obteniendo la llave, inyectamos datos de prueba directamente
    const datos = {
      response: [
        {
          fixture: { id: 9001, date: new Date(Date.now() + 86400000).toISOString(), status: { long: 'Not Started' }, venue: { name: 'Estadio Rodrigo Paz Delgado' } },
          teams: { home: { name: 'LDU Quito' }, away: { name: 'Barcelona SC' } },
          goals: { home: 0, away: 0 },
          league: { round: 'Regular Season - 16' }
        },
        {
          fixture: { id: 9002, date: new Date(Date.now() + 172800000).toISOString(), status: { long: 'Not Started' }, venue: { name: 'Estadio George Capwell' } },
          teams: { home: { name: 'Emelec' }, away: { name: 'Independiente del Valle' } },
          goals: { home: 0, away: 0 },
          league: { round: 'Regular Season - 16' }
        },
        {
          fixture: { id: 9003, date: new Date(Date.now() + 259200000).toISOString(), status: { long: 'Not Started' }, venue: { name: 'Estadio Olímpico Atahualpa' } },
          teams: { home: { name: 'El Nacional' }, away: { name: 'Aucas' } },
          goals: { home: 0, away: 0 },
          league: { round: 'Regular Season - 16' }
        }
      ]
    };

    // 4. Formatear y preparar para inserción
    const partidosAInsertar: any[] = [];

    for (const item of datos.response) {
      const fix = item.fixture;
      const apiId = fix.id;
      const estadoApi = fix.status.long;
      const equipoLocalApi = item.teams.home.name;
      const equipoVisitanteApi = item.teams.away.name;
      const golesLocal = item.goals.home;
      const golesVisitante = item.goals.away;
      
      // Buscar match de club (búsqueda flexible)
      const buscarClub = (nombreApi: string) => {
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
        console.warn(`No se encontró match para los clubes: ${equipoLocalApi} vs ${equipoVisitanteApi}`);
        continue; // Saltamos este partido si no identificamos a los equipos en nuestra BD
      }

      // Determinar jornada (La API devuelve ej. "Regular Season - 1")
      let jornada = 1;
      const matchJornada = item.league.round.match(/\d+/);
      if (matchJornada) jornada = parseInt(matchJornada[0], 10);

      partidosAInsertar.push({
        api_id: apiId,
        competicion_id: competicionId,
        club_local_id: clubLocal.id,
        club_visitante_id: clubVisitante.id,
        fecha_hora: fix.date,
        estado: mapearEstado(estadoApi),
        goles_local: golesLocal !== null ? golesLocal : 0,
        goles_visitante: golesVisitante !== null ? golesVisitante : 0,
        jornada: jornada,
        fase: 'FASE_1', // Por defecto a FASE_1, se podría hacer más complejo si se requiere
      });
    }

    if (partidosAInsertar.length === 0) {
      return { exito: false, error: 'Ningún partido de prueba pudo ser emparejado con los clubes de la BD' };
    }

    // 5. Inserción Masiva (Upsert)
    // Se requiere que api_id sea un campo UNIQUE en la tabla partidos
    const { error: upsertError } = await supabase
      .from('partidos')
      .upsert(partidosAInsertar, { onConflict: 'api_id' });

    if (upsertError) throw upsertError;

    return { 
      exito: true, 
      mensaje: `¡MOCK EXITOSO! Se sincronizaron correctamente ${partidosAInsertar.length} partidos de prueba (LDU vs BSC, Emelec vs IDV, El Nacional vs Aucas).`,
      cantidad: partidosAInsertar.length
    };

  } catch (error: any) {
    console.error("Error al sincronizar partidos (Mock):", error);
    return { exito: false, error: error.message };
  }
};
