'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy, ArrowLeft, Scale, ChevronRight, CheckCircle2,
  Circle, Target, Users, Minus, ArrowUpDown,
  Play, RotateCcw, Info, AlertTriangle, Zap, Loader2, Award
} from 'lucide-react';

interface ClubData {
  nombre: string;
  abreviatura: string;
  color_principal: string;
  color_secundario: string;
}

interface EquipoTabla {
  club_id: string;
  puntos: number;
  saldo_goles: number;
  goles_favor: number;
  goles_contra: number;
  goles_visitante: number;
  posicion: number;
  club: ClubData;
}

interface Partido {
  id: string;
  jornada: number;
  fecha_hora: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: 'FINALIZADO' | 'EN_CURSO' | 'PROGRAMADO' | 'SUSPENDIDO';
  club_local_id: string;
  club_visitante_id: string;
}

interface PasoResolucion {
  criterio: number;
  titulo: string;
  detalle: string;
  resultado: 'RESUELTO' | 'EMPATE_PERSISTE' | 'PENDIENTE';
  ganador?: string;
  valores: { equipo: string; valor: string }[];
}

// Criterios Serie A
const criteriosSerieA = [
  { numero: 1, titulo: 'Diferencia de gol general', descripcion: 'Se compara la diferencia entre goles a favor y goles en contra de toda la fase.', icono: Target, color: '#D4A843' },
  { numero: 2, titulo: 'Goles a favor general', descripcion: 'Se compara el total de goles anotados por cada equipo en toda la fase.', icono: Zap, color: '#27AE60' },
  { numero: 3, titulo: 'Resultado en enfrentamientos directos', descripcion: 'Se revisan los puntos obtenidos en los partidos directos entre los equipos empatados.', icono: Users, color: '#2980B9' },
  { numero: 4, titulo: 'Diferencia de gol en enfrentamientos directos', descripcion: 'Se compara la diferencia de gol únicamente en los partidos disputados entre sí.', icono: ArrowUpDown, color: '#E67E22' },
  { numero: 5, titulo: 'Sorteo Público', descripcion: 'Criterio final de sorteo por el Comité Ejecutivo de la LigaPro si persiste la igualdad.', icono: AlertTriangle, color: '#C0392B' },
];

// Criterios Serie B
const criteriosSerieB = [
  { numero: 1, titulo: 'Diferencia de gol general', descripcion: 'Se compara la diferencia entre goles a favor y goles en contra de toda la fase.', icono: Target, color: '#D4A843' },
  { numero: 2, titulo: 'Goles a favor general', descripcion: 'Se compara el total de goles anotados por cada equipo en toda la fase.', icono: Zap, color: '#27AE60' },
  { numero: 3, titulo: 'Mayor cantidad de goles de visitante', descripcion: 'Se compara el total de goles anotados en condición de visitante.', icono: Zap, color: '#A29BFE' },
  { numero: 4, titulo: 'Resultado en enfrentamientos directos', descripcion: 'Se revisan los puntos obtenidos en los partidos directos entre los equipos empatados.', icono: Users, color: '#2980B9' },
  { numero: 5, titulo: 'Diferencia de gol en enfrentamientos directos', descripcion: 'Se compara la diferencia de gol únicamente en los partidos disputados entre sí.', icono: ArrowUpDown, color: '#E67E22' },
  { numero: 6, titulo: 'Sorteo Público', descripcion: 'Criterio final de sorteo por el Comité Ejecutivo de la LigaPro si persiste la igualdad.', icono: AlertTriangle, color: '#C0392B' },
];

export default function PaginaDesempate() {
  const [competiciones, setCompeticiones] = useState<any[]>([]);
  const [competicionSeleccionada, setCompeticionSeleccionada] = useState<string>('');
  const [standings, setStandings] = useState<EquipoTabla[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados de simulación
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<string[]>([]);
  const [calculoActivo, setCalculoActivo] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  const [pasosResolucion, setPasosResolucion] = useState<PasoResolucion[]>([]);
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    setAnimado(true);
    async function fetchCompeticiones() {
      try {
        const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
        const { data, error } = await supabase
          .from('competiciones')
          .select('*')
          .order('temporada', { ascending: false });

        if (data && data.length > 0) {
          setCompeticiones(data);
          setCompeticionSeleccionada(data[0].id);
        } else {
          setCargando(false);
        }
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setCargando(false);
      }
    }
    fetchCompeticiones();
  }, []);

  useEffect(() => {
    if (!competicionSeleccionada) return;

    async function fetchDatos() {
      setCargando(true);
      try {
        const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());

        // 1. Obtener la competición seleccionada para saber su fase_actual
        const comp = competiciones.find(c => c.id === competicionSeleccionada);
        if (!comp) return;

        // 2. Obtener posiciones
        const { data: standingsData, error: standErr } = await supabase
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
          .eq('competicion_id', competicionSeleccionada)
          .eq('fase', comp.fase_actual)
          .order('posicion', { ascending: true });

        if (standingsData) {
          setStandings(standingsData as unknown as EquipoTabla[]);

          // Agrupar por puntos para buscar empates reales por defecto
          const gruposPuntos: Record<number, EquipoTabla[]> = {};
          standingsData.forEach((team: any) => {
            if (!gruposPuntos[team.puntos]) gruposPuntos[team.puntos] = [];
            gruposPuntos[team.puntos].push(team);
          });

          // Encontrar el primer empate real de 2 o más equipos
          const empateReal = Object.values(gruposPuntos).find(g => g.length >= 2);
          if (empateReal) {
            setEquiposSeleccionados(empateReal.map(t => t.club_id));
          } else if (standingsData.length >= 2) {
            // Si no hay empates naturales, seleccionar los dos primeros equipos
            setEquiposSeleccionados([standingsData[0].club_id, standingsData[1].club_id]);
          }
        }

        // 3. Obtener partidos de la competición para H2H
        const { data: partidosData, error: partErr } = await supabase
          .from('partidos')
          .select('*')
          .eq('competicion_id', competicionSeleccionada)
          .eq('fase', comp.fase_actual);

        if (partidosData) {
          setPartidos(partidosData as unknown as Partido[]);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setCargando(false);
      }
    }

    fetchDatos();
  }, [competicionSeleccionada, competiciones]);

  const competicionInfo = competiciones.find(c => c.id === competicionSeleccionada);
  const criterios = competicionInfo?.serie === 'B' ? criteriosSerieB : criteriosSerieA;

  // Manejo de la selección manual de equipos para simular
  const toggleSeleccionEquipo = (clubId: string) => {
    if (calculoActivo) return;
    setEquiposSeleccionados(prev => {
      if (prev.includes(clubId)) {
        if (prev.length <= 2) return prev; // mínimo 2 equipos
        return prev.filter(id => id !== clubId);
      } else {
        return [...prev, clubId];
      }
    });
  };

  const ejecutarCalculo = () => {
    if (equiposSeleccionados.length < 2) return;

    // Calcular el desempate usando el algoritmo reglamentario
    const equiposFiltrados = standings.filter(t => equiposSeleccionados.includes(t.club_id));
    const serie = competicionInfo?.serie || 'A';
    
    // Algoritmo paso a paso
    const pasos: PasoResolucion[] = [];
    let equiposRestantes = [...equiposFiltrados];

    // Criterio 1: Diferencia de gol general
    const dgValores = equiposRestantes.map(e => ({ equipo: e.club.nombre, valor: e.saldo_goles }));
    const maxDG = Math.max(...equiposRestantes.map(e => e.saldo_goles));
    const equiposConMaxDG = equiposRestantes.filter(e => e.saldo_goles === maxDG);
    
    pasos.push({
      criterio: 1,
      titulo: 'Diferencia de Goles General',
      valores: dgValores.map(v => ({ equipo: v.equipo, valor: (v.valor > 0 ? '+' : '') + v.valor })),
      resultado: equiposConMaxDG.length === 1 ? 'RESUELTO' : 'EMPATE_PERSISTE',
      ganador: equiposConMaxDG.length === 1 ? equiposConMaxDG[0].club.nombre : undefined,
      detalle: equiposConMaxDG.length === 1 
        ? `${equiposConMaxDG[0].club.nombre} tiene mejor diferencia de goles (${maxDG}).`
        : `El empate persiste entre ${equiposConMaxDG.map(e => e.club.nombre).join(', ')} con diferencia de goles de ${maxDG}.`
    });

    if (equiposConMaxDG.length > 1) {
      equiposRestantes = equiposConMaxDG;

      // Criterio 2: Goles a favor general
      const gfValores = equiposRestantes.map(e => ({ equipo: e.club.nombre, valor: e.goles_favor }));
      const maxGF = Math.max(...equiposRestantes.map(e => e.goles_favor));
      const equiposConMaxGF = equiposRestantes.filter(e => e.goles_favor === maxGF);
      
      pasos.push({
        criterio: 2,
        titulo: 'Mayor número de Goles a Favor',
        valores: gfValores.map(v => ({ equipo: v.equipo, valor: `${v.valor} goles` })),
        resultado: equiposConMaxGF.length === 1 ? 'RESUELTO' : 'EMPATE_PERSISTE',
        ganador: equiposConMaxGF.length === 1 ? equiposConMaxGF[0].club.nombre : undefined,
        detalle: equiposConMaxGF.length === 1 
          ? `${equiposConMaxGF[0].club.nombre} anotó más goles a favor (${maxGF}).`
          : `El empate persiste entre ${equiposConMaxGF.map(e => e.club.nombre).join(', ')} con ${maxGF} goles a favor.`
      });

      if (equiposConMaxGF.length > 1) {
        equiposRestantes = equiposConMaxGF;
        let criterioActualNum = 3;

        // Criterio 3 (Solo Serie B): Goles de visitante general
        if (serie === 'B') {
          const gvValores = equiposRestantes.map(e => ({ equipo: e.club.nombre, valor: e.goles_visitante }));
          const maxGV = Math.max(...equiposRestantes.map(e => e.goles_visitante));
          const equiposConMaxGV = equiposRestantes.filter(e => e.goles_visitante === maxGV);
          
          pasos.push({
            criterio: criterioActualNum,
            titulo: 'Mayor número de Goles de Visitante',
            valores: gvValores.map(v => ({ equipo: v.equipo, valor: `${v.valor} goles` })),
            resultado: equiposConMaxGV.length === 1 ? 'RESUELTO' : 'EMPATE_PERSISTE',
            ganador: equiposConMaxGV.length === 1 ? equiposConMaxGV[0].club.nombre : undefined,
            detalle: equiposConMaxGV.length === 1 
              ? `${equiposConMaxGV[0].club.nombre} anotó más goles de visitante (${maxGV}).`
              : `El empate persiste entre ${equiposConMaxGV.map(e => e.club.nombre).join(', ')} con ${maxGV} goles de visitante.`
          });
          criterioActualNum++;

          if (equiposConMaxGV.length > 1) {
            equiposRestantes = equiposConMaxGV;
          }
        }

        // Criterios H2H (Enfrentamientos directos)
        if (equiposRestantes.length > 1) {
          const idsEmpatados = equiposRestantes.map(e => e.club_id);
          const partidosDirectos = partidos.filter(p => 
            p.estado === 'FINALIZADO' &&
            idsEmpatados.includes(p.club_local_id) && 
            idsEmpatados.includes(p.club_visitante_id)
          );

          const ptsDirectos: Record<string, number> = {};
          const gdDirectos: Record<string, number> = {};
          
          idsEmpatados.forEach(id => {
            ptsDirectos[id] = 0;
            gdDirectos[id] = 0;
          });

          partidosDirectos.forEach(p => {
            const gl = p.goles_local || 0;
            const gv = p.goles_visitante || 0;
            
            if (gl > gv) {
              ptsDirectos[p.club_local_id] += 3;
            } else if (gl < gv) {
              ptsDirectos[p.club_visitante_id] += 3;
            } else {
              ptsDirectos[p.club_local_id] += 1;
              ptsDirectos[p.club_visitante_id] += 1;
            }

            gdDirectos[p.club_local_id] += (gl - gv);
            gdDirectos[p.club_visitante_id] += (gv - gl);
          });

          // Puntos H2H
          const h2hPtsValores = equiposRestantes.map(e => ({ equipo: e.club.nombre, valor: `${ptsDirectos[e.club_id]} pts` }));
          const maxH2HPts = Math.max(...equiposRestantes.map(e => ptsDirectos[e.club_id]));
          const equiposConMaxH2HPts = equiposRestantes.filter(e => ptsDirectos[e.club_id] === maxH2HPts);

          pasos.push({
            criterio: criterioActualNum,
            titulo: 'Puntos en Enfrentamientos Directos',
            valores: h2hPtsValores.map(v => ({ equipo: v.equipo, valor: v.valor })),
            resultado: equiposConMaxH2HPts.length === 1 ? 'RESUELTO' : 'EMPATE_PERSISTE',
            ganador: equiposConMaxH2HPts.length === 1 ? equiposConMaxH2HPts[0].club.nombre : undefined,
            detalle: equiposConMaxH2HPts.length === 1
              ? `${equiposConMaxH2HPts[0].club.nombre} obtuvo más puntos en partidos directos (${maxH2HPts} pts).`
              : `El empate persiste entre ${equiposConMaxH2HPts.map(e => e.club.nombre).join(', ')} con ${maxH2HPts} pts en partidos directos.`
          });
          criterioActualNum++;

          if (equiposConMaxH2HPts.length > 1) {
            equiposRestantes = equiposConMaxH2HPts;

            // Diferencia de Goles H2H
            const h2hGDValores = equiposRestantes.map(e => ({ 
              equipo: e.club.nombre, 
              valor: (gdDirectos[e.club_id] > 0 ? '+' : '') + gdDirectos[e.club_id] 
            }));
            const maxH2HGD = Math.max(...equiposRestantes.map(e => gdDirectos[e.club_id]));
            const equiposConMaxH2HGD = equiposRestantes.filter(e => gdDirectos[e.club_id] === maxH2HGD);

            pasos.push({
              criterio: criterioActualNum,
              titulo: 'Diferencia de Goles en Enfrentamientos Directos',
              valores: h2hGDValores.map(v => ({ equipo: v.equipo, valor: v.valor })),
              resultado: equiposConMaxH2HGD.length === 1 ? 'RESUELTO' : 'EMPATE_PERSISTE',
              ganador: equiposConMaxH2HGD.length === 1 ? equiposConMaxH2HGD[0].club.nombre : undefined,
              detalle: equiposConMaxH2HGD.length === 1
                ? `${equiposConMaxH2HGD[0].club.nombre} tiene mejor diferencia de goles en partidos directos (${maxH2HGD > 0 ? '+' : ''}${maxH2HGD}).`
                : `El empate persiste entre ${equiposConMaxH2HGD.map(e => e.club.nombre).join(', ')} con diferencia de goles en partidos directos de ${maxH2HGD > 0 ? '+' : ''}${maxH2HGD}.`
            });
            criterioActualNum++;

            if (equiposConMaxH2HGD.length > 1) {
              equiposRestantes = equiposConMaxH2HGD;

              // Criterio de sorteo final
              pasos.push({
                criterio: criterioActualNum,
                titulo: 'Sorteo Público',
                valores: equiposRestantes.map(e => ({ equipo: e.club.nombre, valor: 'Empate Total' })),
                resultado: 'RESUELTO',
                ganador: equiposRestantes[0].club.nombre, // Sorteo simulado
                detalle: `Todos los criterios de competencia son idénticos. Resuelto mediante Sorteo Público por el Comité Ejecutivo. El ganador del sorteo es ${equiposRestantes[0].club.nombre}.`
              });
            }
          }
        }
      }
    }

    setPasosResolucion(pasos);
    setCalculoActivo(true);
    setPasoActual(0);

    // Animación visual de los pasos
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= pasos.length) {
        clearInterval(interval);
      } else {
        setPasoActual(currentStep);
      }
    }, 1200);
  };

  const reiniciarCalculo = () => {
    setCalculoActivo(false);
    setPasoActual(0);
    setPasosResolucion([]);
  };

  const equiposFiltrados = standings.filter(t => equiposSeleccionados.includes(t.club_id));

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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--texto-primario)' }}>
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: '42px', height: '42px', background: '#FEF3C7' }}
              >
                <Scale size={22} style={{ color: '#D4A843' }} />
              </div>
              Desempates LigaPro
            </h1>
            <p className="text-sm mt-1 ml-[54px]" style={{ color: 'var(--texto-secundario)' }}>
              Simulador y motor de resolución de empates según el reglamento oficial
            </p>
          </div>

          {/* Selector de competición */}
          <div className="flex items-center gap-2">
            <Trophy size={16} style={{ color: '#D4A843' }} />
            <select
              value={competicionSeleccionada}
              onChange={(e) => {
                setCompeticionSeleccionada(e.target.value);
                reiniciarCalculo();
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border focus:ring-2 focus:ring-[#D4A843]/30 outline-none"
              style={{
                background: 'var(--fondo-tarjeta)',
                borderColor: 'var(--borde-suave)',
                color: 'var(--texto-primario)'
              }}
              disabled={calculoActivo}
            >
              {competiciones.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.temporada})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
          <Loader2 className="animate-spin text-[#D4A843]" size={36} />
          <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Cargando datos de desempate...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Criterios del reglamento y Selección de Equipos */}
          <div className="lg:col-span-1 space-y-6">
            {/* Explicación del algoritmo */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              <div
                className="flex items-center gap-3 px-5 py-3.5"
                style={{
                  background: competicionInfo?.serie === 'A' 
                    ? 'linear-gradient(135deg, #D4A843, #B8922F)' 
                    : 'linear-gradient(135deg, #2980B9, #1F6691)'
                }}
              >
                <Info size={18} className="text-white" />
                <h2 className="text-white font-semibold text-sm">
                  Criterios Serie {competicionInfo?.serie || 'A'}
                </h2>
              </div>

              <div className="p-5">
                <p className="text-xs mb-4" style={{ color: 'var(--texto-secundario)' }}>
                  Cuando equipos de la Serie {competicionInfo?.serie} empatan en puntos, se evalúan consecutivamente los siguientes criterios:
                </p>

                <div className="space-y-3">
                  {criterios.map((criterio) => {
                    const Icono = criterio.icono;
                    return (
                      <div
                        key={criterio.numero}
                        className="flex items-start gap-3 p-3 rounded-lg"
                        style={{ border: '1px solid var(--borde-suave)', background: 'var(--fondo-principal)' }}
                      >
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold"
                          style={{
                            width: '24px',
                            height: '24px',
                            background: `${criterio.color}15`,
                            color: criterio.color
                          }}
                        >
                          {criterio.numero}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xs font-semibold" style={{ color: 'var(--texto-primario)' }}>
                            {criterio.titulo}
                          </h3>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--texto-secundario)' }}>
                            {criterio.descripcion}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selección Manual de Equipos a Simular */}
            <div
              className="rounded-xl overflow-hidden p-5"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--texto-primario)' }}>
                Equipos de la Competición
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--texto-secundario)' }}>
                Selecciona 2 o más equipos para comparar y simular su desempate reglamentario.
              </p>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {standings.map(team => {
                  const seleccionado = equiposSeleccionados.includes(team.club_id);
                  const color = team.club.color_principal || '#A0AEC0';
                  return (
                    <button
                      key={team.club_id}
                      onClick={() => toggleSeleccionEquipo(team.club_id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium border text-left transition-colors"
                      style={{
                        background: seleccionado ? '#FEF3C7' : 'transparent',
                        borderColor: seleccionado ? '#D4A843' : 'var(--borde-suave)',
                        color: 'var(--texto-primario)',
                      }}
                      disabled={calculoActivo}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                          style={{
                            background: color,
                            color: color === '#FFFFFF' || color === '#FFD700' || color === '#F1C40F' ? '#1A1A2E' : 'white',
                            border: color === '#FFFFFF' ? '1px solid #E5E7EB' : 'none'
                          }}
                        >
                          {team.club.abreviatura}
                        </div>
                        <span>{team.club.nombre}</span>
                      </div>
                      <span className="font-semibold text-gray-500">{team.puntos} Pts</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna Derecha/Centro: Simulador del Desempate */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ background: 'linear-gradient(135deg, #1B2A4A, #111D35)' }}
              >
                <div className="flex items-center gap-3">
                  <Scale size={18} className="text-white" />
                  <h2 className="text-white font-semibold text-sm">Simulación de Desempate Activa</h2>
                </div>
                <div className="flex items-center gap-2">
                  {!calculoActivo ? (
                    <button
                      onClick={ejecutarCalculo}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:bg-white/20"
                      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <Play size={14} />
                      Ejecutar Cálculo
                    </button>
                  ) : (
                    <button
                      onClick={reiniciarCalculo}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:bg-white/20"
                      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <RotateCcw size={14} />
                      Reiniciar
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5">
                {/* Resumen de los equipos a desempatar */}
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--texto-secundario)' }}>
                    Equipos en Simulación
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equiposFiltrados.map((equipo) => {
                      const color = equipo.club.color_principal || '#A0AEC0';
                      return (
                        <div
                          key={equipo.club_id}
                          className="flex items-center gap-3 p-3 rounded-lg border"
                          style={{ border: '1px solid var(--borde-suave)', background: 'var(--fondo-principal)' }}
                        >
                          <div
                            className="flex items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
                            style={{
                              width: '36px', height: '36px',
                              background: color,
                              color: color === '#FFFFFF' || color === '#FFD700' || color === '#F1C40F' ? '#1A1A2E' : 'white',
                              border: color === '#FFFFFF' ? '1px solid #E5E7EB' : 'none'
                            }}
                          >
                            {equipo.club.abreviatura}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-semibold truncate" style={{ color: 'var(--texto-primario)' }}>
                              {equipo.club.nombre}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px]" style={{ color: 'var(--texto-secundario)' }}>
                                <span className="font-semibold">{equipo.puntos}</span> pts
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--texto-secundario)' }}>
                                DG: <span className="font-semibold">{equipo.saldo_goles > 0 ? `+${equipo.saldo_goles}` : equipo.saldo_goles}</span>
                              </span>
                              <span className="text-[10px]" style={{ color: 'var(--texto-secundario)' }}>
                                GF: <span className="font-semibold">{equipo.goles_favor}</span>
                              </span>
                              {competicionInfo?.serie === 'B' && (
                                <span className="text-[10px]" style={{ color: 'var(--texto-secundario)' }}>
                                  GV: <span className="font-semibold">{equipo.goles_visitante}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pasos de resolución animados */}
                {calculoActivo && (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--texto-secundario)' }}>
                      Pasos de Resolución del Reglamento
                    </p>

                    {pasosResolucion.map((paso, i) => {
                      const esVisible = i <= pasoActual;
                      if (!esVisible) return null;

                      const esUltimo = i === pasosResolucion.length - 1;
                      const resuelto = paso.resultado === 'RESUELTO';

                      return (
                        <div
                          key={paso.criterio}
                          className="rounded-xl overflow-hidden transition-all duration-500 animate-slide-up border"
                          style={{
                            borderColor: resuelto ? '#27AE60' : '#E67E22',
                            background: resuelto ? 'rgba(39, 174, 96, 0.04)' : 'rgba(230, 126, 34, 0.03)',
                          }}
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-3 justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex items-center justify-center rounded-full flex-shrink-0"
                                  style={{
                                    width: '28px', height: '28px',
                                    background: resuelto ? '#DEF7EC' : '#FEF3C7'
                                  }}
                                >
                                  {resuelto ? (
                                    <CheckCircle2 size={14} style={{ color: '#27AE60' }} />
                                  ) : (
                                    <Minus size={14} style={{ color: '#E67E22' }} />
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold" style={{ color: 'var(--texto-primario)' }}>
                                    Criterio {paso.criterio}: {paso.titulo}
                                  </h4>
                                  <p className="text-[10px]" style={{ color: 'var(--texto-secundario)' }}>
                                    {paso.detalle}
                                  </p>
                                </div>
                              </div>
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{
                                  background: resuelto ? '#DEF7EC' : '#FEF3C7',
                                  color: resuelto ? '#03543F' : '#92400E'
                                }}
                              >
                                {resuelto ? '✓ Resuelto' : 'Empate persiste'}
                              </span>
                            </div>

                            {/* Valores de comparación en este criterio */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                              {paso.valores.map((v) => (
                                <div
                                  key={v.equipo}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px]"
                                  style={{
                                    background: 'var(--fondo-principal)',
                                    borderColor: paso.ganador === v.equipo ? '#27AE60' : 'var(--borde-suave)',
                                    borderWidth: paso.ganador === v.equipo ? '2px' : '1px',
                                  }}
                                >
                                  <span className="font-medium truncate mr-1">{v.equipo}</span>
                                  <span
                                    className="font-bold whitespace-nowrap"
                                    style={{ color: paso.ganador === v.equipo ? '#27AE60' : 'var(--texto-secundario)' }}
                                  >
                                    {v.valor}
                                    {paso.ganador === v.equipo && ' ✓'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Resultado final */}
                    {pasoActual >= pasosResolucion.length - 1 && (
                      <div
                        className="rounded-xl p-5 text-center animate-slide-up border"
                        style={{
                          background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.08), rgba(39, 174, 96, 0.02))',
                          borderColor: '#27AE60',
                        }}
                      >
                        <Trophy size={32} style={{ color: '#D4A843' }} className="mx-auto mb-2" />
                        <h3 className="text-sm font-bold" style={{ color: 'var(--texto-primario)' }}>
                          Desempate Resuelto Exitosamente
                        </h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--texto-secundario)' }}>
                          El equipo clasificado/ganador del desempate es:
                        </p>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border mt-3" style={{ background: '#DEF7EC', borderColor: '#27AE60' }}>
                          <Award size={16} style={{ color: '#D4A843' }} />
                          <span className="text-xs font-bold" style={{ color: '#03543F' }}>
                            {pasosResolucion[pasosResolucion.length - 1]?.ganador}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Placeholder cuando no se ha ejecutado */}
                {!calculoActivo && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div
                      className="flex items-center justify-center rounded-full mb-4"
                      style={{ width: '64px', height: '64px', background: 'var(--fondo-principal)', border: '2px solid var(--borde-suave)' }}
                    >
                      <Scale size={28} style={{ color: 'var(--texto-terciario)' }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--texto-secundario)' }}>
                      Presiona &quot;Ejecutar Cálculo&quot; para iniciar la simulación
                    </p>
                    <p className="text-xs mt-1 text-center max-w-sm" style={{ color: 'var(--texto-terciario)' }}>
                      El motor consultará los partidos directos y estadísticas generales para resolver el desempate de forma secuencial paso a paso.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
