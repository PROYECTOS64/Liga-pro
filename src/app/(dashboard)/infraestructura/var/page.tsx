'use client';

import { useState, useEffect } from 'react';
import {
  Monitor, Wifi, Camera, Zap, CheckCircle2, XCircle,
  ArrowRight, Shield, Tv, Eye, Users, AlertTriangle,
  ChevronDown, ChevronUp, Info
} from 'lucide-react';

interface EstadioVARData {
  id: string;
  nombre: string;
  ciudad: string;
  club: string;
  firmas: {
    direccionArbitraje: boolean;
    escenariosSeguridad: boolean;
    derechosTV: boolean;
    proveedorVAR: boolean;
  };
  velocidadInternet: number;
  alturaCamaras: number;
  voltaje: number;
  estadoCertificacion: string;
}

const firmasLabels: { key: keyof EstadioVARData['firmas']; label: string; icono: typeof Shield }[] = [
  { key: 'direccionArbitraje', label: 'Dirección de Arbitraje', icono: Shield },
  { key: 'escenariosSeguridad', label: 'Escenarios y Seguridad', icono: Eye },
  { key: 'derechosTV', label: 'Derechos de TV', icono: Tv },
  { key: 'proveedorVAR', label: 'Proveedor VAR', icono: Monitor },
];

function InsigniaCertificacion({ estado }: { estado: string }) {
  const estilos: Record<string, { bg: string; text: string; label: string }> = {
    certificado: { bg: '#DEF7EC', text: '#03543F', label: 'Certificado' },
    en_proceso: { bg: '#FEF3C7', text: '#92400E', label: 'En Proceso' },
    pendiente: { bg: '#FFEDD5', text: '#9A3412', label: 'Pendiente' },
    no_iniciado: { bg: '#F3F4F6', text: '#6B7280', label: 'No Iniciado' },
  };
  const estilo = estilos[estado] || estilos.no_iniciado;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: estilo.bg, color: estilo.text }}>
      {estilo.label}
    </span>
  );
}

function BarraProgreso({ firmas }: { firmas: Record<string, boolean> }) {
  const total = Object.keys(firmas).length;
  const completadas = Object.values(firmas).filter(Boolean).length;
  const porcentaje = (completadas / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>
          Progreso de Firmas
        </span>
        <span className="text-xs font-bold" style={{ color: porcentaje === 100 ? '#27AE60' : '#D4A843' }}>
          {completadas}/{total}
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${porcentaje}%`,
            background: porcentaje === 100
              ? 'linear-gradient(90deg, #27AE60, #2ECC71)'
              : porcentaje >= 50
                ? 'linear-gradient(90deg, #D4A843, #F0C95C)'
                : 'linear-gradient(90deg, #E74C3C, #EF5350)',
          }}
        />
      </div>
    </div>
  );
}

function IndicadorVelocidad({ velocidad }: { velocidad: number }) {
  const cumple = velocidad >= 100;
  return (
    <div className="flex items-center gap-2">
      <Wifi size={14} style={{ color: cumple ? '#27AE60' : '#C0392B' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>Internet:</span>
      <span className="text-xs font-bold" style={{ color: cumple ? '#27AE60' : '#C0392B' }}>
        {velocidad} Mbps {cumple ? '✓' : '✗ (≥100 req.)'}
      </span>
    </div>
  );
}

function IndicadorCamara({ altura }: { altura: number }) {
  const cumple = altura >= 7;
  return (
    <div className="flex items-center gap-2">
      <Camera size={14} style={{ color: cumple ? '#27AE60' : '#C0392B' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>Cámaras:</span>
      <span className="text-xs font-bold" style={{ color: cumple ? '#27AE60' : '#C0392B' }}>
        {altura}m {cumple ? '✓' : '✗ (≥7m req.)'}
      </span>
    </div>
  );
}

function IndicadorVoltaje({ voltaje }: { voltaje: number }) {
  const cumple = voltaje === 220;
  return (
    <div className="flex items-center gap-2">
      <Zap size={14} style={{ color: cumple ? '#27AE60' : '#C0392B' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--texto-secundario)' }}>Voltaje:</span>
      <span className="text-xs font-bold" style={{ color: cumple ? '#27AE60' : '#C0392B' }}>
        {voltaje}V {cumple ? '✓' : '✗ (220V req.)'}
      </span>
    </div>
  );
}

export default function PaginaVAR() {
  const [expandido, setExpandido] = useState<string | null>(null);
  const [estadiosVAR, setEstadiosVAR] = useState<EstadioVARData[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchVAR() {
      const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
      
      const { data: estadios, error } = await supabase
        .from('estadios')
        .select(`
          id,
          nombre,
          ciudad,
          clubes(nombre),
          certificacion_var(
            firma_arbitraje,
            firma_escenarios,
            firma_derechos_tv,
            firma_proveedor_var,
            velocidad_internet_mbps,
            altura_camara_linea_gol_m,
            voltaje_electrico,
            estado
          )
        `);

      if (estadios) {
        const formateados = estadios.map((e: any) => {
          const varData = e.certificacion_var && e.certificacion_var.length > 0 ? e.certificacion_var[0] : null;
          
          return {
            id: e.id,
            nombre: e.nombre,
            ciudad: e.ciudad,
            club: e.clubes && e.clubes.length > 0 ? e.clubes[0].nombre : 'Varios clubes',
            firmas: {
              direccionArbitraje: varData?.firma_arbitraje || false,
              escenariosSeguridad: varData?.firma_escenarios || false,
              derechosTV: varData?.firma_derechos_tv || false,
              proveedorVAR: varData?.firma_proveedor_var || false,
            },
            velocidadInternet: varData?.velocidad_internet_mbps || 0,
            alturaCamaras: varData?.altura_camara_linea_gol_m || 0,
            voltaje: varData?.voltaje_electrico || 0,
            estadoCertificacion: varData?.estado?.toLowerCase() || 'no_iniciado',
          };
        });
        setEstadiosVAR(formateados);
      }
      setCargando(false);
    }
    fetchVAR();
  }, []);

  const totalCertificados = estadiosVAR.filter(e => e.estadoCertificacion === 'certificado').length;
  const totalEnProceso = estadiosVAR.filter(e => e.estadoCertificacion === 'en_proceso').length;
  const totalPendientes = estadiosVAR.filter(e => e.estadoCertificacion === 'pendiente' || e.estadoCertificacion === 'no_iniciado').length;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
          Certificación VAR y Adecuación Tecnológica
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
          Estado de certificación del Sistema de Videoarbitraje en los estadios
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#DEF7EC' }}>
            <CheckCircle2 size={24} style={{ color: '#27AE60' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Certificados</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{totalCertificados}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#FEF3C7' }}>
            <AlertTriangle size={24} style={{ color: '#D4A843' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>En Proceso</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{totalEnProceso}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#FEE2E2' }}>
            <XCircle size={24} style={{ color: '#C0392B' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Pendientes</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{totalPendientes}</p>
          </div>
        </div>
      </div>

      {/* Diagrama de Flujo del Proceso */}
      <div className="rounded-xl overflow-hidden" style={{
        background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
      }}>
        <div className="flex items-center gap-3 px-5 py-3.5" style={{
          background: 'linear-gradient(135deg, #1B2A4A, #111D35)',
        }}>
          <Info size={18} className="text-white" />
          <h2 className="text-white font-semibold text-sm">Flujo de Certificación VAR</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { paso: '1', texto: 'Solicitud del Club', color: '#2980B9' },
              { paso: '2', texto: 'Inspección Técnica', color: '#D4A843' },
              { paso: '3', texto: 'Firma Dir. Arbitraje', color: '#8E44AD' },
              { paso: '4', texto: 'Firma Escenarios', color: '#E67E22' },
              { paso: '5', texto: 'Firma Derechos TV', color: '#C0392B' },
              { paso: '6', texto: 'Firma Proveedor VAR', color: '#27AE60' },
              { paso: '7', texto: 'Certificación Final', color: '#1B2A4A' },
            ].map((paso, i, arr) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="flex items-center justify-center rounded-full text-white text-xs font-bold"
                    style={{ width: '32px', height: '32px', background: paso.color }}
                  >
                    {paso.paso}
                  </div>
                  <span className="text-[10px] font-medium text-center max-w-[80px]" style={{ color: 'var(--texto-secundario)' }}>
                    {paso.texto}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight size={16} style={{ color: 'var(--texto-terciario)' }} className="mt-[-16px]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadios */}
      <div className="space-y-4">
        {estadiosVAR.map((estadio) => {
          const isExpanded = expandido === estadio.id;
          return (
            <div
              key={estadio.id}
              className="rounded-xl overflow-hidden transition-all duration-300"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer"
                style={{
                  background: estadio.estadoCertificacion === 'certificado'
                    ? 'linear-gradient(135deg, #27AE60, #1E8449)'
                    : estadio.estadoCertificacion === 'en_proceso'
                      ? 'linear-gradient(135deg, #D4A843, #B8922F)'
                      : 'linear-gradient(135deg, #C0392B, #96281B)',
                }}
                onClick={() => setExpandido(isExpanded ? null : estadio.id)}
              >
                <div className="flex items-center gap-3">
                  <Monitor size={18} className="text-white" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{estadio.nombre}</h3>
                    <p className="text-white/70 text-xs">{estadio.club} — {estadio.ciudad}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <InsigniaCertificacion estado={estadio.estadoCertificacion} />
                  {isExpanded ? <ChevronUp size={18} className="text-white" /> : <ChevronDown size={18} className="text-white" />}
                </div>
              </div>

              {/* Contenido resumido siempre visible */}
              <div className="px-5 py-4">
                <BarraProgreso firmas={estadio.firmas} />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {firmasLabels.map((firma) => {
                    const Icono = firma.icono;
                    const completada = estadio.firmas[firma.key];
                    return (
                      <div
                        key={firma.key}
                        className="flex items-center gap-2 p-3 rounded-lg"
                        style={{
                          background: completada ? '#F0FFF4' : '#FFF5F5',
                          border: `1px solid ${completada ? '#C6F6D5' : '#FED7D7'}`,
                        }}
                      >
                        {completada
                          ? <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
                          : <XCircle size={16} style={{ color: '#C0392B' }} />}
                        <div>
                          <p className="text-[11px] font-semibold" style={{ color: completada ? '#22543D' : '#742A2A' }}>
                            {firma.label}
                          </p>
                          <p className="text-[10px]" style={{ color: completada ? '#276749' : '#9B2C2C' }}>
                            {completada ? 'Aprobado' : 'Pendiente'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contenido expandido */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t" style={{ borderColor: 'var(--borde-suave)' }}>
                  <h4 className="text-sm font-semibold mt-4 mb-3" style={{ color: 'var(--texto-primario)' }}>
                    Requisitos Técnicos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Velocidad de Internet */}
                    <div className="p-4 rounded-lg" style={{
                      background: 'var(--fondo-principal)',
                      border: '1px solid var(--borde-suave)',
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Wifi size={16} style={{ color: estadio.velocidadInternet >= 100 ? '#27AE60' : '#C0392B' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--texto-primario)' }}>
                          Velocidad Internet
                        </span>
                      </div>
                      <p className="text-2xl font-bold" style={{
                        color: estadio.velocidadInternet >= 100 ? '#27AE60' : '#C0392B'
                      }}>
                        {estadio.velocidadInternet} <span className="text-sm font-normal">Mbps</span>
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--texto-terciario)' }}>
                        Mínimo requerido: 100 Mbps
                      </p>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(100, (estadio.velocidadInternet / 300) * 100)}%`,
                          background: estadio.velocidadInternet >= 100
                            ? 'linear-gradient(90deg, #27AE60, #2ECC71)'
                            : 'linear-gradient(90deg, #C0392B, #E74C3C)',
                        }} />
                      </div>
                    </div>

                    {/* Altura de Cámaras */}
                    <div className="p-4 rounded-lg" style={{
                      background: 'var(--fondo-principal)',
                      border: '1px solid var(--borde-suave)',
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Camera size={16} style={{ color: estadio.alturaCamaras >= 7 ? '#27AE60' : '#C0392B' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--texto-primario)' }}>
                          Altura de Cámaras
                        </span>
                      </div>
                      <p className="text-2xl font-bold" style={{
                        color: estadio.alturaCamaras >= 7 ? '#27AE60' : '#C0392B'
                      }}>
                        {estadio.alturaCamaras} <span className="text-sm font-normal">metros</span>
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--texto-terciario)' }}>
                        Mínimo requerido: 7 metros
                      </p>
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(100, (estadio.alturaCamaras / 15) * 100)}%`,
                          background: estadio.alturaCamaras >= 7
                            ? 'linear-gradient(90deg, #27AE60, #2ECC71)'
                            : 'linear-gradient(90deg, #C0392B, #E74C3C)',
                        }} />
                      </div>
                    </div>

                    {/* Voltaje Eléctrico */}
                    <div className="p-4 rounded-lg" style={{
                      background: 'var(--fondo-principal)',
                      border: '1px solid var(--borde-suave)',
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} style={{ color: estadio.voltaje === 220 ? '#27AE60' : '#C0392B' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--texto-primario)' }}>
                          Voltaje Eléctrico
                        </span>
                      </div>
                      <p className="text-2xl font-bold" style={{
                        color: estadio.voltaje === 220 ? '#27AE60' : '#C0392B'
                      }}>
                        {estadio.voltaje} <span className="text-sm font-normal">V</span>
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--texto-terciario)' }}>
                        Requerido: 220V
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {estadio.voltaje === 220
                          ? <CheckCircle2 size={14} style={{ color: '#27AE60' }} />
                          : <XCircle size={14} style={{ color: '#C0392B' }} />
                        }
                        <span className="text-xs font-semibold" style={{
                          color: estadio.voltaje === 220 ? '#27AE60' : '#C0392B'
                        }}>
                          {estadio.voltaje === 220 ? 'Cumple' : 'No cumple'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen rápido de indicadores */}
                  <div className="mt-4 p-3 rounded-lg space-y-2" style={{
                    background: 'var(--fondo-principal)',
                    border: '1px solid var(--borde-suave)',
                  }}>
                    <IndicadorVelocidad velocidad={estadio.velocidadInternet} />
                    <IndicadorCamara altura={estadio.alturaCamaras} />
                    <IndicadorVoltaje voltaje={estadio.voltaje} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
