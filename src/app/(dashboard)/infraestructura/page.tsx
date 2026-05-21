'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck, MapPin, Building2, Leaf, ShieldCheck,
  ShieldAlert, CalendarCheck, Ruler, Search, Filter,
  ChevronRight, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';

// ============================================
// DATOS DE EJEMPLO - 10 ESTADIOS ECUATORIANOS
// ============================================
const estadiosData = [
  {
    id: 'monumental',
    nombre: 'Estadio Monumental Banco Pichincha',
    ciudad: 'Guayaquil',
    club: 'Barcelona SC',
    tipoCesped: 'Natural',
    certificadoFIFA: 'vigente',
    fechaVencimientoFIFA: '2027-03-15',
    ultimaInspeccion: '2026-04-10',
    alturaCesped: 22,
    capacidad: 59283,
  },
  {
    id: 'rodrigo-paz',
    nombre: 'Estadio Rodrigo Paz Delgado',
    ciudad: 'Quito',
    club: 'LDU Quito',
    tipoCesped: 'Natural',
    certificadoFIFA: 'vigente',
    fechaVencimientoFIFA: '2026-12-01',
    ultimaInspeccion: '2026-05-02',
    alturaCesped: 23,
    capacidad: 41575,
  },
  {
    id: 'george-capwell',
    nombre: 'Estadio George Capwell',
    ciudad: 'Guayaquil',
    club: 'Emelec',
    tipoCesped: 'Natural',
    certificadoFIFA: 'vigente',
    fechaVencimientoFIFA: '2026-08-20',
    ultimaInspeccion: '2026-03-28',
    alturaCesped: 21,
    capacidad: 40000,
  },
  {
    id: 'atahualpa',
    nombre: 'Estadio Olímpico Atahualpa',
    ciudad: 'Quito',
    club: 'El Nacional / Varios',
    tipoCesped: 'Natural',
    certificadoFIFA: 'expirado',
    fechaVencimientoFIFA: '2025-11-30',
    ultimaInspeccion: '2026-01-15',
    alturaCesped: 27,
    capacidad: 35258,
  },
  {
    id: 'gonzalo-pozo',
    nombre: 'Estadio Gonzalo Pozo Ripalda',
    ciudad: 'Quito',
    club: 'Aucas',
    tipoCesped: 'Sintético',
    certificadoFIFA: 'vigente',
    fechaVencimientoFIFA: '2027-01-10',
    ultimaInspeccion: '2026-04-22',
    alturaCesped: 20,
    capacidad: 19731,
  },
  {
    id: 'christian-benitez',
    nombre: 'Estadio Christian Benítez',
    ciudad: 'Guayaquil',
    club: 'Guayaquil City',
    tipoCesped: 'Natural',
    certificadoFIFA: 'expirado',
    fechaVencimientoFIFA: '2025-06-30',
    ultimaInspeccion: '2025-12-01',
    alturaCesped: 26,
    capacidad: 14000,
  },
  {
    id: 'alejandro-serrano',
    nombre: 'Estadio Alejandro Serrano Aguilar',
    ciudad: 'Cuenca',
    club: 'Deportivo Cuenca',
    tipoCesped: 'Natural',
    certificadoFIFA: 'vigente',
    fechaVencimientoFIFA: '2026-09-15',
    ultimaInspeccion: '2026-05-08',
    alturaCesped: 24,
    capacidad: 23456,
  },
  {
    id: 'jocay',
    nombre: 'Estadio Jocay',
    ciudad: 'Manta',
    club: 'Delfín SC',
    tipoCesped: 'Sintético',
    certificadoFIFA: 'vigente',
    fechaVencimientoFIFA: '2027-02-28',
    ultimaInspeccion: '2026-04-30',
    alturaCesped: 21,
    capacidad: 18000,
  },
  {
    id: 'bellavista',
    nombre: 'Estadio de Liga Bellavista',
    ciudad: 'Ambato',
    club: 'Mushuc Runa',
    tipoCesped: 'Natural',
    certificadoFIFA: 'expirado',
    fechaVencimientoFIFA: '2025-09-01',
    ultimaInspeccion: '2025-10-20',
    alturaCesped: 28,
    capacidad: 12000,
  },
  {
    id: 'rumiñahui',
    nombre: 'Estadio Rumiñahui',
    ciudad: 'Sangolquí',
    club: 'Independiente del Valle',
    tipoCesped: 'Natural',
    certificadoFIFA: 'vigente',
    fechaVencimientoFIFA: '2027-06-30',
    ultimaInspeccion: '2026-05-15',
    alturaCesped: 22,
    capacidad: 12000,
  },
];

// Componente de insignia de certificación
function InsigniaFIFA({ estado }: { estado: string }) {
  if (estado === 'vigente') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: '#DEF7EC', color: '#03543F' }}>
        <ShieldCheck size={13} />
        Certificado Vigente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: '#FEE2E2', color: '#991B1B' }}>
      <ShieldAlert size={13} />
      Certificado Expirado
    </span>
  );
}

// Componente indicador de altura de césped
function IndicadorAltura({ altura }: { altura: number }) {
  const enRango = altura >= 20 && altura <= 25;
  const porcentaje = Math.min(100, Math.max(0, ((altura - 15) / 15) * 100));

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${porcentaje}%`,
            background: enRango
              ? 'linear-gradient(90deg, #27AE60, #2ECC71)'
              : 'linear-gradient(90deg, #E74C3C, #C0392B)',
          }}
        />
      </div>
      <span className="text-xs font-bold whitespace-nowrap" style={{ color: enRango ? '#27AE60' : '#C0392B' }}>
        {altura}mm {enRango ? '✓' : '✗'}
      </span>
    </div>
  );
}

export default function PaginaInfraestructura() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'vigente' | 'expirado'>('todos');

  const estadiosFiltrados = estadiosData.filter((e) => {
    const coincideBusqueda =
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.club.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro =
      filtroEstado === 'todos' || e.certificadoFIFA === filtroEstado;
    return coincideBusqueda && coincideFiltro;
  });

  const totalVigentes = estadiosData.filter(e => e.certificadoFIFA === 'vigente').length;
  const totalExpirados = estadiosData.filter(e => e.certificadoFIFA === 'expirado').length;
  const totalFueraRango = estadiosData.filter(e => e.alturaCesped < 20 || e.alturaCesped > 25).length;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
          Fiscalización de Infraestructura y Escenarios
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
          Control y verificación del estado de los estadios del campeonato
        </p>
      </div>

      {/* KPIs Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#DEF7EC' }}>
            <CheckCircle2 size={24} style={{ color: '#27AE60' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Certificados Vigentes</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{totalVigentes}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#FEE2E2' }}>
            <XCircle size={24} style={{ color: '#C0392B' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Certificados Expirados</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{totalExpirados}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#FEF3C7' }}>
            <AlertTriangle size={24} style={{ color: '#D4A843' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Césped Fuera de Rango</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{totalFueraRango}</p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
          <input
            type="text"
            placeholder="Buscar por estadio, ciudad o club..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#2980B9]/30"
            style={{
              background: 'var(--fondo-tarjeta)',
              borderColor: 'var(--borde-suave)',
              color: 'var(--texto-primario)',
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: 'var(--texto-secundario)' }} />
          {(['todos', 'vigente', 'expirado'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filtroEstado === f ? '#1B2A4A' : 'var(--fondo-tarjeta)',
                color: filtroEstado === f ? 'white' : 'var(--texto-secundario)',
                border: `1px solid ${filtroEstado === f ? '#1B2A4A' : 'var(--borde-suave)'}`,
              }}
            >
              {f === 'todos' ? 'Todos' : f === 'vigente' ? 'Vigentes' : 'Expirados'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Estadios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {estadiosFiltrados.map((estadio) => (
          <Link
            key={estadio.id}
            href={`/infraestructura/${estadio.id}`}
            className="group no-underline"
          >
            <div
              className="rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              {/* Header del estadio */}
              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{
                  background: estadio.certificadoFIFA === 'vigente'
                    ? 'linear-gradient(135deg, #27AE60, #1E8449)'
                    : 'linear-gradient(135deg, #C0392B, #96281B)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-white" />
                  <h3 className="text-white font-semibold text-sm truncate max-w-[200px]">
                    {estadio.nombre}
                  </h3>
                </div>
                <ChevronRight size={16} className="text-white/70 group-hover:text-white transition-colors" />
              </div>

              {/* Contenido */}
              <div className="p-5 space-y-4">
                {/* Info básica */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} style={{ color: 'var(--texto-terciario)' }} />
                    <span style={{ color: 'var(--texto-secundario)' }}>{estadio.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 size={14} style={{ color: 'var(--texto-terciario)' }} />
                    <span style={{ color: 'var(--texto-secundario)' }}>{estadio.club}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Leaf size={14} style={{ color: 'var(--texto-terciario)' }} />
                    <span style={{ color: 'var(--texto-secundario)' }}>Césped {estadio.tipoCesped}</span>
                  </div>
                </div>

                {/* Certificado FIFA */}
                <div className="flex items-center justify-between">
                  <InsigniaFIFA estado={estadio.certificadoFIFA} />
                </div>

                {/* Última inspección */}
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--texto-terciario)' }}>
                  <CalendarCheck size={13} />
                  <span>Última inspección: {new Date(estadio.ultimaInspeccion).toLocaleDateString('es-EC')}</span>
                </div>

                {/* Indicador de altura de césped */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>
                      <Ruler size={12} className="inline mr-1" />
                      Altura del Césped (20-25mm)
                    </span>
                  </div>
                  <IndicadorAltura altura={estadio.alturaCesped} />
                </div>

                {/* Botón ver checklist */}
                <div
                  className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: 'var(--fondo-principal)',
                    color: 'var(--ligapro-blue)',
                    border: '1px solid var(--borde-suave)',
                  }}
                >
                  <ClipboardCheck size={14} />
                  Ver Checklist Completo
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {estadiosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} style={{ color: 'var(--texto-terciario)' }} className="mx-auto mb-4" />
          <p className="text-lg font-semibold" style={{ color: 'var(--texto-primario)' }}>
            No se encontraron estadios
          </p>
          <p className="text-sm" style={{ color: 'var(--texto-secundario)' }}>
            Intenta con otros criterios de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
