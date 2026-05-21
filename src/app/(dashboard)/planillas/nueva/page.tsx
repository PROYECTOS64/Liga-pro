'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Users, Shield, FileText,
  UserPlus, X, AlertTriangle, CheckCircle2, Stethoscope, ClipboardList
} from 'lucide-react';

// ============================================
// DATOS DE EJEMPLO
// ============================================
const partidosDisponibles = [
  { id: '1', local: 'Barcelona SC', visitante: 'Emelec', fecha: '25/05/2026', hora: '15:30', estadio: 'Monumental', jornada: 16 },
  { id: '2', local: 'LDU Quito', visitante: 'El Nacional', fecha: '25/05/2026', hora: '18:00', estadio: 'Casa Blanca', jornada: 16 },
  { id: '3', local: 'Independiente del Valle', visitante: 'Aucas', fecha: '26/05/2026', hora: '12:00', estadio: 'Rumiñahui', jornada: 16 },
  { id: '4', local: 'Deportivo Cuenca', visitante: 'Mushuc Runa', fecha: '26/05/2026', hora: '15:30', estadio: 'A. Serrano Aguilar', jornada: 16 },
];

const jugadoresDisponibles = [
  { id: '1', nombre: 'Alexander Domínguez', posicion: 'POR', dorsal: 1 },
  { id: '2', nombre: 'Félix Torres', posicion: 'DEF', dorsal: 2 },
  { id: '3', nombre: 'Pervis Estupiñán', posicion: 'DEF', dorsal: 3 },
  { id: '4', nombre: 'Piero Hincapié', posicion: 'DEF', dorsal: 4 },
  { id: '5', nombre: 'Carlos Gruezo', posicion: 'MED', dorsal: 5 },
  { id: '6', nombre: 'Robert Arboleda', posicion: 'DEF', dorsal: 6 },
  { id: '7', nombre: 'Gonzalo Plata', posicion: 'EXT', dorsal: 7 },
  { id: '8', nombre: 'Moisés Caicedo', posicion: 'MED', dorsal: 8 },
  { id: '9', nombre: 'Michael Estrada', posicion: 'DEL', dorsal: 9 },
  { id: '10', nombre: 'Ángel Mena', posicion: 'MED', dorsal: 10 },
  { id: '11', nombre: 'Jeremy Sarmiento', posicion: 'EXT', dorsal: 11 },
  { id: '12', nombre: 'Alan Franco', posicion: 'DEF', dorsal: 15 },
  { id: '13', nombre: 'Enner Valencia', posicion: 'DEL', dorsal: 13 },
  { id: '14', nombre: 'Jhegson Méndez', posicion: 'MED', dorsal: 14 },
  { id: '15', nombre: 'Hernán Galíndez', posicion: 'POR', dorsal: 22 },
  { id: '16', nombre: 'Byron Castillo', posicion: 'DEF', dorsal: 16 },
  { id: '17', nombre: 'Jackson Porozo', posicion: 'DEF', dorsal: 17 },
  { id: '18', nombre: 'Joao Rojas', posicion: 'EXT', dorsal: 18 },
  { id: '19', nombre: 'Renato Ibarra', posicion: 'MED', dorsal: 19 },
  { id: '20', nombre: 'Djorkaeff Reasco', posicion: 'DEL', dorsal: 20 },
  { id: '21', nombre: 'Kévin Rodríguez', posicion: 'DEL', dorsal: 21 },
  { id: '22', nombre: 'Xavier Arreaga', posicion: 'DEF', dorsal: 23 },
  { id: '23', nombre: 'Ayrton Preciado', posicion: 'EXT', dorsal: 24 },
  { id: '24', nombre: 'Gabriel Cortez', posicion: 'MED', dorsal: 25 },
  { id: '25', nombre: 'Óscar Zambrano', posicion: 'DEF', dorsal: 26 },
];

const staffDisponible = [
  { id: 's1', nombre: 'Sebastián Beccacece', rol: 'Director Técnico', obligatorio: true },
  { id: 's2', nombre: 'Pablo Sánchez', rol: 'Asistente Técnico', obligatorio: false },
  { id: 's3', nombre: 'Dr. Carlos Medina', rol: 'Médico', obligatorio: true },
  { id: 's4', nombre: 'Ricardo Vásquez', rol: 'Preparador Físico', obligatorio: false },
  { id: 's5', nombre: 'Miguel Ángel López', rol: 'Entrenador de Porteros', obligatorio: false },
  { id: 's6', nombre: 'Lic. María Fernanda Torres', rol: 'Fisioterapeuta', obligatorio: false },
  { id: 's7', nombre: 'Juan Carlos Ruiz', rol: 'Analista de Video', obligatorio: false },
  { id: 's8', nombre: 'Dr. Laura Espinoza', rol: 'Nutricionista', obligatorio: false },
  { id: 's9', nombre: 'Andrés Cevallos', rol: 'Asistente Técnico 2', obligatorio: false },
  { id: 's10', nombre: 'Pedro Quiñónez', rol: 'Utilero', obligatorio: false },
];

const pasos = [
  { id: 1, titulo: 'Seleccionar Partido', icono: Shield },
  { id: 2, titulo: 'Jugadores', icono: Users },
  { id: 3, titulo: 'Staff', icono: ClipboardList },
  { id: 4, titulo: 'Revisión', icono: CheckCircle2 },
];

function InsigniaPosicion({ posicion }: { posicion: string }) {
  const colores: Record<string, { bg: string; text: string }> = {
    POR: { bg: '#FEF3C7', text: '#92400E' },
    DEF: { bg: '#DBEAFE', text: '#1E40AF' },
    MED: { bg: '#DEF7EC', text: '#03543F' },
    EXT: { bg: '#F3E8FF', text: '#6B21A8' },
    DEL: { bg: '#FEE2E2', text: '#991B1B' },
  };
  const c = colores[posicion] || colores.MED;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold" style={{ background: c.bg, color: c.text }}>
      {posicion}
    </span>
  );
}

export default function PaginaNuevaPlanilla() {
  const [pasoActual, setPasoActual] = useState(1);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<string | null>(null);
  const [titulares, setTitulares] = useState<string[]>([]);
  const [suplentes, setSuplentes] = useState<string[]>([]);
  const [staffSeleccionado, setStaffSeleccionado] = useState<string[]>([]);

  const partido = partidosDisponibles.find((p) => p.id === partidoSeleccionado);
  const totalJugadores = titulares.length + suplentes.length;

  // Validaciones
  const validacionesPaso2 = {
    titularesSuficientes: titulares.length === 11,
    maxJugadores: totalJugadores <= 23,
  };

  const tieneDT = staffSeleccionado.some((id) => {
    const s = staffDisponible.find((st) => st.id === id);
    return s?.rol === 'Director Técnico';
  });

  const tieneMedico = staffSeleccionado.some((id) => {
    const s = staffDisponible.find((st) => st.id === id);
    return s?.rol === 'Médico';
  });

  const validacionesPaso3 = {
    tieneDT,
    tieneMedico,
    maxStaff: staffSeleccionado.length <= 10,
  };

  const puedeAvanzar = () => {
    switch (pasoActual) {
      case 1: return !!partidoSeleccionado;
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partidosDisponibles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPartidoSeleccionado(p.id)}
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
                  {partidoSeleccionado === p.id && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <CheckCircle2 size={14} style={{ color: '#2980B9' }} />
                      <span className="text-xs font-semibold" style={{ color: '#2980B9' }}>Seleccionado</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
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

            <div className="space-y-2">
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
                        background: s.rol === 'Director Técnico' ? '#FEF3C7' : s.rol === 'Médico' ? '#FEE2E2' : 'var(--fondo-tarjeta)',
                        border: '1px solid var(--borde-suave)',
                      }}
                    >
                      {s.rol === 'Director Técnico' ? <ClipboardList size={18} style={{ color: '#D4A843' }} /> :
                       s.rol === 'Médico' ? <Stethoscope size={18} style={{ color: '#C0392B' }} /> :
                       <Users size={18} style={{ color: 'var(--texto-terciario)' }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>{s.nombre}</p>
                      <p className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                        {s.rol}
                        {s.obligatorio && <span className="ml-1 text-red-500 font-bold">*</span>}
                      </p>
                    </div>
                    {seleccionado && <CheckCircle2 size={20} style={{ color: '#27AE60' }} />}
                  </button>
                );
              })}
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
                      <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>({s.rol})</span>
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
            disabled={pasoActual === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-secundario)' }}
          >
            <ArrowLeft size={16} />
            Anterior
          </button>

          {pasoActual < 4 ? (
            <button
              onClick={() => setPasoActual(pasoActual + 1)}
              disabled={!puedeAvanzar()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #2980B9, #1F6691)' }}
            >
              Siguiente
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #27AE60, #1E8449)' }}
              onClick={() => alert('Planilla enviada correctamente')}
            >
              <Check size={16} />
              Enviar Planilla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
