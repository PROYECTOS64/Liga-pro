'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Check, Users, Shield, FileText,
  UserPlus, X, AlertTriangle, CheckCircle2, Stethoscope, ClipboardList
} from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

const pasos = [
  { id: 1, titulo: 'Seleccionar Partido', icono: Shield },
  { id: 2, titulo: 'Jugadores', icono: Users },
  { id: 3, titulo: 'Staff', icono: ClipboardList },
  { id: 4, titulo: 'Revisión', icono: CheckCircle2 },
];

function InsigniaPosicion({ posicion }: { posicion: string }) {
  const colores: Record<string, { bg: string; text: string }> = {
    PORTERO: { bg: '#FEF3C7', text: '#92400E' },
    DEFENSA: { bg: '#DBEAFE', text: '#1E40AF' },
    MEDIOCAMPISTA: { bg: '#DEF7EC', text: '#03543F' },
    DELANTERO: { bg: '#FEE2E2', text: '#991B1B' },
  };
  const c = colores[posicion] || colores.MEDIOCAMPISTA;
  const pStr = posicion.substring(0, 3).toUpperCase();
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold" style={{ background: c.bg, color: c.text }}>
      {pStr}
    </span>
  );
}

export default function PaginaNuevaPlanilla() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [autorizado, setAutorizado] = useState(false);
  
  // Data de BD
  const [partidosDisponibles, setPartidosDisponibles] = useState<any[]>([]);
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState<any[]>([]);
  const [staffDisponible, setStaffDisponible] = useState<any[]>([]);

  useEffect(() => {
    const checkRole = async () => {
      const supabase = crearClienteNavegador();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      let rolReal = 'usuario';
      if (user.email === 'admin@ligapro.ec') {
        rolReal = 'admin';
      } else {
        const { data: perfil } = await supabase.from('perfiles').select('rol').eq('user_id', user.id).single();
        if (perfil?.rol === 'ADMIN') rolReal = 'admin';
        else if (perfil?.rol === 'DELEGADO_CLUB') rolReal = 'club';
        else if (perfil?.rol === 'ARBITRO') rolReal = 'arbitro';
      }
      
      if (rolReal !== 'admin' && rolReal !== 'club') {
        router.replace('/planillas');
      } else {
        setAutorizado(true);
      }
    };
    checkRole();
  }, [router]);

  // Estado del formulario
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<string | null>(null);
  const [clubSeleccionadoId, setClubSeleccionadoId] = useState<string | null>(null);
  const [titulares, setTitulares] = useState<string[]>([]);
  const [suplentes, setSuplentes] = useState<string[]>([]);
  const [staffSeleccionado, setStaffSeleccionado] = useState<string[]>([]);

  const partido = partidosDisponibles.find((p) => p.id === partidoSeleccionado);
  const totalJugadores = titulares.length + suplentes.length;

  // Cargar Partidos inicial
  useEffect(() => {
    async function fetchPartidos() {
      const supabase = crearClienteNavegador();
      const { data } = await supabase
        .from('partidos')
        .select(`
          id, jornada, fecha_hora, estadio:estadios(nombre),
          local:clubes!partidos_club_local_id_fkey(id, nombre),
          visitante:clubes!partidos_club_visitante_id_fkey(id, nombre)
        `)
        .eq('estado', 'BORRADOR')
        .order('fecha_hora', { ascending: true });
        
      if (data) {
        setPartidosDisponibles(data.map(p => ({
          id: p.id,
          jornada: p.jornada,
          fecha: new Date(p.fecha_hora).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          hora: new Date(p.fecha_hora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
          estadio: ((p.estadio as any)?.nombre || (p.estadio as any)?.[0]?.nombre) || 'Sin estadio',
          localId: (p.local as any)?.id || (p.local as any)?.[0]?.id,
          local: (p.local as any)?.nombre || (p.local as any)?.[0]?.nombre,
          visitanteId: (p.visitante as any)?.id || (p.visitante as any)?.[0]?.id,
          visitante: (p.visitante as any)?.nombre || (p.visitante as any)?.[0]?.nombre
        })));
      }
      setCargando(false);
    }
    fetchPartidos();
  }, []);

  // Cargar jugadores y staff cuando se elige el club
  useEffect(() => {
    async function loadClubData() {
      if (!clubSeleccionadoId) {
        setJugadoresDisponibles([]);
        setStaffDisponible([]);
        return;
      }
      const supabase = crearClienteNavegador();
      
      const { data: jugData } = await supabase
        .from('jugadores')
        .select('id, nombre_completo, posicion, dorsal')
        .eq('club_id', clubSeleccionadoId)
        .order('dorsal', { ascending: true });
        
      if (jugData) {
        setJugadoresDisponibles(jugData.map(j => ({
          id: j.id, nombre: j.nombre_completo, posicion: j.posicion, dorsal: j.dorsal || 0
        })));
      }

      const { data: stData } = await supabase
        .from('staff')
        .select('id, nombre_completo, tipo_staff')
        .eq('club_id', clubSeleccionadoId);
        
      if (stData) {
        setStaffDisponible(stData.map(s => ({
          id: s.id, nombre: s.nombre_completo, rol: s.tipo_staff,
          obligatorio: ['DIRECTOR_TECNICO', 'MEDICO'].includes(s.tipo_staff)
        })));
      }
      
      // Reset selecciones previas al cambiar de club
      setTitulares([]);
      setSuplentes([]);
      setStaffSeleccionado([]);
    }
    
    loadClubData();
  }, [clubSeleccionadoId]);

  // Validaciones
  const validacionesPaso2 = {
    titularesSuficientes: titulares.length === 11,
    maxJugadores: totalJugadores <= 23,
  };

  const tieneDT = staffSeleccionado.some((id) => {
    const s = staffDisponible.find((st) => st.id === id);
    return s?.rol === 'DIRECTOR_TECNICO';
  });

  const tieneMedico = staffSeleccionado.some((id) => {
    const s = staffDisponible.find((st) => st.id === id);
    return s?.rol === 'MEDICO';
  });

  const validacionesPaso3 = {
    tieneDT,
    tieneMedico,
    maxStaff: staffSeleccionado.length <= 10,
  };

  const puedeAvanzar = () => {
    switch (pasoActual) {
      case 1: return !!partidoSeleccionado && !!clubSeleccionadoId;
      case 2: return validacionesPaso2.titularesSuficientes && validacionesPaso2.maxJugadores;
      case 3: return validacionesPaso3.tieneDT && validacionesPaso3.tieneMedico && validacionesPaso3.maxStaff;
      default: return true;
    }
  };

  const toggleTitular = (id: string) => {
    if (titulares.includes(id)) {
      setTitulares(titulares.filter((t) => t !== id));
    } else if (suplentes.includes(id)) {
      setSuplentes(suplentes.filter((s) => s !== id));
      if (titulares.length < 11) setTitulares([...titulares, id]);
    } else if (titulares.length < 11) {
      setTitulares([...titulares, id]);
    }
  };

  const toggleSuplente = (id: string) => {
    if (suplentes.includes(id)) {
      setSuplentes(suplentes.filter((s) => s !== id));
    } else if (titulares.includes(id)) {
      setTitulares(titulares.filter((t) => t !== id));
      if (suplentes.length < 12) setSuplentes([...suplentes, id]);
    } else if (totalJugadores < 23) {
      setSuplentes([...suplentes, id]);
    }
  };

  const toggleStaff = (id: string) => {
    if (staffSeleccionado.includes(id)) {
      setStaffSeleccionado(staffSeleccionado.filter((s) => s !== id));
    } else if (staffSeleccionado.length < 10) {
      setStaffSeleccionado([...staffSeleccionado, id]);
    }
  };

  const handleEnviarPlanilla = async () => {
    if (!partidoSeleccionado || !clubSeleccionadoId) return;
    setGuardando(true);
    
    try {
      const supabase = crearClienteNavegador();
      
      // 1. Crear planilla
      const { data: planData, error: planError } = await supabase.from('planillas').insert({
        partido_id: partidoSeleccionado,
        club_id: clubSeleccionadoId,
        estado: 'ENVIADA',
        fecha_envio: new Date().toISOString()
      }).select('id').single();
      
      if (planError) throw planError;
      
      const planillaId = planData.id;
      
      // 2. Insertar jugadores
      const insertsJugadores = [
        ...titulares.map(id => {
          const j = jugadoresDisponibles.find(x => x.id === id);
          return { planilla_id: planillaId, jugador_id: id, es_titular: true, dorsal_partido: j?.dorsal || 0 };
        }),
        ...suplentes.map(id => {
          const j = jugadoresDisponibles.find(x => x.id === id);
          return { planilla_id: planillaId, jugador_id: id, es_titular: false, dorsal_partido: j?.dorsal || 0 };
        })
      ];
      
      if (insertsJugadores.length > 0) {
        const { error: errJug } = await supabase.from('planilla_jugadores').insert(insertsJugadores);
        if (errJug) throw errJug;
      }
      
      // 3. Insertar staff
      if (staffSeleccionado.length > 0) {
        const insertsStaff = staffSeleccionado.map(id => ({
          planilla_id: planillaId,
          staff_id: id
        }));
        const { error: errSt } = await supabase.from('planilla_staff').insert(insertsStaff);
        if (errSt) throw errSt;
      }
      
      router.push('/planillas');
      router.refresh();
      
    } catch (error) {
      console.error('Error al enviar planilla:', error);
      alert('Hubo un error al enviar la planilla. Verifica la consola.');
      setGuardando(false);
    }
  };

  if (cargando || !autorizado) {
    return <div className="p-12 text-center text-[var(--texto-secundario)] bg-[var(--fondo-tarjeta)] rounded-xl border border-[var(--borde-suave)] shadow-sm">Verificando permisos de acceso...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      {/* Nav */}
      <Link
        href="/planillas"
        className="inline-flex items-center gap-2 text-sm font-medium no-underline"
        style={{ color: 'var(--texto-secundario)' }}
      >
        <ArrowLeft size={16} /> Volver a Planillas
      </Link>

      <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
        Nueva Planilla de Juego
      </h1>

      {/* Barra de progreso */}
      <div
        className="p-5 rounded-xl"
        style={{ background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)' }}
      >
        <div className="flex items-center justify-between">
          {pasos.map((paso, i) => {
            const Icono = paso.icono;
            const completado = pasoActual > paso.id;
            const activo = pasoActual === paso.id;
            return (
              <div key={paso.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className="flex items-center justify-center rounded-full w-10 h-10 text-sm font-bold transition-all"
                    style={{
                      background: completado ? '#27AE60' : activo ? '#2980B9' : 'var(--fondo-principal)',
                      color: completado || activo ? 'white' : 'var(--texto-terciario)',
                      border: completado || activo ? 'none' : '2px solid var(--borde-suave)',
                    }}
                  >
                    {completado ? <Check size={18} /> : <Icono size={18} />}
                  </div>
                  <span className="text-xs font-medium mt-2 text-center hidden sm:block" style={{ color: activo ? '#2980B9' : 'var(--texto-terciario)' }}>
                    {paso.titulo}
                  </span>
                </div>
                {i < pasos.length - 1 && (
                  <div className="flex-1 mx-3 h-0.5 rounded" style={{ background: completado ? '#27AE60' : 'var(--borde-suave)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido del paso */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)' }}
      >
        {/* PASO 1: Seleccionar Partido */}
        {pasoActual === 1 && (
          <div className="p-6">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--texto-primario)' }}>
              Seleccionar Partido
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--texto-secundario)' }}>
              Elija el partido para el cual desea crear la planilla
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {partidosDisponibles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPartidoSeleccionado(p.id); setClubSeleccionadoId(null); }}
                  className="text-left p-5 rounded-xl transition-all"
                  style={{
                    background: partidoSeleccionado === p.id ? '#EBF5FF' : 'var(--fondo-principal)',
                    border: partidoSeleccionado === p.id ? '2px solid #2980B9' : '1px solid var(--borde-suave)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold" style={{ color: 'var(--texto-primario)' }}>{p.local}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--ligapro-navy)', color: 'white' }}>vs</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--texto-primario)' }}>{p.visitante}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                    Jornada {p.jornada} · {p.fecha} · {p.hora} · {p.estadio}
                  </p>
                </button>
              ))}
              {partidosDisponibles.length === 0 && (
                <div className="col-span-2 p-6 text-center text-sm" style={{ color: 'var(--texto-secundario)' }}>No hay partidos pendientes.</div>
              )}
            </div>

            {partidoSeleccionado && partido && (
               <div className="animate-slide-up bg-gray-50/50 rounded-xl p-5" style={{ border: '1px solid var(--borde-suave)' }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--texto-primario)' }}>¿Para qué equipo registrará la planilla?</h3>
                  <div className="flex gap-4">
                     <button
                        onClick={() => setClubSeleccionadoId(partido.localId)}
                        className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all border"
                        style={{
                           borderColor: clubSeleccionadoId === partido.localId ? '#2980B9' : 'var(--borde-suave)',
                           backgroundColor: clubSeleccionadoId === partido.localId ? '#2980B9' : 'white',
                           color: clubSeleccionadoId === partido.localId ? 'white' : 'var(--texto-primario)'
                        }}
                     >
                        {partido.local} (Local)
                     </button>
                     <button
                        onClick={() => setClubSeleccionadoId(partido.visitanteId)}
                        className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all border"
                        style={{
                           borderColor: clubSeleccionadoId === partido.visitanteId ? '#2980B9' : 'var(--borde-suave)',
                           backgroundColor: clubSeleccionadoId === partido.visitanteId ? '#2980B9' : 'white',
                           color: clubSeleccionadoId === partido.visitanteId ? 'white' : 'var(--texto-primario)'
                        }}
                     >
                        {partido.visitante} (Visitante)
                     </button>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* PASO 2: Jugadores */}
        {pasoActual === 2 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>
                  Seleccionar Jugadores
                </h2>
                <p className="text-sm" style={{ color: 'var(--texto-secundario)' }}>
                  11 titulares + hasta 12 suplentes (máximo 23 jugadores)
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span style={{ color: titulares.length === 11 ? '#27AE60' : '#C0392B' }} className="font-semibold">
                  Titulares: {titulares.length}/11
                </span>
                <span style={{ color: 'var(--texto-secundario)' }} className="font-semibold">
                  Suplentes: {suplentes.length}/12
                </span>
                <span style={{ color: totalJugadores <= 23 ? 'var(--texto-primario)' : '#C0392B' }} className="font-bold">
                  Total: {totalJugadores}/23
                </span>
              </div>
            </div>

            {/* Mensajes de validación */}
            {!validacionesPaso2.titularesSuficientes && (
              <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}>
                <AlertTriangle size={16} style={{ color: '#D97706' }} />
                <span className="text-xs font-medium" style={{ color: '#92400E' }}>
                  Debe seleccionar exactamente 11 titulares. Faltan {11 - titulares.length}.
                </span>
              </div>
            )}

            {/* Lista de jugadores */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {jugadoresDisponibles.map((j) => {
                const esTitular = titulares.includes(j.id);
                const esSuplente = suplentes.includes(j.id);
                return (
                  <div
                    key={j.id}
                    className="flex items-center gap-4 p-3 rounded-lg transition-all"
                    style={{
                      background: esTitular ? '#DEF7EC' : esSuplente ? '#EBF5FF' : 'var(--fondo-principal)',
                      border: `1px solid ${esTitular ? '#27AE60' : esSuplente ? '#2980B9' : 'var(--borde-suave)'}`,
                    }}
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--ligapro-navy)', color: 'white' }}
                    >
                      {j.dorsal}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--texto-primario)' }}>{j.nombre}</p>
                    </div>
                    <InsigniaPosicion posicion={j.posicion} />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTitular(j.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: esTitular ? '#27AE60' : 'transparent',
                          color: esTitular ? 'white' : 'var(--texto-secundario)',
                          border: esTitular ? 'none' : '1px solid var(--borde-suave)',
                        }}
                      >
                        {esTitular ? '✓ Titular' : 'Titular'}
                      </button>
                      <button
                        onClick={() => toggleSuplente(j.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: esSuplente ? '#2980B9' : 'transparent',
                          color: esSuplente ? 'white' : 'var(--texto-secundario)',
                          border: esSuplente ? 'none' : '1px solid var(--borde-suave)',
                        }}
                      >
                        {esSuplente ? '✓ Suplente' : 'Suplente'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {jugadoresDisponibles.length === 0 && (
                <div className="text-center p-6 text-sm" style={{ color: 'var(--texto-secundario)' }}>No hay jugadores registrados en este club.</div>
              )}
            </div>
          </div>
        )}

        {/* PASO 3: Staff */}
        {pasoActual === 3 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>
                  Seleccionar Staff
                </h2>
                <p className="text-sm" style={{ color: 'var(--texto-secundario)' }}>
                  Máximo 10 personas. DT y Médico son obligatorios.
                </p>
              </div>
              <span className="text-sm font-bold" style={{ color: staffSeleccionado.length <= 10 ? 'var(--texto-primario)' : '#C0392B' }}>
                {staffSeleccionado.length}/10
              </span>
            </div>

            {/* Validaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{
                  background: tieneDT ? '#DEF7EC' : '#FEE2E2',
                  border: `1px solid ${tieneDT ? '#27AE60' : '#C0392B'}`,
                }}
              >
                {tieneDT ? <CheckCircle2 size={16} style={{ color: '#27AE60' }} /> : <AlertTriangle size={16} style={{ color: '#C0392B' }} />}
                <span className="text-xs font-semibold" style={{ color: tieneDT ? '#03543F' : '#991B1B' }}>
                  Director Técnico {tieneDT ? 'seleccionado' : 'requerido'}
                </span>
              </div>
              <div
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{
                  background: tieneMedico ? '#DEF7EC' : '#FEE2E2',
                  border: `1px solid ${tieneMedico ? '#27AE60' : '#C0392B'}`,
                }}
              >
                {tieneMedico ? <CheckCircle2 size={16} style={{ color: '#27AE60' }} /> : <AlertTriangle size={16} style={{ color: '#C0392B' }} />}
                <span className="text-xs font-semibold" style={{ color: tieneMedico ? '#03543F' : '#991B1B' }}>
                  Médico {tieneMedico ? 'seleccionado' : 'requerido'}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {staffDisponible.map((s) => {
                const seleccionado = staffSeleccionado.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStaff(s.id)}
                    className="flex items-center gap-4 w-full text-left p-4 rounded-lg transition-all"
                    style={{
                      background: seleccionado ? '#DEF7EC' : 'var(--fondo-principal)',
                      border: `1px solid ${seleccionado ? '#27AE60' : 'var(--borde-suave)'}`,
                    }}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                      style={{
                        background: s.rol === 'DIRECTOR_TECNICO' ? '#FEF3C7' : s.rol === 'MEDICO' ? '#FEE2E2' : 'var(--fondo-tarjeta)',
                        border: '1px solid var(--borde-suave)',
                      }}
                    >
                      {s.rol === 'DIRECTOR_TECNICO' ? <ClipboardList size={18} style={{ color: '#D4A843' }} /> :
                       s.rol === 'MEDICO' ? <Stethoscope size={18} style={{ color: '#C0392B' }} /> :
                       <Users size={18} style={{ color: 'var(--texto-terciario)' }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>{s.nombre}</p>
                      <p className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                        {s.rol.replace('_', ' ')}
                        {s.obligatorio && <span className="ml-1 text-red-500 font-bold">*</span>}
                      </p>
                    </div>
                    {seleccionado && <CheckCircle2 size={20} style={{ color: '#27AE60' }} />}
                  </button>
                );
              })}
              {staffDisponible.length === 0 && (
                <div className="text-center p-6 text-sm" style={{ color: 'var(--texto-secundario)' }}>No hay cuerpo técnico registrado en este club.</div>
              )}
            </div>
          </div>
        )}

        {/* PASO 4: Revisión */}
        {pasoActual === 4 && (
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--texto-primario)' }}>
              Revisión de la Planilla
            </h2>

            {/* Partido */}
            {partido && (
              <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }}>
                <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--texto-terciario)' }}>Partido</h3>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold" style={{ color: 'var(--texto-primario)' }}>{partido.local}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--ligapro-navy)', color: 'white' }}>vs</span>
                  <span className="text-base font-bold" style={{ color: 'var(--texto-primario)' }}>{partido.visitante}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--texto-secundario)' }}>
                  J{partido.jornada} · {partido.fecha} · {partido.hora} · {partido.estadio}
                </p>
              </div>
            )}

            {/* Resumen jugadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }}>
                <h3 className="text-xs font-bold uppercase mb-3" style={{ color: 'var(--texto-terciario)' }}>
                  Titulares ({titulares.length})
                </h3>
                <div className="space-y-1.5">
                  {titulares.map((id) => {
                    const j = jugadoresDisponibles.find((jg) => jg.id === id);
                    return j ? (
                      <div key={id} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold" style={{ background: 'var(--ligapro-navy)', color: 'white' }}>
                          {j.dorsal}
                        </span>
                        <span style={{ color: 'var(--texto-primario)' }}>{j.nombre}</span>
                        <InsigniaPosicion posicion={j.posicion} />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }}>
                <h3 className="text-xs font-bold uppercase mb-3" style={{ color: 'var(--texto-terciario)' }}>
                  Suplentes ({suplentes.length})
                </h3>
                <div className="space-y-1.5">
                  {suplentes.map((id) => {
                    const j = jugadoresDisponibles.find((jg) => jg.id === id);
                    return j ? (
                      <div key={id} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold" style={{ background: '#2980B9', color: 'white' }}>
                          {j.dorsal}
                        </span>
                        <span style={{ color: 'var(--texto-primario)' }}>{j.nombre}</span>
                        <InsigniaPosicion posicion={j.posicion} />
                      </div>
                    ) : null;
                  })}
                  {suplentes.length === 0 && (
                    <p className="text-xs" style={{ color: 'var(--texto-terciario)' }}>No se seleccionaron suplentes</p>
                  )}
                </div>
              </div>
            </div>

            {/* Staff */}
            <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }}>
              <h3 className="text-xs font-bold uppercase mb-3" style={{ color: 'var(--texto-terciario)' }}>
                Staff ({staffSeleccionado.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staffSeleccionado.map((id) => {
                  const s = staffDisponible.find((st) => st.id === id);
                  return s ? (
                    <div key={id} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} style={{ color: '#27AE60' }} />
                      <span className="font-medium" style={{ color: 'var(--texto-primario)' }}>{s.nombre}</span>
                      <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>({s.rol.replace('_', ' ')})</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--borde-suave)' }}
        >
          <button
            onClick={() => setPasoActual(Math.max(1, pasoActual - 1))}
            disabled={pasoActual === 1 || guardando}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-secundario)' }}
          >
            <ArrowLeft size={16} />
            Anterior
          </button>

          {pasoActual < 4 ? (
            <button
              onClick={() => setPasoActual(pasoActual + 1)}
              disabled={!puedeAvanzar() || guardando}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #2980B9, #1F6691)' }}
            >
              Siguiente
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #27AE60, #1E8449)' }}
              onClick={handleEnviarPlanilla}
              disabled={guardando}
            >
              {guardando ? 'Enviando...' : <><Check size={16} /> Enviar Planilla</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
