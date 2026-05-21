'use client';

import Link from 'next/link';
import {
  Settings, Users, Calendar, Database, ShieldCheck, Archive,
  ChevronRight, Activity, AlertTriangle, CheckCircle2
} from 'lucide-react';

// ============================================
// FUNCIONES ADMINISTRATIVAS
// ============================================
const funcionesAdmin = [
  {
    id: 'usuarios',
    titulo: 'Gestión de Usuarios',
    descripcion: 'Administre roles, permisos y acceso de usuarios al sistema SIGC.',
    icono: Users,
    href: '/administracion/usuarios',
    colorIcono: '#2980B9',
    colorFondo: '#EBF5FF',
    gradiente: 'linear-gradient(135deg, #2980B9, #1F6691)',
    estadistica: '24 usuarios activos',
  },
  {
    id: 'configuracion',
    titulo: 'Configuración del Sistema',
    descripcion: 'Parámetros del campeonato, valores de multas, integraciones y notificaciones.',
    icono: Settings,
    href: '/administracion/configuracion',
    colorIcono: '#D4A843',
    colorFondo: '#FEF3C7',
    gradiente: 'linear-gradient(135deg, #D4A843, #B8922F)',
    estadistica: 'Última actualización: hace 2h',
  },
  {
    id: 'calendario-fifa',
    titulo: 'Calendario FIFA',
    descripcion: 'Gestión de fechas FIFA, ventanas de transferencias y paros internacionales.',
    icono: Calendar,
    href: '/administracion/configuracion',
    colorIcono: '#27AE60',
    colorFondo: '#DEF7EC',
    gradiente: 'linear-gradient(135deg, #27AE60, #1E8449)',
    estadistica: '3 fechas FIFA restantes',
  },
  {
    id: 'datos-maestros',
    titulo: 'Datos Maestros',
    descripcion: 'Catálogos base: ciudades, categorías, tipos de sanción, parámetros generales.',
    icono: Database,
    href: '/administracion/configuracion',
    colorIcono: '#8E44AD',
    colorFondo: '#F3E8FF',
    gradiente: 'linear-gradient(135deg, #8E44AD, #6C3483)',
    estadistica: '12 catálogos configurados',
  },
  {
    id: 'auditoria',
    titulo: 'Auditoría',
    descripcion: 'Registro de actividad del sistema, trazabilidad de cambios y accesos.',
    icono: ShieldCheck,
    href: '/administracion/configuracion',
    colorIcono: '#C0392B',
    colorFondo: '#FEE2E2',
    gradiente: 'linear-gradient(135deg, #C0392B, #96281B)',
    estadistica: '1,247 eventos registrados',
  },
  {
    id: 'respaldos',
    titulo: 'Respaldos',
    descripcion: 'Gestión de copias de seguridad de la base de datos y archivos del sistema.',
    icono: Archive,
    href: '/administracion/configuracion',
    colorIcono: '#1B2A4A',
    colorFondo: '#E8EDF4',
    gradiente: 'linear-gradient(135deg, #1B2A4A, #111D35)',
    estadistica: 'Último respaldo: hoy 06:00',
  },
];

// ============================================
// ACTIVIDAD RECIENTE
// ============================================
const actividadReciente = [
  { accion: 'Usuario creado: María Fernanda López', tipo: 'info', hora: 'Hace 15 min' },
  { accion: 'Configuración SBU actualizada a $460.00', tipo: 'warning', hora: 'Hace 1 hora' },
  { accion: 'Respaldo automático completado', tipo: 'success', hora: 'Hace 2 horas' },
  { accion: 'Rol COMISARIO asignado a Pedro Gómez', tipo: 'info', hora: 'Hace 3 horas' },
  { accion: 'Integración COMET API verificada', tipo: 'success', hora: 'Hace 5 horas' },
];

export default function PaginaAdministracion() {
  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
          Panel de Administración
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
          Configuración y gestión del sistema SIGC-LigaPro
        </p>
      </div>

      {/* Grid de funciones administrativas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {funcionesAdmin.map((func) => {
          const Icono = func.icono;
          return (
            <Link
              key={func.id}
              href={func.href}
              className="group no-underline"
            >
              <div
                className="rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 h-full"
                style={{
                  background: 'var(--fondo-tarjeta)',
                  boxShadow: 'var(--sombra-tarjeta)',
                  border: '1px solid var(--borde-suave)',
                }}
              >
                {/* Header */}
                <div className="px-5 py-3.5" style={{ background: func.gradiente }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icono size={20} className="text-white" />
                      <h3 className="text-white font-semibold text-sm">{func.titulo}</h3>
                    </div>
                    <ChevronRight size={16} className="text-white/50 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{
                      width: '44px', height: '44px', background: func.colorFondo,
                    }}>
                      <Icono size={22} style={{ color: func.colorIcono }} />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--texto-secundario)' }}>
                      {func.descripcion}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--borde-suave)' }}>
                    <Activity size={12} style={{ color: 'var(--texto-terciario)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--texto-terciario)' }}>
                      {func.estadistica}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Actividad Reciente */}
      <div className="rounded-xl overflow-hidden" style={{
        background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
      }}>
        <div className="flex items-center gap-3 px-5 py-3.5" style={{
          background: 'linear-gradient(135deg, #1B2A4A, #111D35)',
        }}>
          <Activity size={18} className="text-white" />
          <h2 className="text-white font-semibold text-sm">Actividad Reciente del Sistema</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--borde-suave)' }}>
          {actividadReciente.map((act, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{
                width: '32px', height: '32px',
                background: act.tipo === 'success' ? '#DEF7EC' : act.tipo === 'warning' ? '#FEF3C7' : '#EBF5FF',
              }}>
                {act.tipo === 'success' ? (
                  <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
                ) : act.tipo === 'warning' ? (
                  <AlertTriangle size={16} style={{ color: '#D4A843' }} />
                ) : (
                  <Activity size={16} style={{ color: '#2980B9' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--texto-primario)' }}>
                  {act.accion}
                </p>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--texto-terciario)' }}>
                {act.hora}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
