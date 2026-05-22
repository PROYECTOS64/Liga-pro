'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Shield, User, Calendar, MapPin, Phone, Mail,
  FileText, AlertTriangle, ClipboardList, Edit, Hash,
  Trophy, CircleAlert, Shirt
} from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

// ============================================
// DATOS DE EJEMPLO
// ============================================
const jugadoresDB: Record<string, {
  id: string; nombre: string; club: string; posicion: string; dorsal: number;
  estado: string; fechaNacimiento: string; nacionalidad: string; cedula: string;
  telefono: string; email: string; lugarNacimiento: string; peso: string;
  estatura: string; pieHabil: string; fechaRegistro: string;
  partidosJugados: number; goles: number; amarillas: number; rojas: number;
}> = {
  '1': {
    id: '1', nombre: 'Enner Valencia', club: 'Barcelona SC', posicion: 'Delantero', dorsal: 13,
    estado: 'ACTIVO', fechaNacimiento: '04/11/1989', nacionalidad: 'Ecuatoriana', cedula: '0802345678',
    telefono: '+593 99 123 4567', email: 'evalencia@bsc.ec', lugarNacimiento: 'San Lorenzo, Esmeraldas',
    peso: '75 kg', estatura: '1.77 m', pieHabil: 'Derecho', fechaRegistro: '15/01/2026',
    partidosJugados: 28, goles: 14, amarillas: 3, rojas: 0,
  },
  '2': {
    id: '2', nombre: 'Ángel Mena', club: 'LDU Quito', posicion: 'Mediocampista', dorsal: 10,
    estado: 'ACTIVO', fechaNacimiento: '21/01/1988', nacionalidad: 'Ecuatoriana', cedula: '0712345690',
    telefono: '+593 99 876 5432', email: 'amena@lduq.ec', lugarNacimiento: 'Santo Domingo',
    peso: '70 kg', estatura: '1.72 m', pieHabil: 'Izquierdo', fechaRegistro: '10/01/2026',
    partidosJugados: 25, goles: 8, amarillas: 5, rojas: 1,
  },
};

const historialDisciplinario = [
  { fecha: '15/04/2026', tipo: 'AMARILLA', partido: 'Barcelona SC vs Emelec', minuto: 34, motivo: 'Falta táctica' },
  { fecha: '28/03/2026', tipo: 'AMARILLA', partido: 'LDU Quito vs Barcelona SC', minuto: 67, motivo: 'Juego brusco' },
  { fecha: '10/03/2026', tipo: 'AMARILLA', partido: 'Barcelona SC vs El Nacional', minuto: 45, motivo: 'Protestar' },
];

const planillasJugador = [
  { fecha: '15/04/2026', partido: 'Barcelona SC vs Emelec', tipo: 'Titular', minutos: 90, goles: 1, asistencias: 0 },
  { fecha: '08/04/2026', partido: 'Aucas vs Barcelona SC', tipo: 'Titular', minutos: 85, goles: 0, asistencias: 1 },
  { fecha: '28/03/2026', partido: 'LDU Quito vs Barcelona SC', tipo: 'Suplente', minutos: 30, goles: 1, asistencias: 0 },
];

function Insignia({ estado }: { estado: string }) {
  const estilos: Record<string, { bg: string; text: string }> = {
    ACTIVO: { bg: '#DEF7EC', text: '#03543F' },
    PENDIENTE: { bg: '#FEF3C7', text: '#92400E' },
    SUSPENDIDO: { bg: '#FFEDD5', text: '#9A3412' },
  };
  const estilo = estilos[estado] || estilos.ACTIVO;
  const etiquetas: Record<string, string> = { ACTIVO: 'Activo', PENDIENTE: 'Pendiente', SUSPENDIDO: 'Suspendido' };

  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: estilo.bg, color: estilo.text }}
    >
      {etiquetas[estado] || estado}
    </span>
  );
}

export default function PaginaDetalleJugador({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pestanaActiva, setPestanaActiva] = useState('informacion');
  const [jugadorDB, setJugadorDB] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const supabase = crearClienteNavegador();

  useEffect(() => {
    async function fetchJugador() {
      const { data } = await supabase.from('jugadores').select('*, clubes(nombre)').eq('id', id).single();
      if (data) {
        setJugadorDB(data);
      } else {
        // Podríamos revisar si es staff, pero por ahora solo jugador
        const { data: staffData } = await supabase.from('staff').select('*, clubes(nombre)').eq('id', id).single();
        if (staffData) setJugadorDB(staffData);
      }
      setCargando(false);
    }
    fetchJugador();
  }, [id, supabase]);

  // Fallback a jugador genérico si no existe en los datos mock
  const fallback = jugadoresDB[id] || {
    id, nombre: 'Jugador Ejemplo', club: 'Barcelona SC', posicion: 'Delantero', dorsal: 9,
    estado: 'ACTIVO', fechaNacimiento: '01/01/1995', nacionalidad: 'Ecuatoriana', cedula: '0900000000',
    telefono: '+593 99 000 0000', email: 'jugador@club.ec', lugarNacimiento: 'Guayaquil',
    peso: '75 kg', estatura: '1.80 m', pieHabil: 'Derecho', fechaRegistro: '01/01/2026',
    partidosJugados: 20, goles: 5, amarillas: 2, rojas: 0,
  };

  const jugador = jugadorDB ? {
    id: jugadorDB.id,
    nombre: jugadorDB.nombre_completo,
    club: jugadorDB.clubes?.nombre || 'Sin club',
    posicion: jugadorDB.posicion || jugadorDB.tipo_staff || 'Staff',
    dorsal: jugadorDB.dorsal || 0,
    estado: jugadorDB.estado || 'ACTIVO',
    fechaNacimiento: jugadorDB.fecha_nacimiento || fallback.fechaNacimiento,
    nacionalidad: jugadorDB.nacionalidad || fallback.nacionalidad,
    cedula: jugadorDB.cedula || fallback.cedula,
    telefono: fallback.telefono,
    email: fallback.email,
    lugarNacimiento: fallback.lugarNacimiento,
    peso: jugadorDB.peso_kg ? `${jugadorDB.peso_kg} kg` : fallback.peso,
    estatura: jugadorDB.altura_cm ? `${jugadorDB.altura_cm} cm` : fallback.estatura,
    pieHabil: jugadorDB.pie_dominante || fallback.pieHabil,
    fechaRegistro: jugadorDB.created_at ? new Date(jugadorDB.created_at).toLocaleDateString() : fallback.fechaRegistro,
    partidosJugados: fallback.partidosJugados,
    goles: fallback.goles,
    amarillas: jugadorDB.tarjetas_amarillas_acumuladas || fallback.amarillas,
    rojas: fallback.rojas,
  } : fallback;

  if (cargando) return <div className="p-10 text-center">Cargando perfil...</div>;

  const estadisticas = [
    { titulo: 'Partidos Jugados', valor: jugador.partidosJugados, icono: Trophy, color: '#2980B9', fondo: '#EBF5FF' },
    { titulo: 'Goles', valor: jugador.goles, icono: CircleAlert, color: '#27AE60', fondo: '#DEF7EC' },
    { titulo: 'Tarjetas Amarillas', valor: jugador.amarillas, icono: AlertTriangle, color: '#D4A843', fondo: '#FEF3C7' },
    { titulo: 'Tarjetas Rojas', valor: jugador.rojas, icono: AlertTriangle, color: '#C0392B', fondo: '#FEE2E2' },
  ];

  const pestanas = [
    { id: 'informacion', etiqueta: 'Información', icono: User },
    { id: 'disciplinario', etiqueta: 'Historial Disciplinario', icono: AlertTriangle },
    { id: 'planillas', etiqueta: 'Planillas', icono: FileText },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Navegación */}
      <Link
        href="/jugadores"
        className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
        style={{ color: 'var(--texto-secundario)' }}
      >
        <ArrowLeft size={16} />
        Volver a Jugadores
      </Link>

      {/* Tarjeta del jugador */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
        }}
      >
        <div
          className="px-6 py-5"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #111D35)' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-full text-white text-2xl font-bold flex-shrink-0"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #D4A843, #B8922F)',
                border: '3px solid rgba(255,255,255,0.2)',
              }}
            >
              {jugador.nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-xl font-bold text-white">{jugador.nombre}</h1>
                <Insignia estado={jugador.estado} />
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Shield size={14} />
                  {jugador.club}
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Shirt size={14} />
                  {jugador.posicion}
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Hash size={14} />
                  Dorsal {jugador.dorsal}
                </div>
              </div>
            </div>
            {/* Botón editar */}
            <Link
              href={`/jugadores/${id}/editar`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-white/20"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Edit size={14} />
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {estadisticas.map((est) => {
          const Icono = est.icono;
          return (
            <div
              key={est.titulo}
              className="flex items-center gap-4 p-5 rounded-xl"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: '48px', height: '48px', background: est.fondo }}
              >
                <Icono size={22} style={{ color: est.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
                  {est.valor}
                </p>
                <p className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>
                  {est.titulo}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pestañas de contenido */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
        }}
      >
        <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: '1px solid var(--borde-suave)' }}>
          {pestanas.map((p) => {
            const Icono = p.icono;
            const esActiva = pestanaActiva === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPestanaActiva(p.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: esActiva ? '#EBF5FF' : 'transparent',
                  color: esActiva ? '#2980B9' : 'var(--texto-secundario)',
                  borderBottom: esActiva ? '2px solid #2980B9' : '2px solid transparent',
                }}
              >
                <Icono size={16} />
                {p.etiqueta}
              </button>
            );
          })}
        </div>

        {/* Tab: Información */}
        {pestanaActiva === 'informacion' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos personales */}
              <div>
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--texto-primario)' }}>
                  Datos Personales
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Fecha de Nacimiento', valor: jugador.fechaNacimiento, icono: Calendar },
                    { label: 'Lugar de Nacimiento', valor: jugador.lugarNacimiento, icono: MapPin },
                    { label: 'Nacionalidad', valor: jugador.nacionalidad, icono: User },
                    { label: 'Cédula / Pasaporte', valor: jugador.cedula, icono: FileText },
                    { label: 'Teléfono', valor: jugador.telefono, icono: Phone },
                    { label: 'Email', valor: jugador.email, icono: Mail },
                  ].map((item) => {
                    const Ic = item.icono;
                    return (
                      <div key={item.label} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--borde-suave)' }}>
                        <Ic size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--texto-terciario)' }} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--texto-terciario)' }}>{item.label}</p>
                          <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--texto-primario)' }}>{item.valor}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Datos físicos y de registro */}
              <div>
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--texto-primario)' }}>
                  Datos de Registro y Físicos
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Estatura', valor: jugador.estatura },
                    { label: 'Peso', valor: jugador.peso },
                    { label: 'Pie Hábil', valor: jugador.pieHabil },
                    { label: 'Número de Camiseta', valor: `#${jugador.dorsal}` },
                    { label: 'Fecha de Registro', valor: jugador.fechaRegistro },
                    { label: 'Posición', valor: jugador.posicion },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--borde-suave)' }}>
                      <p className="text-xs font-medium" style={{ color: 'var(--texto-terciario)' }}>{item.label}</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>{item.valor}</p>
                    </div>
                  ))}
                </div>

                {/* Documentos */}
                <h3 className="text-sm font-bold mt-6 mb-3" style={{ color: 'var(--texto-primario)' }}>
                  Documentos de Registro
                </h3>
                <div className="space-y-2">
                  {['Cédula de Identidad', 'Contrato Vigente', 'Certificado Médico'].map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg"
                      style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }}
                    >
                      <FileText size={16} style={{ color: 'var(--ligapro-blue)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>{doc}</span>
                      <span
                        className="ml-auto text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ background: '#DEF7EC', color: '#03543F' }}
                      >
                        Verificado
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Historial Disciplinario */}
        {pestanaActiva === 'disciplinario' && (
          <div className="tabla-responsive">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Partido</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Minuto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {historialDisciplinario.map((h, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--borde-suave)' }}>
                    <td className="px-6 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{h.fecha}</td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: h.tipo === 'AMARILLA' ? '#FEF3C7' : '#FEE2E2',
                          color: h.tipo === 'AMARILLA' ? '#92400E' : '#991B1B',
                        }}
                      >
                        {h.tipo === 'AMARILLA' ? '🟨 Amarilla' : '🟥 Roja'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>{h.partido}</td>
                    <td className="px-6 py-3 text-sm text-center font-semibold" style={{ color: 'var(--texto-primario)' }}>{h.minuto}&apos;</td>
                    <td className="px-6 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{h.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Planillas */}
        {pestanaActiva === 'planillas' && (
          <div className="tabla-responsive">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Partido</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Tipo</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Minutos</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Goles</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: 'var(--texto-secundario)', background: 'var(--fondo-principal)' }}>Asistencias</th>
                </tr>
              </thead>
              <tbody>
                {planillasJugador.map((p, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--borde-suave)' }}>
                    <td className="px-6 py-3 text-sm" style={{ color: 'var(--texto-secundario)' }}>{p.fecha}</td>
                    <td className="px-6 py-3 text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>{p.partido}</td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: p.tipo === 'Titular' ? '#DEF7EC' : '#EBF5FF',
                          color: p.tipo === 'Titular' ? '#03543F' : '#1E40AF',
                        }}
                      >
                        {p.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-center font-semibold" style={{ color: 'var(--texto-primario)' }}>{p.minutos}&apos;</td>
                    <td className="px-6 py-3 text-sm text-center font-semibold" style={{ color: 'var(--texto-primario)' }}>{p.goles}</td>
                    <td className="px-6 py-3 text-sm text-center font-semibold" style={{ color: 'var(--texto-primario)' }}>{p.asistencias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
