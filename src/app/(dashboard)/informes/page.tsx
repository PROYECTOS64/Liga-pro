'use client';

import { useState } from 'react';
import {
  FileText, AlertTriangle, DollarSign, Building2, Monitor,
  ClipboardList, Download, Eye, Calendar, Clock,
  ChevronRight, Search, Filter, BarChart3, Printer, FileDown
} from 'lucide-react';

// ============================================
// TIPOS DE INFORMES
// ============================================
const tiposInformes = [
  {
    id: 'partido',
    titulo: 'Informe de Partido',
    descripcion: 'Acta oficial del desarrollo del encuentro con detalles de goles, tarjetas, sustituciones y novedades.',
    icono: FileText,
    colorIcono: '#2980B9',
    colorFondo: '#EBF5FF',
    gradiente: 'linear-gradient(135deg, #2980B9, #1F6691)',
  },
  {
    id: 'disciplinario',
    titulo: 'Reporte Disciplinario',
    descripcion: 'Resumen de sanciones, tarjetas acumuladas, suspensiones y resoluciones del Tribunal Disciplinario.',
    icono: AlertTriangle,
    colorIcono: '#C0392B',
    colorFondo: '#FEE2E2',
    gradiente: 'linear-gradient(135deg, #C0392B, #96281B)',
  },
  {
    id: 'financiero',
    titulo: 'Reporte Financiero (Multas)',
    descripcion: 'Estado de cuenta de multas económicas aplicadas a clubes, con detalle de pagos y saldos pendientes.',
    icono: DollarSign,
    colorIcono: '#D4A843',
    colorFondo: '#FEF3C7',
    gradiente: 'linear-gradient(135deg, #D4A843, #B8922F)',
  },
  {
    id: 'infraestructura',
    titulo: 'Reporte de Infraestructura',
    descripcion: 'Resultado de inspecciones a estadios, estado del césped, iluminación y condiciones generales.',
    icono: Building2,
    colorIcono: '#27AE60',
    colorFondo: '#DEF7EC',
    gradiente: 'linear-gradient(135deg, #27AE60, #1E8449)',
  },
  {
    id: 'var',
    titulo: 'Reporte VAR',
    descripcion: 'Estado de certificación del sistema VAR en cada estadio, incluyendo pruebas técnicas y validaciones.',
    icono: Monitor,
    colorIcono: '#8E44AD',
    colorFondo: '#F3E8FF',
    gradiente: 'linear-gradient(135deg, #8E44AD, #6C3483)',
  },
  {
    id: 'acta-entrega',
    titulo: 'Acta de Entrega-Recepción',
    descripcion: 'Documento oficial de entrega y recepción de escenarios deportivos para cada jornada del campeonato.',
    icono: ClipboardList,
    colorIcono: '#1B2A4A',
    colorFondo: '#E8EDF4',
    gradiente: 'linear-gradient(135deg, #1B2A4A, #111D35)',
  },
];

// ============================================
// INFORMES RECIENTES
// ============================================
const informesRecientes = [
  {
    id: 1,
    tipo: 'Informe de Partido',
    titulo: 'Barcelona SC vs Emelec — Jornada 15',
    fecha: '2026-05-18',
    estado: 'completado',
    autor: 'Carlos Vera',
  },
  {
    id: 2,
    tipo: 'Reporte Disciplinario',
    titulo: 'Resolución TD-2026-089 — Expulsión J. Méndez',
    fecha: '2026-05-17',
    estado: 'completado',
    autor: 'Tribunal Disciplinario',
  },
  {
    id: 3,
    tipo: 'Reporte Financiero',
    titulo: 'Multas Mayo 2026 — Resumen Mensual',
    fecha: '2026-05-15',
    estado: 'borrador',
    autor: 'Control Económico',
  },
  {
    id: 4,
    tipo: 'Reporte de Infraestructura',
    titulo: 'Inspección Estadio Monumental — Pre-Jornada 16',
    fecha: '2026-05-14',
    estado: 'completado',
    autor: 'Ing. Roberto Páez',
  },
  {
    id: 5,
    tipo: 'Acta de Entrega-Recepción',
    titulo: 'Acta EER-J15-001 — George Capwell',
    fecha: '2026-05-13',
    estado: 'pendiente_firma',
    autor: 'Comisario Asignado',
  },
  {
    id: 6,
    tipo: 'Reporte VAR',
    titulo: 'Certificación VAR — Estadio Rodrigo Paz',
    fecha: '2026-05-12',
    estado: 'completado',
    autor: 'Dir. Arbitraje',
  },
  {
    id: 7,
    tipo: 'Informe de Partido',
    titulo: 'LDU Quito vs El Nacional — Jornada 14',
    fecha: '2026-05-11',
    estado: 'completado',
    autor: 'Miguel Ángel Loor',
  },
  {
    id: 8,
    tipo: 'Reporte Disciplinario',
    titulo: 'Acumulación Amarillas — Semana 14-15',
    fecha: '2026-05-10',
    estado: 'completado',
    autor: 'Tribunal Disciplinario',
  },
];

function InsigniaEstado({ estado }: { estado: string }) {
  const estilos: Record<string, { bg: string; text: string; label: string }> = {
    completado: { bg: '#DEF7EC', text: '#03543F', label: 'Completado' },
    borrador: { bg: '#FEF3C7', text: '#92400E', label: 'Borrador' },
    pendiente_firma: { bg: '#FFEDD5', text: '#9A3412', label: 'Pend. Firma' },
    en_proceso: { bg: '#EBF5FF', text: '#1E40AF', label: 'En Proceso' },
  };
  const e = estilos[estado] || estilos.completado;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: e.bg, color: e.text }}>
      {e.label}
    </span>
  );
}

export default function PaginaInformes() {
  const [busqueda, setBusqueda] = useState('');

  const generarPDF = (tipo: any) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Por favor, permite las ventanas emergentes para exportar el PDF.");
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <title>${tipo.titulo}</title>
            <style>
              body { font-family: Arial, sans-serif; color: #333; padding: 20px; }
              h1 { color: ${tipo.colorIcono}; text-align: center; border-bottom: 2px solid ${tipo.colorIcono}; padding-bottom: 10px; }
              p { font-size: 14px; line-height: 1.6; margin-top: 20px; }
              .footer { margin-top: 50px; font-size: 12px; color: #777; text-align: center; }
            </style>
          </head>
          <body>
            <h1>${tipo.titulo}</h1>
            <p><strong>Descripción:</strong> ${tipo.descripcion}</p>
            <p><strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString('es-EC')} ${new Date().toLocaleTimeString('es-EC')}</p>
            <p>Este es un documento oficial generado por el Sistema LigaPro EC.</p>
            <div style="margin-top: 40px; border: 1px dashed #ccc; padding: 20px; background: #f9f9f9;">
              <p>Contenido del reporte generado automáticamente según los parámetros seleccionados en el sistema.</p>
            </div>
            <div class="footer">Liga Profesional de Fútbol del Ecuador</div>
            <script>
              window.onload = () => {
                window.print();
                setTimeout(() => window.close(), 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Hubo un error al generar la vista de impresión.");
    }
  };

  const informesFiltrados = informesRecientes.filter(
    (inf) =>
      inf.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      inf.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      inf.autor.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
            Centro de Informes
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
            Genere, consulte y descargue los reportes oficiales del campeonato
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg" style={{
            background: 'var(--fondo-tarjeta)',
            border: '1px solid var(--borde-suave)',
          }}>
            <BarChart3 size={16} style={{ color: 'var(--texto-secundario)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
              {informesRecientes.length} informes generados
            </span>
          </div>
        </div>
      </div>

      {/* Grid de tipos de informe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tiposInformes.map((tipo) => {
          const Icono = tipo.icono;
          return (
            <div
              key={tipo.id}
              className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              {/* Header */}
              <div className="px-5 py-3.5" style={{ background: tipo.gradiente }}>
                <div className="flex items-center gap-3">
                  <Icono size={20} className="text-white" />
                  <h3 className="text-white font-semibold text-sm">{tipo.titulo}</h3>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{
                    width: '44px', height: '44px', background: tipo.colorFondo,
                  }}>
                    <Icono size={22} style={{ color: tipo.colorIcono }} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--texto-secundario)' }}>
                    {tipo.descripcion}
                  </p>
                </div>
                <button
                  onClick={() => generarPDF(tipo)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: tipo.gradiente }}
                >
                  <FileDown size={16} />
                  Generar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informes Recientes */}
      <div className="rounded-xl overflow-hidden" style={{
        background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
      }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{
          background: 'linear-gradient(135deg, #1B2A4A, #111D35)',
        }}>
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Informes Recientes</h2>
          </div>
          <span className="text-white/60 text-xs">{informesRecientes.length} documentos</span>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--borde-suave)' }}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
            <input
              type="text"
              placeholder="Buscar informes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#2980B9]/30"
              style={{
                background: 'var(--fondo-principal)',
                borderColor: 'var(--borde-suave)',
                color: 'var(--texto-primario)',
              }}
            />
          </div>
        </div>

        {/* Lista de informes */}
        <div className="divide-y" style={{ borderColor: 'var(--borde-suave)' }}>
          {informesFiltrados.map((informe) => (
            <div
              key={informe.id}
              className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50/50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{
                  width: '40px', height: '40px', background: '#EBF5FF',
                }}>
                  <FileText size={18} style={{ color: '#2980B9' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--texto-primario)' }}>
                    {informe.titulo}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                      {informe.tipo}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                      •
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--texto-terciario)' }}>
                      <Calendar size={10} />
                      {new Date(informe.fecha).toLocaleDateString('es-EC')}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                      •
                    </span>
                    <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                      {informe.autor}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <InsigniaEstado estado={informe.estado} />
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Ver informe"
                    onClick={() => alert(`Abriendo vista previa de: ${informe.titulo}`)}>
                    <Eye size={14} style={{ color: 'var(--texto-secundario)' }} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Descargar"
                    onClick={() => alert(`Descargando PDF de: ${informe.titulo}`)}>
                    <Download size={14} style={{ color: 'var(--texto-secundario)' }} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Imprimir"
                    onClick={() => window.print()}>
                    <Printer size={14} style={{ color: 'var(--texto-secundario)' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {informesFiltrados.length === 0 && (
          <div className="text-center py-8">
            <FileText size={40} style={{ color: 'var(--texto-terciario)' }} className="mx-auto mb-3" />
            <p className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
              No se encontraron informes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
