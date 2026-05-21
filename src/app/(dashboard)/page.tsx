'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy, Users, DollarSign, Calendar, Grid3X3, FileText,
  ArrowUpRight, AlertTriangle, Monitor, Beaker, ChevronRight,
  TrendingUp, Clock, Shield, CheckCircle2, XCircle, Minus
} from 'lucide-react';

// ============================================
// DATOS DE EJEMPLO (se reemplazarán con Supabase)
// ============================================
const datosKPI = [
  {
    id: 'competiciones',
    titulo: 'Competiciones Activas',
    valor: '2',
    icono: Trophy,
    colorFondo: '#EBF5FF',
    colorIcono: '#2980B9',
    enlace: '/competiciones',
  },
  {
    id: 'habilitaciones',
    titulo: 'Habilitaciones Pendientes',
    valor: '0',
    icono: Users,
    colorFondo: '#DEF7EC',
    colorIcono: '#27AE60',
    enlace: '/jugadores',
  },
  {
    id: 'multas',
    titulo: 'Multas del Mes',
    valor: '$ 30.00',
    icono: DollarSign,
    colorFondo: '#FEF3C7',
    colorIcono: '#D4A843',
    enlace: '/disciplinario/multas',
  },
  {
    id: 'partidos',
    titulo: 'Partidos Próximos',
    valor: '179',
    icono: Calendar,
    colorFondo: '#EBF5FF',
    colorIcono: '#2980B9',
    enlace: '/competiciones/fixture',
  },
];

const jugadoresEjemplo = [
  { nombre: 'Ángel Mena', club: 'León de Quito', estado: 'ACTIVO' },
  { nombre: 'Gonzalo Plata', club: 'Barcelona SC', estado: 'PENDIENTE' },
  { nombre: 'Moisés Caicedo', club: 'Independiente', estado: 'ACTIVO' },
  { nombre: 'Enner Valencia', club: 'Emelec', estado: 'ACTIVO' },
  { nombre: 'Pervis Estupiñán', club: 'LDU Quito', estado: 'SUSPENDIDO' },
];

const planillasEjemplo = [
  { local: 'Barcelona SC', visitante: 'Emelec', golLocal: 1, golVisit: 0, estado: 'Finalizado' },
  { local: 'LDU Quito', visitante: 'El Nacional', golLocal: 2, golVisit: 1, estado: 'Finalizado' },
  { local: 'Independiente', visitante: 'Aucas', golLocal: 2, golVisit: 2, estado: 'Finalizado' },
];

const novedadesEjemplo = [
  {
    titulo: 'Barcelona SC 2 - 1 Emelec',
    subtitulo: 'Clásico del Astillero',
    fecha: '21 de Mayo, 2026',
    tipo: 'resultado',
  },
  {
    titulo: 'LDU Quito 0 - 1 Independiente',
    subtitulo: 'Jornada 15 - Serie A',
    fecha: '21 de Mayo, 2026',
    tipo: 'resultado',
  },
  {
    titulo: 'Deportivo Cuenca 0 - 0 Mushuc Runa',
    subtitulo: 'Jornada 15 - Serie A',
    fecha: '21 de Mayo, 2026',
    tipo: 'resultado',
  },
];

// Componente de Insignia de estado
function Insignia({ estado }: { estado: string }) {
  const estilos: Record<string, { bg: string; text: string }> = {
    ACTIVO: { bg: '#DEF7EC', text: '#03543F' },
    PENDIENTE: { bg: '#FEF3C7', text: '#92400E' },
    SUSPENDIDO: { bg: '#FFEDD5', text: '#9A3412' },
    RECHAZADO: { bg: '#FEE2E2', text: '#991B1B' },
  };
  const estilo = estilos[estado] || estilos.ACTIVO;

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: estilo.bg, color: estilo.text }}
    >
      {estado === 'ACTIVO' ? 'Activo' : estado === 'PENDIENTE' ? 'Pendiente' : estado === 'SUSPENDIDO' ? 'Suspendido' : 'Rechazado'}
    </span>
  );
}

export default function PaginaDashboard() {
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    setAnimado(true);
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Título de bienvenida */}
      <div
        className={`transition-all duration-500 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
          Panel de Control
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
          Bienvenido al Sistema Integral de Gestión de Competiciones
        </p>
      </div>

      {/* ============ FILA 1: KPI CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {datosKPI.map((kpi, i) => {
          const Icono = kpi.icono;
          return (
            <Link
              key={kpi.id}
              href={kpi.enlace}
              className="group no-underline"
              style={{
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div
                className={`flex items-center gap-4 p-5 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
                style={{
                  background: 'var(--fondo-tarjeta)',
                  boxShadow: 'var(--sombra-tarjeta)',
                  border: '1px solid var(--borde-suave)',
                  animationDelay: `${i * 80}ms`,
                  animationFillMode: 'both',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{
                    width: '52px',
                    height: '52px',
                    background: kpi.colorFondo,
                  }}
                >
                  <Icono size={24} style={{ color: kpi.colorIcono }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--texto-secundario)' }}
                  >
                    {kpi.titulo}
                  </p>
                  <p
                    className="text-2xl font-bold mt-0.5"
                    style={{ color: 'var(--texto-primario)' }}
                  >
                    {kpi.valor}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ============ FILA 2: PANELES PRINCIPALES (3 columnas) ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* --- Gestión del Campeonato (DORADO) --- */}
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
            animationDelay: '300ms',
            animationFillMode: 'both',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3.5"
            style={{
              background: 'linear-gradient(135deg, #D4A843, #B8922F)',
            }}
          >
            <Grid3X3 size={20} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Gestión del Campeonato</h2>
          </div>
          <div className="p-4 space-y-1">
            {[
              { icono: TrendingUp, texto: 'Tablas del Campeonato', href: '/competiciones' },
              { icono: Calendar, texto: 'Fixtures del Campeonato', href: '/competiciones/fixture' },
              { icono: ArrowUpRight, texto: 'Desempates del Desempate', href: '/competiciones/desempate' },
            ].map((item) => {
              const Ic = item.icono;
              return (
                <Link
                  key={item.texto}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline transition-all"
                  style={{ color: 'var(--texto-primario)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--fondo-principal)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <Ic size={18} style={{ color: 'var(--ligapro-gold)' }} />
                  {item.texto}
                  <ChevronRight size={16} className="ml-auto" style={{ color: 'var(--texto-terciario)' }} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- Habilitación de Jugadores y Staff (AZUL) --- */}
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
            animationDelay: '400ms',
            animationFillMode: 'both',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3.5"
            style={{
              background: 'linear-gradient(135deg, #2980B9, #1F6691)',
            }}
          >
            <Users size={20} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Habilitación de Jugadores y Staff</h2>
          </div>
          <div className="p-4">
            {/* Tabla de jugadores */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-xs font-semibold" style={{ color: 'var(--texto-secundario)' }}>Jugador</th>
                    <th className="pb-3 text-xs font-semibold" style={{ color: 'var(--texto-secundario)' }}>Club</th>
                    <th className="pb-3 text-xs font-semibold text-right" style={{ color: 'var(--texto-secundario)' }}>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {jugadoresEjemplo.map((j, i) => (
                    <tr
                      key={i}
                      className="border-t"
                      style={{ borderColor: 'var(--borde-suave)' }}
                    >
                      <td className="py-2.5 text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>
                        {j.nombre}
                      </td>
                      <td className="py-2.5 text-sm" style={{ color: 'var(--texto-secundario)' }}>
                        {j.club}
                      </td>
                      <td className="py-2.5 text-right">
                        <Insignia estado={j.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- Planillas de Juego (ROJO) --- */}
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
            animationDelay: '500ms',
            animationFillMode: 'both',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              background: 'linear-gradient(135deg, #C0392B, #96281B)',
            }}
          >
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-white" />
              <h2 className="text-white font-semibold text-sm">Planillas de Juego</h2>
            </div>
            <Link
              href="/planillas/nueva"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold no-underline transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Generar Planilla
            </Link>
          </div>
          <div className="p-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--texto-secundario)' }}>
              Planillas Recientes
            </p>
            <div className="space-y-2">
              {planillasEjemplo.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: 'var(--fondo-principal)',
                    border: '1px solid var(--borde-suave)',
                  }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold" style={{ color: 'var(--texto-primario)' }}>
                      {p.local}
                    </span>
                    <span
                      className="flex items-center justify-center rounded font-bold text-xs px-2 py-0.5"
                      style={{
                        background: 'var(--ligapro-navy)',
                        color: 'white',
                        minWidth: '44px',
                      }}
                    >
                      {p.golLocal} - {p.golVisit}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--texto-primario)' }}>
                      {p.visitante}
                    </span>
                  </div>
                  <Link
                    href={`/planillas/${i + 1}`}
                    className="text-xs font-medium no-underline"
                    style={{ color: 'var(--ligapro-blue)' }}
                  >
                    Ver
                  </Link>
                </div>
              ))}
            </div>
            <Link
              href="/planillas/nueva"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white no-underline transition-all"
              style={{
                background: 'linear-gradient(135deg, #C0392B, #96281B)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              <FileText size={16} />
              Generar Planilla
            </Link>
          </div>
        </div>
      </div>

      {/* ============ FILA 3: PANELES SECUNDARIOS (4 columnas) ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* --- Control Disciplinario (ROJO) --- */}
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
            animationDelay: '600ms',
            animationFillMode: 'both',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              background: 'linear-gradient(135deg, #C0392B, #96281B)',
            }}
          >
            <AlertTriangle size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Control Disciplinario</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Tarjeta Amarilla */}
              <Link
                href="/disciplinario"
                className="flex flex-col items-center gap-2 p-4 rounded-lg no-underline transition-all"
                style={{
                  background: 'var(--fondo-principal)',
                  border: '1px solid var(--borde-suave)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#D4A843';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--borde-suave)';
                }}
              >
                <div
                  className="rounded-lg flex items-center justify-center"
                  style={{ width: '48px', height: '64px', background: '#F59E0B' }}
                />
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--texto-primario)' }}>
                  Recientes Disciplinario
                </span>
              </Link>
              {/* Tarjeta Roja */}
              <Link
                href="/disciplinario"
                className="flex flex-col items-center gap-2 p-4 rounded-lg no-underline transition-all"
                style={{
                  background: 'var(--fondo-principal)',
                  border: '1px solid var(--borde-suave)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#C0392B';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--borde-suave)';
                }}
              >
                <div
                  className="rounded-lg flex items-center justify-center"
                  style={{ width: '48px', height: '64px', background: '#EF4444' }}
                />
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--texto-primario)' }}>
                  Resumen Suspensiones
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* --- Infraestructura & VAR (AZUL) --- */}
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
            animationDelay: '700ms',
            animationFillMode: 'both',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              background: 'linear-gradient(135deg, #2980B9, #1F6691)',
            }}
          >
            <Monitor size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Infraestructura & VAR</h2>
          </div>
          <div className="p-4 space-y-2">
            <Link
              href="/infraestructura"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline transition-all"
              style={{
                background: 'var(--fondo-principal)',
                border: '1px solid var(--borde-suave)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ligapro-blue)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--borde-suave)';
              }}
            >
              <CheckCircle2 size={16} style={{ color: 'var(--ligapro-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>
                Checklist Estadio
              </span>
              <span
                className="ml-auto px-2 py-0.5 rounded text-xs font-semibold"
                style={{ background: '#DEF7EC', color: '#03543F' }}
              >
                Checklist
              </span>
            </Link>
            <Link
              href="/infraestructura"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline transition-all"
              style={{
                background: 'var(--fondo-principal)',
                border: '1px solid var(--borde-suave)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ligapro-blue)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--borde-suave)';
              }}
            >
              <CheckCircle2 size={16} style={{ color: 'var(--ligapro-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>
                Checklist de Cancha
              </span>
            </Link>
            <Link
              href="/infraestructura/var"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline transition-all"
              style={{
                background: 'var(--fondo-principal)',
                border: '1px solid var(--borde-suave)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ligapro-blue)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--borde-suave)';
              }}
            >
              <Monitor size={16} style={{ color: 'var(--ligapro-blue)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>
                VOR
              </span>
              <span
                className="ml-auto px-2 py-0.5 rounded text-xs font-semibold"
                style={{ background: '#EBF5FF', color: '#1E40AF' }}
              >
                VOR
              </span>
            </Link>
          </div>
        </div>

        {/* --- Control de Dopaje (ROJO) --- */}
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
            animationDelay: '800ms',
            animationFillMode: 'both',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              background: 'linear-gradient(135deg, #C0392B, #96281B)',
            }}
          >
            <Beaker size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Control de Dopaje</h2>
          </div>
          <div className="p-4 flex flex-col items-center justify-center py-8">
            <div
              className="flex items-center justify-center rounded-full mb-3"
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--fondo-principal)',
                border: '2px solid var(--borde-suave)',
              }}
            >
              <Beaker size={28} style={{ color: 'var(--ligapro-blue)' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
              Control de Dopaje
            </p>
            <p className="text-xs text-center mt-1" style={{ color: 'var(--texto-secundario)' }}>
              Sin pruebas pendientes
            </p>
          </div>
        </div>

        {/* --- Novedades --- */}
        <div
          className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
          style={{
            background: 'var(--fondo-tarjeta)',
            boxShadow: 'var(--sombra-tarjeta)',
            border: '1px solid var(--borde-suave)',
            animationDelay: '900ms',
            animationFillMode: 'both',
          }}
        >
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              background: 'var(--fondo-tarjeta)',
              borderBottom: '1px solid var(--borde-suave)',
            }}
          >
            <Clock size={18} style={{ color: 'var(--texto-primario)' }} />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--texto-primario)' }}>
              Novedades
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {novedadesEjemplo.map((n, i) => (
              <div
                key={i}
                className="pb-3 border-b last:border-b-0"
                style={{ borderColor: 'var(--borde-suave)' }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
                  {n.titulo}
                </p>
                <p className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                  {n.subtitulo}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--texto-terciario)' }}>
                  {n.fecha}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
