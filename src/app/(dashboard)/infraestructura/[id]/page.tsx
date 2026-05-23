'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Building2, MapPin, Ruler, Droplets, Camera,
  CheckCircle2, XCircle, Printer, Save, Plus, Trash2,
  AlertTriangle, ClipboardCheck, User, Calendar, Hash,
  Sprout, PenLine
} from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

interface Estadio {
  id: string;
  nombre: string;
  ciudad: string;
  capacidad: number;
  tipo_cesped: string;
}

interface Pasabolas {
  id?: string;
  nombre: string;
  cedula: string;
  fechaNacimiento: string;
  edad: number | null;
}

export default function PaginaDetalleEstadio() {
  const params = useParams();
  const id = params.id as string;
  
  const [estadio, setEstadio] = useState<Estadio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Estado del formulario checklist
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [alturaCesped, setAlturaCesped] = useState(22);
  const [marcacionCancha, setMarcacionCancha] = useState(true);
  const [riegoFuncional, setRiegoFuncional] = useState(true);
  const [drenajeFuncional, setDrenajeFuncional] = useState(true);
  const [alturaCamaras, setAlturaCamaras] = useState(12);
  const [firmaComisario, setFirmaComisario] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [pasabolas, setPasabolas] = useState<Pasabolas[]>([]);

  useEffect(() => {
    async function cargarDatos() {
      if (!id) return;
      const supabase = crearClienteNavegador();
      
      // Cargar estadio
      const { data: estadioData } = await supabase.from('estadios').select('*').eq('id', id).single();
      if (estadioData) {
        setEstadio(estadioData as any);
      }

      // Cargar checklist si existe para este estadio (asumiendo checklist general del estadio, sin partido)
      const { data: checklistData } = await supabase
        .from('checklist_estadio')
        .select('*')
        .eq('estadio_id', id)
        .is('partido_id', null)
        .maybeSingle();

      if (checklistData) {
        setChecklistId(checklistData.id);
        setAlturaCesped(checklistData.altura_cesped_mm || 22);
        setMarcacionCancha(checklistData.estado_marcacion === 'OK');
        setRiegoFuncional(checklistData.estado_riego === 'OK');
        setDrenajeFuncional(checklistData.estado_drenaje === 'OK');
        setFirmaComisario(checklistData.observaciones?.includes('Firma:') ? checklistData.observaciones.split('Firma:')[1].trim() : '');
        setObservaciones(checklistData.observaciones?.split('Firma:')[0].trim() || '');
        // alturaCamaras no está en la base de datos, lo dejamos igual
      }

      setCargando(false);
    }
    cargarDatos();
  }, [id]);

  const cespedValido = alturaCesped >= 20 && alturaCesped <= 25;
  const pasabolasValidos = pasabolas.length >= 8 && pasabolas.length <= 12;

  const calcularEdad = (fechaNac: string): number | null => {
    if (!fechaNac) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const agregarPasabolas = () => {
    if (pasabolas.length >= 12) return;
    setPasabolas([...pasabolas, { nombre: '', cedula: '', fechaNacimiento: '', edad: null }]);
  };

  const eliminarPasabolas = (index: number) => {
    if (pasabolas.length <= 8) return;
    setPasabolas(pasabolas.filter((_, i) => i !== index));
  };

  const actualizarPasabolas = (index: number, campo: keyof Pasabolas, valor: string) => {
    const nuevos = [...pasabolas];
    (nuevos[index] as unknown as Record<string, string | number | null>)[campo] = valor;
    if (campo === 'fechaNacimiento') {
      nuevos[index].edad = calcularEdad(valor);
    }
    setPasabolas(nuevos);
  };

  const esEdadValida = (edad: number | null) => edad !== null && edad >= 14 && edad <= 17;

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });
    const supabase = crearClienteNavegador();

    const checklistData = {
      estadio_id: id,
      altura_cesped_mm: alturaCesped,
      estado_marcacion: marcacionCancha ? 'OK' : 'Malo',
      estado_riego: riegoFuncional ? 'OK' : 'Malo',
      estado_drenaje: drenajeFuncional ? 'OK' : 'Malo',
      observaciones: observaciones + (firmaComisario ? `\nFirma: ${firmaComisario}` : ''),
      pasabolas_registrados: pasabolas.length,
      // partido_id: null (asumimos que es para el estadio en general)
    };

    let errorChecklist;
    if (checklistId) {
      const { error } = await supabase.from('checklist_estadio').update(checklistData).eq('id', checklistId);
      errorChecklist = error;
    } else {
      const { data, error } = await supabase.from('checklist_estadio').insert([checklistData]).select().single();
      if (data) setChecklistId(data.id);
      errorChecklist = error;
    }

    if (errorChecklist) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar el checklist' });
      setGuardando(false);
      return;
    }

    setMensaje({ tipo: 'exito', texto: 'Checklist guardado correctamente' });
    setGuardando(false);
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  if (cargando) return <div className="p-8 text-center text-white">Cargando detalles del estadio...</div>;
  if (!estadio) return <div className="p-8 text-center text-white">Estadio no encontrado.</div>;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Mensaje de alerta */}
      {mensaje.texto && (
        <div className={`p-4 rounded-lg text-sm font-semibold text-white transition-all ${mensaje.tipo === 'exito' ? 'bg-green-600' : 'bg-red-600'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Botón Volver */}
      <Link
        href="/infraestructura"
        className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
        style={{ color: 'var(--ligapro-blue)' }}
      >
        <ArrowLeft size={16} />
        Volver a Infraestructura
      </Link>

      {/* Header del Estadio */}
      <div className="rounded-xl overflow-hidden" style={{
        background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
      }}>
        <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #1B2A4A, #111D35)' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Placeholder de foto */}
            <div className="flex items-center justify-center rounded-xl" style={{
              width: '100px', height: '75px', background: 'rgba(255,255,255,0.1)', border: '2px dashed rgba(255,255,255,0.3)',
            }}>
              <Building2 size={32} className="text-white/40" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{estadio.nombre}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-white/70 text-sm">
                  <MapPin size={14} /> {estadio.ciudad}
                </span>
                <span className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Building2 size={14} /> {estadio.capacidad ? `Cap. ${estadio.capacidad.toLocaleString('es-EC')}` : 'Sin capacidad'}
                </span>
                <span className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Sprout size={14} /> Césped {estadio.tipo_cesped || 'Natural'}
                </span>
              </div>
            </div>
            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <Printer size={16} />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario Checklist Digital */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* === SECCIÓN: CÉSPED === */}
        <div className="rounded-xl overflow-hidden" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center gap-3 px-5 py-3.5" style={{
            background: 'linear-gradient(135deg, #27AE60, #1E8449)',
          }}>
            <Sprout size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Estado del Césped</h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Altura del césped */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--texto-primario)' }}>
                <Ruler size={16} style={{ color: 'var(--texto-secundario)' }} />
                Altura del Césped (mm)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={10}
                  max={40}
                  value={alturaCesped}
                  onChange={(e) => setAlturaCesped(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-lg text-sm font-bold text-center border outline-none focus:ring-2"
                  style={{
                    borderColor: cespedValido ? '#27AE60' : '#C0392B',
                    color: 'var(--texto-primario)',
                    background: 'var(--fondo-principal)',
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px]" style={{ color: 'var(--texto-terciario)' }}>20mm</span>
                    <span className="text-[10px]" style={{ color: 'var(--texto-terciario)' }}>25mm</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.min(100, Math.max(0, ((alturaCesped - 15) / 15) * 100))}%`,
                      background: cespedValido ? '#27AE60' : '#C0392B',
                    }} />
                  </div>
                </div>
                {cespedValido
                  ? <CheckCircle2 size={20} style={{ color: '#27AE60' }} />
                  : <AlertTriangle size={20} style={{ color: '#C0392B' }} />
                }
              </div>
              {!cespedValido && (
                <p className="text-xs mt-1" style={{ color: '#C0392B' }}>
                  ⚠ La altura debe estar entre 20mm y 25mm
                </p>
              )}
            </div>

            {/* Marcación */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{
              background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)',
            }}>
              <div className="flex items-center gap-2">
                <PenLine size={16} style={{ color: 'var(--texto-secundario)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>Marcación de Cancha</span>
              </div>
              <button
                onClick={() => setMarcacionCancha(!marcacionCancha)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: marcacionCancha ? '#27AE60' : '#D1D5DB' }}
              >
                <span className="absolute top-0.5 rounded-full bg-white transition-transform" style={{
                  width: '20px', height: '20px',
                  transform: marcacionCancha ? 'translateX(22px)' : 'translateX(2px)',
                }} />
              </button>
            </div>

            {/* Riego */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{
              background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)',
            }}>
              <div className="flex items-center gap-2">
                <Droplets size={16} style={{ color: 'var(--texto-secundario)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>Sistema de Riego</span>
              </div>
              <button
                onClick={() => setRiegoFuncional(!riegoFuncional)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: riegoFuncional ? '#27AE60' : '#D1D5DB' }}
              >
                <span className="absolute top-0.5 rounded-full bg-white transition-transform" style={{
                  width: '20px', height: '20px',
                  transform: riegoFuncional ? 'translateX(22px)' : 'translateX(2px)',
                }} />
              </button>
            </div>

            {/* Drenaje */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{
              background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)',
            }}>
              <div className="flex items-center gap-2">
                <Droplets size={16} style={{ color: 'var(--texto-secundario)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>Sistema de Drenaje</span>
              </div>
              <button
                onClick={() => setDrenajeFuncional(!drenajeFuncional)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: drenajeFuncional ? '#27AE60' : '#D1D5DB' }}
              >
                <span className="absolute top-0.5 rounded-full bg-white transition-transform" style={{
                  width: '20px', height: '20px',
                  transform: drenajeFuncional ? 'translateX(22px)' : 'translateX(2px)',
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* === SECCIÓN: EQUIPAMIENTO === */}
        <div className="rounded-xl overflow-hidden" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center gap-3 px-5 py-3.5" style={{
            background: 'linear-gradient(135deg, #2980B9, #1F6691)',
          }}>
            <Camera size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Equipamiento y Cámaras</h2>
          </div>
          <div className="p-5 space-y-5">
            {/* Altura de cámaras */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--texto-primario)' }}>
                <Camera size={16} style={{ color: 'var(--texto-secundario)' }} />
                Altura de Cámaras (metros)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={alturaCamaras}
                onChange={(e) => setAlturaCamaras(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#2980B9]/30"
                style={{
                  borderColor: alturaCamaras >= 7 ? '#27AE60' : '#C0392B',
                  color: 'var(--texto-primario)',
                  background: 'var(--fondo-principal)',
                }}
              />
              {alturaCamaras < 7 && (
                <p className="text-xs mt-1" style={{ color: '#C0392B' }}>
                  ⚠ La altura mínima de cámaras es 7 metros
                </p>
              )}
            </div>

            {/* Firma del Comisario */}
            <div className="mt-6 p-4 rounded-lg" style={{
              background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)',
            }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--texto-primario)' }}>
                <ClipboardCheck size={16} style={{ color: '#D4A843' }} />
                Firma del Comisario
              </h3>
              <input
                type="text"
                placeholder="Nombre completo del comisario"
                value={firmaComisario}
                onChange={(e) => setFirmaComisario(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#D4A843]/30 mb-3"
                style={{
                  borderColor: 'var(--borde-suave)',
                  color: 'var(--texto-primario)',
                  background: 'var(--fondo-tarjeta)',
                }}
              />
              <div className="h-24 rounded-lg flex items-center justify-center" style={{
                border: '2px dashed var(--borde-suave)',
                background: 'var(--fondo-tarjeta)',
              }}>
                <p className="text-xs" style={{ color: 'var(--texto-terciario)' }}>
                  Área de firma digital
                </p>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--texto-primario)' }}>
                Observaciones Generales
              </label>
              <textarea
                rows={3}
                placeholder="Ingrese observaciones adicionales..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#2980B9]/30 resize-none"
                style={{
                  borderColor: 'var(--borde-suave)',
                  color: 'var(--texto-primario)',
                  background: 'var(--fondo-principal)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* === SECCIÓN: PASABOLAS === */}
      <div className="rounded-xl overflow-hidden" style={{
        background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
      }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{
          background: 'linear-gradient(135deg, #D4A843, #B8922F)',
        }}>
          <div className="flex items-center gap-3">
            <User size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">
              Registro de Pasabolas ({pasabolas.length}/12)
            </h2>
          </div>
          <button
            onClick={agregarPasabolas}
            disabled={pasabolas.length >= 12}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>

        <div className="p-5">
          {!pasabolasValidos && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{
              background: '#FEF3C7', border: '1px solid #FCD34D',
            }}>
              <AlertTriangle size={16} style={{ color: '#92400E' }} />
              <span className="text-xs font-medium" style={{ color: '#92400E' }}>
                Se requieren entre 8 y 12 pasabolas registrados. Actualmente: {pasabolas.length}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 text-xs font-semibold" style={{ color: 'var(--texto-secundario)' }}>#</th>
                  <th className="pb-3 text-xs font-semibold" style={{ color: 'var(--texto-secundario)' }}>Nombre Completo</th>
                  <th className="pb-3 text-xs font-semibold" style={{ color: 'var(--texto-secundario)' }}>Cédula</th>
                  <th className="pb-3 text-xs font-semibold" style={{ color: 'var(--texto-secundario)' }}>Fecha Nacimiento</th>
                  <th className="pb-3 text-xs font-semibold" style={{ color: 'var(--texto-secundario)' }}>Edad</th>
                  <th className="pb-3 text-xs font-semibold text-right" style={{ color: 'var(--texto-secundario)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pasabolas.map((pb, index) => (
                  <tr key={index} className="border-t" style={{ borderColor: 'var(--borde-suave)' }}>
                    <td className="py-2.5 text-sm font-mono" style={{ color: 'var(--texto-terciario)' }}>{index + 1}</td>
                    <td className="py-2.5">
                      <input
                        type="text"
                        value={pb.nombre}
                        onChange={(e) => actualizarPasabolas(index, 'nombre', e.target.value)}
                        placeholder="Nombre..."
                        className="px-2 py-1.5 rounded text-sm border outline-none w-full max-w-[200px]"
                        style={{
                          borderColor: 'var(--borde-suave)',
                          color: 'var(--texto-primario)',
                          background: 'var(--fondo-principal)',
                        }}
                      />
                    </td>
                    <td className="py-2.5">
                      <input
                        type="text"
                        value={pb.cedula}
                        onChange={(e) => actualizarPasabolas(index, 'cedula', e.target.value)}
                        placeholder="0000000000"
                        maxLength={10}
                        className="px-2 py-1.5 rounded text-sm border outline-none w-28 font-mono"
                        style={{
                          borderColor: 'var(--borde-suave)',
                          color: 'var(--texto-primario)',
                          background: 'var(--fondo-principal)',
                        }}
                      />
                    </td>
                    <td className="py-2.5">
                      <input
                        type="date"
                        value={pb.fechaNacimiento}
                        onChange={(e) => actualizarPasabolas(index, 'fechaNacimiento', e.target.value)}
                        className="px-2 py-1.5 rounded text-sm border outline-none"
                        style={{
                          borderColor: 'var(--borde-suave)',
                          color: 'var(--texto-primario)',
                          background: 'var(--fondo-principal)',
                        }}
                      />
                    </td>
                    <td className="py-2.5">
                      {pb.edad !== null ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            background: esEdadValida(pb.edad) ? '#DEF7EC' : '#FEE2E2',
                            color: esEdadValida(pb.edad) ? '#03543F' : '#991B1B',
                          }}
                        >
                          {pb.edad} años {esEdadValida(pb.edad) ? '✓' : '✗'}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => eliminarPasabolas(index)}
                        disabled={pasabolas.length <= 8}
                        className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                        style={{ color: '#C0392B' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botones de acción finales */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: 'var(--fondo-tarjeta)',
            color: 'var(--texto-primario)',
            border: '1px solid var(--borde-suave)',
          }}
        >
          <Printer size={16} />
          Imprimir Checklist
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #27AE60, #1E8449)' }}
        >
          <Save size={16} />
          {guardando ? 'Guardando...' : 'Guardar Checklist'}
        </button>
      </div>
    </div>
  );
}
