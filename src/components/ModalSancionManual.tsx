import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

interface ModalSancionManualProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardado: () => void;
}

export default function ModalSancionManual({ isOpen, onClose, onGuardado }: ModalSancionManualProps) {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<string>('');
  const [clubSeleccionado, setClubSeleccionado] = useState<string>('');
  const [jugadores, setJugadores] = useState<any[]>([]);
  
  // Valores del formulario
  const [jugadorId, setJugadorId] = useState<string>('');
  const [tarjeta, setTarjeta] = useState<'AMARILLA' | 'ROJA'>('AMARILLA');
  const [motivo, setMotivo] = useState<string>('');
  const [partidosRestantes, setPartidosRestantes] = useState<number>(1);
  
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    
    // Cargar partidos
    async function loadPartidos() {
      const supabase = crearClienteNavegador();
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          id,
          jornada,
          fecha_hora,
          local:clubes!partidos_club_local_id_fkey(id, nombre),
          visitante:clubes!partidos_club_visitante_id_fkey(id, nombre)
        `)
        .order('fecha_hora', { ascending: false });
        
      if (data) setPartidos(data);
    }
    
    loadPartidos();
  }, [isOpen]);

  useEffect(() => {
    // Cuando cambia el club seleccionado, cargamos sus jugadores
    async function loadJugadores() {
      if (!clubSeleccionado) {
        setJugadores([]);
        return;
      }
      
      const supabase = crearClienteNavegador();
      const { data } = await supabase
        .from('jugadores')
        .select('id, nombre_completo, dorsal')
        .eq('club_id', clubSeleccionado)
        .order('nombre_completo');
        
      if (data) setJugadores(data);
    }
    
    loadJugadores();
  }, [clubSeleccionado]);

  // Resetear estados al cambiar de partido
  const handlePartidoChange = (pId: string) => {
    setPartidoSeleccionado(pId);
    setClubSeleccionado('');
    setJugadorId('');
    setJugadores([]);
  };

  const handleGuardar = async () => {
    if (!partidoSeleccionado || !jugadorId || !motivo || partidosRestantes < 1) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    setGuardando(true);
    setError('');
    const supabase = crearClienteNavegador();

    try {
      const { error: insertError } = await supabase.from('suspensiones').insert({
        jugador_id: jugadorId,
        partido_origen_id: partidoSeleccionado,
        motivo: motivo,
        tipo_tarjeta_origen: tarjeta,
        fecha_inicio: new Date().toISOString().split('T')[0], // Fecha actual
        partidos_restantes: partidosRestantes,
        activa: true
      });

      if (insertError) throw insertError;
      
      onGuardado(); // Cerrar y recargar
    } catch (err: any) {
      console.error(err);
      setError('Error al guardar la sanción: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  const partidoElegido = partidos.find(p => p.id === partidoSeleccionado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--fondo-tarjeta)', borderBottom: '1px solid var(--borde-suave)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>
              Ingresar Sanción
            </h2>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>
              Registro manual de tarjetas
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--texto-secundario)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-4">
            {/* 1. Partido */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--texto-primario)' }}>1. Seleccionar Partido *</label>
              <select
                value={partidoSeleccionado}
                onChange={(e) => handlePartidoChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 appearance-none"
                style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}
              >
                <option value="">-- Elija un partido --</option>
                {partidos.map(p => (
                  <option key={p.id} value={p.id}>
                    Jornada {p.jornada} | {p.local?.nombre} vs {p.visitante?.nombre} ({new Date(p.fecha_hora).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Club */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--texto-primario)' }}>2. Seleccionar Equipo *</label>
              <select
                value={clubSeleccionado}
                onChange={(e) => setClubSeleccionado(e.target.value)}
                disabled={!partidoSeleccionado}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 appearance-none disabled:opacity-50"
                style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}
              >
                <option value="">-- Elija equipo local o visitante --</option>
                {partidoElegido && <option value={partidoElegido.local?.id}>{partidoElegido.local?.nombre} (Local)</option>}
                {partidoElegido && <option value={partidoElegido.visitante?.id}>{partidoElegido.visitante?.nombre} (Visitante)</option>}
              </select>
            </div>

            {/* 3. Jugador */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--texto-primario)' }}>3. Seleccionar Jugador *</label>
              <select
                value={jugadorId}
                onChange={(e) => setJugadorId(e.target.value)}
                disabled={!clubSeleccionado || jugadores.length === 0}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 appearance-none disabled:opacity-50"
                style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}
              >
                <option value="">-- Busque y elija al jugador infractor --</option>
                {jugadores.map(j => (
                  <option key={j.id} value={j.id}>
                    #{j.dorsal || '-'} {j.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Tarjeta */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--texto-primario)' }}>4. Tipo de Tarjeta *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tarjeta" value="AMARILLA" checked={tarjeta === 'AMARILLA'} onChange={() => setTarjeta('AMARILLA')} />
                  <div className="w-4 h-5 bg-yellow-400 rounded-sm border border-yellow-600"></div>
                  <span className="text-sm font-medium">Amarilla</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tarjeta" value="ROJA" checked={tarjeta === 'ROJA'} onChange={() => setTarjeta('ROJA')} />
                  <div className="w-4 h-5 bg-red-500 rounded-sm border border-red-700"></div>
                  <span className="text-sm font-medium">Roja Directa</span>
                </label>
              </div>
            </div>

            {/* 5. Motivo */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--texto-primario)' }}>5. Motivo del Árbitro *</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. Juego brusco grave, insultos..."
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}
              />
            </div>

            {/* 6. Partidos */}
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--texto-primario)' }}>6. Partidos de Suspensión *</label>
              <input
                type="number"
                min={1}
                value={partidosRestantes}
                onChange={(e) => setPartidosRestantes(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2"
                style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}
              />
            </div>

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
              background: guardando ? '#95a5a6' : 'linear-gradient(135deg, #E74C3C, #C0392B)',
              opacity: guardando ? 0.7 : 1
            }}
          >
            {guardando ? 'Guardando...' : <><Save size={18} /> Guardar Sanción</>}
          </button>
        </div>
      </div>
    </div>
  );
}
