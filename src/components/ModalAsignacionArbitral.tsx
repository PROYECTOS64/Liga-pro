import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

interface Arbitro {
  id: string;
  nombre: string;
  apellidos: string;
  categoria: string;
  es_var: boolean;
}

interface ModalAsignacionArbitralProps {
  isOpen: boolean;
  onClose: () => void;
  partido: any | null;
  arbitros: Arbitro[];
  onGuardado: () => void;
}

const ROLES = [
  'Central',
  'Asistente 1',
  'Asistente 2',
  'Cuarto Árbitro',
  'VAR',
  'AVAR',
  'Asesor'
];

export default function ModalAsignacionArbitral({
  isOpen,
  onClose,
  partido,
  arbitros,
  onGuardado,
}: ModalAsignacionArbitralProps) {
  const [asignaciones, setAsignaciones] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && partido) {
      // Cargar asignaciones actuales en el estado local
      const asigsIniciales: Record<string, string> = {};
      if (partido.arbitros_partidos) {
        partido.arbitros_partidos.forEach((ap: any) => {
          asigsIniciales[ap.rol] = ap.arbitro_id || ap.arbitro?.id || ap.id_arbitro; // dependiendo de cómo venga el id
        });
      }
      setAsignaciones(asigsIniciales);
      setError('');
    } else {
      setAsignaciones({});
      setError('');
    }
  }, [isOpen, partido]);

  // Si no pasamos el arbitro_id explícito desde el padre, necesitamos buscarlo
  useEffect(() => {
    if (isOpen && partido && partido.arbitros_partidos && Object.keys(asignaciones).length === 0) {
      const cargarIds = async () => {
         const supabase = crearClienteNavegador();
         const { data } = await supabase.from('arbitros_partidos').select('rol, arbitro_id').eq('partido_id', partido.id);
         if (data) {
           const asigs: Record<string, string> = {};
           data.forEach(d => asigs[d.rol] = d.arbitro_id);
           setAsignaciones(asigs);
         }
      };
      cargarIds();
    }
  }, [isOpen, partido]);

  if (!isOpen || !partido) return null;

  const handleSelectChange = (rol: string, arbitroId: string) => {
    setAsignaciones(prev => {
      const nuevo = { ...prev };
      if (!arbitroId) {
        delete nuevo[rol];
      } else {
        nuevo[rol] = arbitroId;
      }
      return nuevo;
    });
  };

  const handleGuardar = async () => {
    setError('');
    
    // Validaciones
    const values = Object.values(asignaciones);
    const uniqueValues = new Set(values);
    if (values.length !== uniqueValues.size) {
      setError('No puedes asignar al mismo árbitro a múltiples roles en este partido.');
      return;
    }

    // Validar VAR y AVAR
    if (asignaciones['VAR']) {
      const varArbitro = arbitros.find(a => a.id === asignaciones['VAR']);
      if (varArbitro && !varArbitro.es_var) {
        setError(`El árbitro seleccionado para VAR (${varArbitro.nombre} ${varArbitro.apellidos}) no tiene certificación VAR.`);
        return;
      }
    }
    if (asignaciones['AVAR']) {
      const avarArbitro = arbitros.find(a => a.id === asignaciones['AVAR']);
      if (avarArbitro && !avarArbitro.es_var) {
        setError(`El árbitro seleccionado para AVAR (${avarArbitro.nombre} ${avarArbitro.apellidos}) no tiene certificación VAR.`);
        return;
      }
    }

    setGuardando(true);
    const supabase = crearClienteNavegador();

    try {
      // 1. Eliminar asignaciones anteriores
      await supabase.from('arbitros_partidos').delete().eq('partido_id', partido.id);

      // 2. Insertar nuevas asignaciones
      const inserts = Object.entries(asignaciones).map(([rol, arbitro_id]) => ({
        partido_id: partido.id,
        arbitro_id,
        rol
      }));

      if (inserts.length > 0) {
        const { error: insertError } = await supabase.from('arbitros_partidos').insert(inserts);
        if (insertError) throw insertError;
      }

      onGuardado();
    } catch (err: any) {
      console.error(err);
      setError('Ocurrió un error al guardar las asignaciones.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--fondo-tarjeta)', borderBottom: '1px solid var(--borde-suave)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>
              Asignar Árbitros
            </h2>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>
              Jornada {partido.jornada}: {partido.local} vs {partido.visitante}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--texto-secundario)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-start gap-2">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES.map(rol => (
              <div key={rol} className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
                  {rol} {['VAR', 'AVAR'].includes(rol) && <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded ml-1">Certificación requerida</span>}
                </label>
                <select
                  value={asignaciones[rol] || ''}
                  onChange={(e) => handleSelectChange(rol, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all appearance-none"
                  style={{ 
                    background: 'var(--fondo-tarjeta)', 
                    border: '1px solid var(--borde-suave)',
                    color: 'var(--texto-primario)'
                  }}
                >
                  <option value="">-- Sin asignar --</option>
                  {arbitros.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} {a.apellidos} {a.es_var ? '(VAR)' : ''} - Cat: {a.categoria}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3" style={{ background: 'var(--fondo-tarjeta)', borderTop: '1px solid var(--borde-suave)' }}>
          <button
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: 'var(--texto-secundario)', border: '1px solid var(--borde-suave)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-md"
            style={{ 
              background: guardando ? '#95a5a6' : 'linear-gradient(135deg, #27AE60, #1E8449)',
              opacity: guardando ? 0.7 : 1
            }}
          >
            {guardando ? (
              'Guardando...'
            ) : (
              <>
                <Save size={18} />
                Guardar Asignaciones
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
