import { crearClienteNavegador } from '@/lib/supabase/cliente';

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

// Función auxiliar para generar abreviatura única de 2 a 5 letras
function generarAbreviatura(nombre: string, short: string | null): string {
  if (short && short.trim().length >= 2 && short.trim().length <= 5) {
    return short.trim().toUpperCase();
  }
  // Filtrar palabras cortas comunes
  const palabrasIgnoradas = ['de', 'del', 'la', 'el', 'y', 'in', 'fc', 'sc', 'cd', 'sd'];
  const palabras = nombre
    .split(/\s+/)
    .filter(w => !palabrasIgnoradas.includes(w.toLowerCase()));

  let iniciales = '';
  if (palabras.length >= 2) {
    iniciales = palabras
      .map(w => w[0])
      .join('')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();
  } else {
    iniciales = nombre.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
  }

  if (iniciales.length >= 2 && iniciales.length <= 5) {
    return iniciales;
  }
  return nombre.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'CLUB';
}

// Función auxiliar para generar un ID numérico a partir del nombre del estadio si no existe idVenue
function obtenerStadiumApiId(item: any): number {
  if (item.idVenue && !isNaN(parseInt(item.idVenue))) {
    return parseInt(item.idVenue);
  }
  let hash = 0;
  const str = item.strStadium || item.strTeam + " Stadium";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 10000000);
}

export const sincronizarPartidos = async () => {
  const supabase = crearClienteNavegador();

  // 1. Iniciar sesión como administrador para contar con permisos de escritura (bypass RLS)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@ligapro.ec',
    password: 'admin123',
  });

  if (authError) {
    return { exito: false, error: `Autenticación de administrador fallida: ${authError.message}` };
  }

  // 2. Obtener competiciones para mapear a Serie A y Serie B
  const { data: competicionesDB, error: errComp } = await supabase
    .from('competiciones')
    .select('id, serie, temporada');

  if (errComp || !competicionesDB) {
    return { exito: false, error: `Error al obtener competiciones: ${errComp?.message}` };
  }

  const compA = competicionesDB.find(c => c.serie === 'A');
  const compB = competicionesDB.find(c => c.serie === 'B');

  // Definimos las ligas a procesar en TheSportsDB
  const ligas = [
    { nombreApi: 'Ecuadorian Serie A', serieDb: 'A', idApi: 4686 },
    { nombreApi: 'Ecuadorian Serie B', serieDb: 'B', idApi: 4957 }
  ];

  const estadiosAInsertar: any[] = [];
  const clubesAInsertar: any[] = [];
  const stadiumApiIdSet = new Set<number>();
  const clubApiIdSet = new Set<number>();

  // Estructura temporal para asociar club con su api_id de estadio antes de insertarlo
  const relacionClubEstadio: { club: any; estadioApiId: number }[] = [];

  // 3. Fase A: Obtener y procesar equipos y estadios
  for (const liga of ligas) {
    const urlEquipos = `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(liga.nombreApi)}`;
    try {
      const res = await fetch(urlEquipos);
      const data = await res.json();

      if (!data.teams || data.teams.length === 0) {
        console.warn(`No se encontraron equipos para la liga: ${liga.nombreApi}`);
        continue;
      }

      for (const team of data.teams) {
        const clubApiId = parseInt(team.idTeam);
        const estadioApiId = obtenerStadiumApiId(team);

        // A. Preparar Estadio (Evitar duplicados locales)
        if (!stadiumApiIdSet.has(estadioApiId)) {
          stadiumApiIdSet.add(estadioApiId);
          estadiosAInsertar.push({
            api_id: estadioApiId,
            nombre: team.strStadium || `${team.strTeam} Stadium`,
            ciudad: team.strLocation || 'Ecuador',
            capacidad: team.intStadiumCapacity ? parseInt(team.intStadiumCapacity) : 0,
            tipo_cesped: 'NATURAL',
            is_habilitado: true
          });
        }

        // B. Preparar Club (Evitar duplicados locales)
        if (!clubApiIdSet.has(clubApiId)) {
          clubApiIdSet.add(clubApiId);

          const clubObj = {
            api_id: clubApiId,
            nombre: team.strTeam,
            nombre_corto: team.strTeamShort || team.strTeam,
            abreviatura: generarAbreviatura(team.strTeam, team.strTeamShort),
            escudo_url: team.strBadge,
            ciudad: team.strLocation || 'Ecuador',
            fundacion: team.intFormedYear ? `${team.intFormedYear}-01-01` : null,
            serie: liga.serieDb,
            estado_control_economico: 'APROBADO',
            is_filial: false,
          };

          relacionClubEstadio.push({
            club: clubObj,
            estadioApiId: estadioApiId
          });
        }
      }
    } catch (e: any) {
      console.error(`Error al obtener equipos de la liga ${liga.nombreApi}:`, e);
    }
  }

  if (estadiosAInsertar.length === 0 || relacionClubEstadio.length === 0) {
    return { exito: false, error: 'No se pudieron extraer estadios o clubes de la API' };
  }

  // 4. Upsert Estadios en Supabase
  const { data: estadiosData, error: errEstadios } = await supabase
    .from('estadios')
    .upsert(estadiosAInsertar, { onConflict: 'api_id' })
    .select('id, api_id');

  if (errEstadios || !estadiosData) {
    return { exito: false, error: `Error al guardar estadios en la base de datos: ${errEstadios?.message}` };
  }

  // Mapear api_id del estadio a su ID UUID de la BD
  const estadioUuidMap = new Map<number, string>();
  for (const st of estadiosData) {
    if (st.api_id !== null) {
      estadioUuidMap.set(st.api_id, st.id);
    }
  }

  // 5. Vincular y preparar Clubes con estadio UUID
  const clubesFinales = relacionClubEstadio.map(item => {
    const estadioUuid = estadioUuidMap.get(item.estadioApiId) || null;
    return {
      ...item.club,
      estadio_id: estadioUuid
    };
  });

  // 6. Upsert Clubes en Supabase
  const { data: clubesData, error: errClubes } = await supabase
    .from('clubes')
    .upsert(clubesFinales, { onConflict: 'api_id' })
    .select('id, api_id');

  if (errClubes || !clubesData) {
    return { exito: false, error: `Error al guardar clubes en la base de datos: ${errClubes?.message}` };
  }

  // Mapear api_id del club a su ID UUID de la BD
  const clubUuidMap = new Map<number, string>();
  for (const cl of clubesData) {
    if (cl.api_id !== null) {
      clubUuidMap.set(cl.api_id, cl.id);
    }
  }

  // Mapa local de clubApiId -> estadioUuid
  const clubIdToStadiumIdMap = new Map<number, string | null>();
  for (const item of relacionClubEstadio) {
    const clubApiId = item.club.api_id;
    const estadioUuid = estadioUuidMap.get(item.estadioApiId) || null;
    clubIdToStadiumIdMap.set(clubApiId, estadioUuid);
  }

  // 7. Fase B: Obtener y procesar partidos (Eventos)
  const partidosAInsertar: any[] = [];
  const partidosConProblemas = [];

  for (const liga of ligas) {
    const compId = liga.serieDb === 'A' ? compA?.id : compB?.id;
    if (!compId) {
      console.warn(`No se encontró competición para la serie ${liga.serieDb}, saltando partidos.`);
      continue;
    }

    const urlEventos = `https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${liga.idApi}&s=2024`;
    try {
      const res = await fetch(urlEventos);
      const data = await res.json();

      if (!data.events || data.events.length === 0) {
        console.warn(`No se encontraron partidos para la liga ID: ${liga.idApi}`);
        continue;
      }

      for (const event of data.events) {
        const homeApiId = parseInt(event.idHomeTeam);
        const awayApiId = parseInt(event.idAwayTeam);
        const matchApiId = parseInt(event.idEvent);

        const localUuid = clubUuidMap.get(homeApiId);
        const visitanteUuid = clubUuidMap.get(awayApiId);

        if (!localUuid || !visitanteUuid) {
          partidosConProblemas.push({
            idEvent: event.idEvent,
            strEvent: event.strEvent,
            home: event.strHomeTeam,
            away: event.strAwayTeam
          });
          continue;
        }

        const jornada = event.intRound ? parseInt(event.intRound) : 1;
        const golesLocal = event.intHomeScore !== null ? parseInt(event.intHomeScore) : 0;
        const golesVisitante = event.intAwayScore !== null ? parseInt(event.intAwayScore) : 0;

        // Determinar fase
        let fase = 'FASE_UNO';
        if (liga.serieDb === 'A') {
          fase = jornada <= 15 ? 'FASE_UNO' : 'FASE_DOS';
        } else {
          fase = 'CLASIFICACION';
        }

        // Obtener el estadio del club local
        const estadioUuid = clubIdToStadiumIdMap.get(homeApiId) || null;

        // Validar fecha y hora
        let fechaHoraStr = new Date().toISOString();
        if (event.strTimestamp) {
          fechaHoraStr = new Date(event.strTimestamp + 'Z').toISOString();
        } else if (event.dateEvent) {
          const timePart = event.strTime || '00:00:00';
          fechaHoraStr = new Date(`${event.dateEvent}T${timePart}Z`).toISOString();
        }

        partidosAInsertar.push({
          api_id: matchApiId,
          competicion_id: compId,
          fase: fase,
          jornada: jornada,
          fecha_hora: fechaHoraStr,
          club_local_id: localUuid,
          club_visitante_id: visitanteUuid,
          estadio_id: estadioUuid,
          goles_local: golesLocal,
          goles_visitante: golesVisitante,
          estado: mapearEstado(event.strStatus)
        });
      }
    } catch (e: any) {
      console.error(`Error al obtener partidos para la liga ID ${liga.idApi}:`, e);
    }
  }

  if (partidosConProblemas.length > 0) {
    console.warn('Partidos omitidos por falta de asociación de clubes:', partidosConProblemas);
  }

  if (partidosAInsertar.length === 0) {
    return {
      exito: true,
      mensaje: `Sincronización de catálogos completada (Estadios: ${estadiosAInsertar.length}, Clubes: ${relacionClubEstadio.length}), pero no se encontraron partidos válidos para sincronizar.`,
      cantidad: 0
    };
  }

  // 8. Upsert Partidos en Supabase
  const { error: errPartidos } = await supabase
    .from('partidos')
    .upsert(partidosAInsertar, { onConflict: 'api_id' });

  if (errPartidos) {
    return {
      exito: false,
      error: `Error al guardar los partidos en la base de datos: ${errPartidos.message}`
    };
  }

  return {
    exito: true,
    mensaje: `¡Sincronización multinivel completada con éxito! Se sincronizaron ${estadiosAInsertar.length} estadios, ${relacionClubEstadio.length} clubes y ${partidosAInsertar.length} partidos (Serie A y Serie B).`,
    cantidad: partidosAInsertar.length
  };
};
