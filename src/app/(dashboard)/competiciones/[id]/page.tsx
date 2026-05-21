'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Trophy, ArrowLeft, TrendingUp, Calendar, BarChart3,
  ChevronLeft, ChevronRight, Star, Target, Users,
  Shield, Award, Loader2, MapPin, Clock, Eye
} from 'lucide-react';

// Interfaces para tipado
interface ClubData {
  nombre: string;
  abreviatura: string;
  color_principal: string;
  color_secundario: string;
}

interface EquipoPosicion {
  posicion: number;
  club_id: string;
  club: ClubData;
  partidos_jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  goles_favor: number;
  goles_contra: number;
  saldo_goles: number;
  goles_visitante: number;
  puntos: number;
}

interface Partido {
  id: string;
  jornada: number;
  fecha_hora: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: 'FINALIZADO' | 'EN_CURSO' | 'PROGRAMADO' | 'SUSPENDIDO';
  arbitro: string;
  local: ClubData & { estadio?: { nombre: string; ciudad: string } };
  visitante: ClubData;
}

interface Goleador {
  nombre: string;
  club: string;
  goles: number;
  asistencias: number;
}

interface Asistidor {
  nombre: string;
  club: string;
  asistencias: number;
}

const mockGoleadores: Goleador[] = [
  { nombre: 'Junior Sornoza', club: 'Independiente del Valle', goles: 12, asistencias: 5 },
  { nombre: 'Damián Díaz', club: 'Barcelona SC', goles: 10, asistencias: 7 },
  { nombre: 'Facundo Martínez', club: 'LDU Quito', goles: 9, asistencias: 3 },
  { nombre: 'Jhoanner Chávez', club: 'Emelec', goles: 8, asistencias: 4 },
  { nombre: 'Bryan Caicedo', club: 'Deportivo Cuenca', goles: 7, asistencias: 2 },
  { nombre: 'Álex Arce', club: 'El Nacional', goles: 7, asistencias: 1 },
  { nombre: 'Steven Tapiero', club: 'Aucas', goles: 6, asistencias: 3 },
  { nombre: 'Jonathan Betancourt', club: 'Mushuc Runa', goles: 6, asistencias: 6 },
  { nombre: 'Luis Amarilla', club: 'Delfín', goles: 5, asistencias: 2 },
  { nombre: 'Fernando Gaibor', club: 'Técnico Universitario', goles: 5, asistencias: 4 },
];

const mockAsistidores: Asistidor[] = [
  { nombre: 'Damián Díaz', club: 'Barcelona SC', asistencias: 7 },
  { nombre: 'Jonathan Betancourt', club: 'Mushuc Runa', asistencias: 6 },
  { nombre: 'Junior Sornoza', club: 'Independiente del Valle', asistencias: 5 },
  { nombre: 'Lorenzo Faravelli', club: 'LDU Quito', asistencias: 5 },
  { nombre: 'Fernando Gaibor', club: 'Técnico Universitario', asistencias: 4 },
  { nombre: 'Jhoanner Chávez', club: 'Emelec', asistencias: 4 },
  { nombre: 'Dixon Arroyo', club: 'Deportivo Cuenca', asistencias: 3 },
  { nombre: 'Steven Tapiero', club: 'Aucas', asistencias: 3 },
];

// Mapa de etiquetas de fase
const etiquetasFase: Record<string, string> = {
  FASE_UNO: 'Fase Uno',
  FASE_DOS: 'Fase Dos',
  CLASIFICACION: 'Clasificación',
  PLAYOFF: 'Playoff',
  FINAL: 'Final',
};

// Colores de estado
const estadoConfig: Record<string, { bg: string; text: string; label: string }> = {
  FINALIZADO: { bg: '#E5E7EB', text: '#374151', label: 'Finalizado' },
  EN_CURSO: { bg: '#DEF7EC', text: '#03543F', label: 'En curso' },
  PROGRAMADO: { bg: '#DBEAFE', text: '#1E40AF', label: 'Programado' },
  SUSPENDIDO: { bg: '#FEE2E2', text: '#991B1B', label: 'Suspendido' },
};

type TabDetalle = 'posiciones' | 'fixture' | 'estadisticas';

export default function PaginaDetalleCompeticion() {
  const { id } = useParams();
  const [tabActiva, setTabActiva] = useState<TabDetalle>('posiciones');
  const [jornadaActual, setJornadaActual] = useState(1);
  const [animado, setAnimado] = useState(false);

  // Estados de datos Supabase
  const [competicion, setCompeticion] = useState<any>(null);
  const [tablaPosiciones, setTablaPosiciones] = useState<EquipoPosicion[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [goleadores, setGoleadores] = useState<Goleador[]>(mockGoleadores);
  const [asistidores, setAsistidores] = useState<Asistidor[]>(mockAsistidores);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setAnimado(true);
    if (!id) return;

    async function fetchDatos() {
      try {
        const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());

        // 1. Obtener detalles de la competición
        const { data: compData, error: compErr } = await supabase
          .from('competiciones')
          .select('*')
          .eq('id', id)
          .single();

        if (compErr || !compData) {
          console.error('Error fetching competition:', compErr);
          setCargando(false);
          return;
        }
        setCompeticion(compData);

        // 2. Obtener la tabla de posiciones calculada para la fase actual
        const { data: tablaData, error: tablaErr } = await supabase
          .from('tabla_posiciones')
          .select(`
            *,
            club:club_id (
              nombre,
              abreviatura,
              color_principal,
              color_secundario
            )
          `)
          .eq('competicion_id', id)
          .eq('fase', compData.fase_actual)
          .order('posicion', { ascending: true });

        if (tablaErr) {
          console.error('Error fetching standings:', tablaErr);
        } else if (tablaData) {
          setTablaPosiciones(tablaData as unknown as EquipoPosicion[]);
        }

        // 3. Obtener fixture de la competición
        const { data: partidosData, error: partidosErr } = await supabase
          .from('partidos')
          .select(`
            *,
            arbitro:arbitro_principal,
            local:club_local_id (
              nombre,
              abreviatura,
              color_principal,
              color_secundario,
              estadio:estadio_id ( nombre, ciudad )
            ),
            visitante:club_visitante_id (
              nombre,
              abreviatura,
              color_principal,
              color_secundario
            )
          `)
          .eq('competicion_id', id)
          .order('jornada', { ascending: true })
          .order('fecha_hora', { ascending: true });

        if (partidosErr) {
          console.error('Error fetching partidos:', partidosErr);
        } else if (partidosData) {
          setPartidos(partidosData as unknown as Partido[]);
          
          // Calcular la jornada actual por defecto
          const primerPartidoNoFinalizado = partidosData.find((p: any) => p.estado !== 'FINALIZADO');
          if (primerPartidoNoFinalizado) {
            setJornadaActual(primerPartidoNoFinalizado.jornada);
          } else if (partidosData.length > 0) {
            // Si todos finalizaron, mostrar la última jornada
            setJornadaActual(Math.max(...partidosData.map((p: any) => p.jornada)));
          }
          
          // 4. Intentar calcular goleadores/asistidores de incidencias
          const matchIds = partidosData?.map((p: any) => p.id) || [];
          if (matchIds.length > 0) {
            const { data: incs, error: incsErr } = await supabase
              .from('incidencias')
              .select(`
                *,
                jugador:jugador_id ( nombre_completo ),
                jugador_entra:jugador_entra_id ( nombre_completo ),
                club:club_id ( nombre )
              `)
              .in('partido_id', matchIds)
              .eq('tipo', 'GOL');

            if (incs && incs.length > 0) {
              const golesMap: Record<string, { jugador: string; club: string; goles: number; asistencias: number }> = {};
              const asistenciasMap: Record<string, { jugador: string; club: string; asistencias: number }> = {};

              incs.forEach((inc: any) => {
                const jugador = inc.jugador?.nombre_completo || 'Jugador';
                const club = inc.club?.nombre || 'Club';

                if (!golesMap[jugador]) {
                  golesMap[jugador] = { jugador, club, goles: 0, asistencias: 0 };
                }
                golesMap[jugador].goles += 1;

                if (inc.jugador_entra?.nombre_completo) {
                  const asistente = inc.jugador_entra.nombre_completo;
                  golesMap[jugador].asistencias += 1;
                  
                  if (!asistenciasMap[asistente]) {
                    asistenciasMap[asistente] = { jugador: asistente, club, asistencias: 0 };
                  }
                  asistenciasMap[asistente].asistencias += 1;
                }
              });

              const dynamicGoleadores = Object.values(golesMap)
                .sort((a, b) => b.goles - a.goles || b.asistencias - a.asistencias)
                .slice(0, 10)
                .map(g => ({ nombre: g.jugador, club: g.club, goles: g.goles, asistencias: g.asistencias }));

              const dynamicAsistidores = Object.values(asistenciasMap)
                .sort((a, b) => b.asistencias - a.asistencias)
                .slice(0, 10)
                .map(a => ({ nombre: a.jugador, club: a.club, asistencias: a.asistencias }));

              if (dynamicGoleadores.length > 0) {
                setGoleadores(dynamicGoleadores);
              }
              if (dynamicAsistidores.length > 0) {
                setAsistidores(dynamicAsistidores);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setCargando(false);
      }
    }

    fetchDatos();
  }, [id]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-[#D4A843]" size={40} />
        <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Cargando detalles de competición...</p>
      </div>
    );
  }

  if (!competicion) {
    return (
      <div className="text-center py-12">
        <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>Competición no encontrada</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>El identificador proporcionado no corresponde a ningún campeonato registrado.</p>
        <Link href="/competiciones" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm no-underline">
          <ArrowLeft size={16} /> Volver a Competiciones
        </Link>
      </div>
    );
  }

  const partidosJornada = partidos.filter(p => p.jornada === jornadaActual);
  const maxJornadas = competicion.serie === 'A' ? 30 : 36;

  const tabs: { valor: TabDetalle; etiqueta: string; icono: typeof TrendingUp }[] = [
    { valor: 'posiciones', etiqueta: 'Tabla de Posiciones', icono: TrendingUp },
    { valor: 'fixture', etiqueta: 'Fixture', icono: Calendar },
    { valor: 'estadisticas', etiqueta: 'Estadísticas', icono: BarChart3 },
  ];

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Cabecera */}
      <div className={`transition-all duration-500 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <Link
          href="/competiciones"
          className="inline-flex items-center gap-2 text-sm font-medium no-underline mb-4 transition-colors"
          style={{ color: 'var(--texto-secundario)' }}
        >
          <ArrowLeft size={16} />
          Volver a Competiciones
        </Link>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
          }}
        >
          <div
            className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{
              background: competicion.serie === 'A' 
                ? 'linear-gradient(135deg, #D4A843, #B8922F)' 
                : 'linear-gradient(135deg, #2980B9, #1F6691)'
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)' }}
              >
                <Trophy size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{competicion.nombre}</h1>
                <p className="text-white/70 text-sm mt-0.5">
                  {competicion.serie === 'A' ? 'Primera División' : 'Segunda División'} • {etiquetasFase[competicion.fase_actual] || competicion.fase_actual} • Temporada {competicion.temporada}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <Users size={14} />
                {competicion.num_equipos} equipos
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: competicion.estado === 'EN_CURSO' ? '#DEF7EC' : '#E5E7EB',
                  color: competicion.estado === 'EN_CURSO' ? '#03543F' : '#374151'
                }}
              >
                {competicion.estado === 'EN_CURSO' ? 'Activa' : 'Finalizada'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 pb-0 overflow-x-auto">
            {tabs.map((tab) => {
              const Icono = tab.icono;
              return (
                <button
                  key={tab.valor}
                  onClick={() => setTabActiva(tab.valor)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg border-b-2"
                  style={{
                    color: tabActiva === tab.valor ? '#D4A843' : 'var(--texto-secundario)',
                    borderBottomColor: tabActiva === tab.valor ? '#D4A843' : 'transparent',
                    background: tabActiva === tab.valor ? '#FEF3C7' : 'transparent',
                  }}
                >
                  <Icono size={16} />
                  {tab.etiqueta}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ TAB: TABLA DE POSICIONES ============ */}
      {tabActiva === 'posiciones' && (
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3.5"
            style={{ background: 'linear-gradient(135deg, #1B2A4A, #111D35)' }}
          >
            <TrendingUp size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Tabla de Posiciones - {etiquetasFase[competicion.fase_actual] || competicion.fase_actual}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--fondo-principal)', borderBottom: '1px solid var(--borde-suave)' }}>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Pos</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Club</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>PJ</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>G</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>E</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>P</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>GF</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>GC</th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>DG</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {tablaPosiciones.map((equipo) => {
                  const esZonaClasificacion = competicion.serie === 'A' ? equipo.posicion === 1 : equipo.posicion <= 2;
                  const esZonaDescenso = equipo.posicion >= (competicion.num_equipos - 1);

                  let fondoFila = 'transparent';
                  let bordeIzquierdo = 'none';
                  if (esZonaClasificacion) {
                    fondoFila = 'rgba(212, 168, 67, 0.08)';
                    bordeIzquierdo = '4px solid #D4A843';
                  } else if (esZonaDescenso) {
                    fondoFila = 'rgba(192, 57, 43, 0.06)';
                    bordeIzquierdo = '4px solid #C0392B';
                  }

                  const colorFondoClub = equipo.club.color_principal || '#A0AEC0';

                  return (
                    <tr
                      key={equipo.posicion}
                      className="transition-colors hover:bg-gray-50/50"
                      style={{
                        background: fondoFila,
                        borderBottom: '1px solid var(--borde-suave)',
                        borderLeft: bordeIzquierdo,
                      }}
                    >
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            width: '28px',
                            height: '28px',
                            background: esZonaClasificacion ? '#D4A843' : esZonaDescenso ? '#C0392B' : 'var(--fondo-principal)',
                            color: esZonaClasificacion || esZonaDescenso ? 'white' : 'var(--texto-primario)',
                          }}
                        >
                          {equipo.posicion}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                            style={{
                              width: '32px',
                              height: '32px',
                              background: colorFondoClub,
                              border: colorFondoClub === '#FFFFFF' ? '2px solid #E5E7EB' : 'none',
                              color: colorFondoClub === '#FFFFFF' || colorFondoClub === '#FFD700' || colorFondoClub === '#F1C40F' ? '#1A1A2E' : 'white',
                            }}
                          >
                            {equipo.club.abreviatura}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--texto-primario)' }}>
                            {equipo.club.nombre}
                          </span>
                          {esZonaClasificacion && <Star size={14} style={{ color: '#D4A843' }} />}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center" style={{ color: 'var(--texto-secundario)' }}>{equipo.partidos_jugados}</td>
                      <td className="px-3 py-3 text-center font-medium" style={{ color: '#27AE60' }}>{equipo.ganados}</td>
                      <td className="px-3 py-3 text-center" style={{ color: 'var(--texto-secundario)' }}>{equipo.empatados}</td>
                      <td className="px-3 py-3 text-center" style={{ color: '#C0392B' }}>{equipo.perdidos}</td>
                      <td className="px-3 py-3 text-center" style={{ color: 'var(--texto-secundario)' }}>{equipo.goles_favor}</td>
                      <td className="px-3 py-3 text-center" style={{ color: 'var(--texto-secundario)' }}>{equipo.goles_contra}</td>
                      <td className="px-3 py-3 text-center font-medium" style={{ color: equipo.saldo_goles > 0 ? '#27AE60' : equipo.saldo_goles < 0 ? '#C0392B' : 'var(--texto-secundario)' }}>
                        {equipo.saldo_goles > 0 ? `+${equipo.saldo_goles}` : equipo.saldo_goles}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center text-sm font-bold" style={{ color: 'var(--texto-primario)' }}>
                          {equipo.puntos}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div className="px-5 py-3 flex items-center gap-6" style={{ borderTop: '1px solid var(--borde-suave)', background: 'var(--fondo-principal)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#D4A843' }} />
              <span className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                {competicion.serie === 'A' ? 'Clasificación a Final / Libertadores' : 'Zona de Ascenso (Serie A)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#C0392B' }} />
              <span className="text-xs" style={{ color: 'var(--texto-secundario)' }}>Zona de descenso</span>
            </div>
          </div>
        </div>
      )}

      {/* ============ TAB: FIXTURE ============ */}
      {tabActiva === 'fixture' && (
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              background: competicion.serie === 'A' 
                ? 'linear-gradient(135deg, #D4A843, #B8922F)' 
                : 'linear-gradient(135deg, #2980B9, #1F6691)'
            }}
          >
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-white" />
              <h2 className="text-white font-semibold text-sm">Fixture - Jornada {jornadaActual}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setJornadaActual(Math.max(1, jornadaActual - 1))}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                disabled={jornadaActual <= 1}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-white text-sm font-medium px-3">
                Jornada {jornadaActual}
              </span>
              <button
                onClick={() => setJornadaActual(Math.min(maxJornadas, jornadaActual + 1))}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                disabled={jornadaActual >= maxJornadas}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {partidosJornada.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar size={40} style={{ color: 'var(--texto-terciario)' }} />
                <p className="text-sm font-medium mt-3" style={{ color: 'var(--texto-secundario)' }}>
                  No hay partidos para esta jornada
                </p>
              </div>
            ) : (
              partidosJornada.map((partido) => {
                const config = estadoConfig[partido.estado] || { bg: '#E5E7EB', text: '#374151', label: partido.estado };
                const localColor = partido.local.color_principal || '#A0AEC0';
                const visitanteColor = partido.visitante.color_principal || '#A0AEC0';

                return (
                  <div
                    key={partido.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl transition-colors hover:bg-gray-50/50 gap-4"
                    style={{
                      border: '1px solid var(--borde-suave)',
                      background: partido.estado === 'EN_CURSO' ? 'rgba(39, 174, 96, 0.04)' : 'transparent',
                    }}
                  >
                    {/* Fecha y hora */}
                    <div className="text-left sm:text-center min-w-[100px]">
                      <p className="text-xs font-semibold" style={{ color: 'var(--texto-secundario)' }}>
                        {new Date(partido.fecha_hora).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                        {new Date(partido.fecha_hora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                    </div>

                    {/* Equipos y marcador */}
                    <div className="flex items-center gap-4 flex-1 justify-center">
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-sm font-semibold text-right hidden md:inline" style={{ color: 'var(--texto-primario)' }}>
                          {partido.local.nombre}
                        </span>
                        <div
                          className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                          style={{
                            width: '32px',
                            height: '32px',
                            background: localColor,
                            color: localColor === '#FFFFFF' || localColor === '#FFD700' || localColor === '#F1C40F' ? '#1A1A2E' : 'white',
                            border: localColor === '#FFFFFF' ? '2px solid #E5E7EB' : 'none'
                          }}
                          title={partido.local.nombre}
                        >
                          {partido.local.abreviatura}
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-center rounded-lg px-3 py-1.5 min-w-[70px]"
                        style={{
                          background: partido.estado === 'FINALIZADO' ? 'var(--ligapro-navy)' : 'var(--fondo-principal)',
                          color: partido.estado === 'FINALIZADO' ? 'white' : 'var(--texto-secundario)',
                        }}
                      >
                        <span className="text-sm font-bold">
                          {partido.goles_local !== null ? `${partido.goles_local} - ${partido.goles_visitante}` : 'vs'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-1 justify-start">
                        <div
                          className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                          style={{
                            width: '32px',
                            height: '32px',
                            background: visitanteColor,
                            color: visitanteColor === '#FFFFFF' || visitanteColor === '#FFD700' || visitanteColor === '#F1C40F' ? '#1A1A2E' : 'white',
                            border: visitanteColor === '#FFFFFF' ? '2px solid #E5E7EB' : 'none'
                          }}
                          title={partido.visitante.nombre}
                        >
                          {partido.visitante.abreviatura}
                        </div>
                        <span className="text-sm font-semibold text-left hidden md:inline" style={{ color: 'var(--texto-primario)' }}>
                          {partido.visitante.nombre}
                        </span>
                      </div>
                    </div>

                    {/* Estado y estadio */}
                    <div className="text-left sm:text-right min-w-[140px]">
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: config.bg,
                          color: config.text,
                        }}
                      >
                        {config.label}
                      </span>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--texto-terciario)' }}>
                        {partido.local.estadio?.nombre || 'Por definir'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============ TAB: ESTADÍSTICAS ============ */}
      {tabActiva === 'estadisticas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Goleadores */}
          <div
            className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
            style={{
              background: 'var(--fondo-tarjeta)',
              boxShadow: 'var(--sombra-tarjeta)',
              border: '1px solid var(--borde-suave)',
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3.5"
              style={{ background: 'linear-gradient(135deg, #D4A843, #B8922F)' }}
            >
              <Target size={18} className="text-white" />
              <h2 className="text-white font-semibold text-sm">Goleadores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--fondo-principal)', borderBottom: '1px solid var(--borde-suave)' }}>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Jugador</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Club</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Goles</th>
                  </tr>
                </thead>
                <tbody>
                  {goleadores.map((g, i) => (
                    <tr key={i} className="transition-colors hover:bg-gray-50/50" style={{ borderBottom: '1px solid var(--borde-suave)' }}>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            width: '24px',
                            height: '24px',
                            background: i === 0 ? '#D4A843' : i === 1 ? '#A0AEC0' : i === 2 ? '#CD7F32' : 'var(--fondo-principal)',
                            color: i < 3 ? 'white' : 'var(--texto-secundario)',
                          }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--texto-primario)' }}>
                        {g.nombre}
                        {i === 0 && <Award size={14} className="inline ml-1.5" style={{ color: '#D4A843' }} />}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{g.club}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#FEF3C7', color: '#92400E' }}>
                          {g.goles}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asistidores */}
          <div
            className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
            style={{
              background: 'var(--fondo-tarjeta)',
              boxShadow: 'var(--sombra-tarjeta)',
              border: '1px solid var(--borde-suave)',
              animationDelay: '100ms',
              animationFillMode: 'both',
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3.5"
              style={{ background: 'linear-gradient(135deg, #2980B9, #1F6691)' }}
            >
              <Shield size={18} className="text-white" />
              <h2 className="text-white font-semibold text-sm">Asistencias</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--fondo-principal)', borderBottom: '1px solid var(--borde-suave)' }}>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Jugador</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Club</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase" style={{ color: 'var(--texto-secundario)' }}>Asist.</th>
                  </tr>
                </thead>
                <tbody>
                  {asistidores.map((a, i) => (
                    <tr key={i} className="transition-colors hover:bg-gray-50/50" style={{ borderBottom: '1px solid var(--borde-suave)' }}>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            width: '24px',
                            height: '24px',
                            background: i === 0 ? '#2980B9' : i === 1 ? '#A0AEC0' : i === 2 ? '#CD7F32' : 'var(--fondo-principal)',
                            color: i < 3 ? 'white' : 'var(--texto-secundario)',
                          }}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--texto-primario)' }}>
                        {a.nombre}
                        {i === 0 && <Award size={14} className="inline ml-1.5" style={{ color: '#2980B9' }} />}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{a.club}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                          {a.asistencias}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
