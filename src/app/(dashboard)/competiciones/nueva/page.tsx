'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trophy, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

export default function PaginaNuevaCompeticion() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const supabase = crearClienteNavegador();

  const [formData, setFormData] = useState({
    nombre: 'Serie A - LigaPro',
    temporada: '2026',
    serie: 'A',
    fase: 'FASE_UNO',
    equipos: 16,
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCompeticion = async () => {
    setCargando(true);
    
    const { error } = await supabase.from('competiciones').insert({
      nombre: formData.nombre.trim(),
      temporada: formData.temporada.trim(),
      serie: formData.serie,
      fase: formData.fase,
      equipos_participantes: parseInt(formData.equipos.toString()),
      fecha_inicio: formData.fechaInicio || null,
      fecha_fin: formData.fechaFin || null,
      estado: 'PLANIFICADA'
    });

    if (error) {
      alert('Error al registrar competición: ' + error.message);
      setCargando(false);
      return;
    }

    setCargando(false);
    setExito(true);

    setTimeout(() => {
      window.location.href = '/competiciones';
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-[800px] mx-auto animate-fade-in">
      <Link
        href="/competiciones"
        className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
        style={{ color: 'var(--texto-secundario)' }}
      >
        <ArrowLeft size={16} />
        Volver a Competiciones
      </Link>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
          Registrar Nueva Competición
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
          Configura los parámetros del nuevo campeonato o torneo.
        </p>
      </div>

      {exito && (
        <div className="flex items-center gap-2 p-4 rounded-lg animate-slide-up" style={{ background: '#DEF7EC', border: '1px solid #31C48D' }}>
          <CheckCircle2 size={20} style={{ color: '#03543F' }} />
          <span className="text-sm font-bold" style={{ color: '#03543F' }}>
            ¡Competición registrada exitosamente!
          </span>
        </div>
      )}

      <div
        className="rounded-xl overflow-hidden p-6"
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
        }}
      >
        <div className="flex items-center gap-2 mb-6 border-b pb-4" style={{ borderColor: 'var(--borde-suave)' }}>
          <Trophy size={20} style={{ color: '#D4A843' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>Datos de la Competición</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nombre del Campeonato</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-[#D4A843]/30" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Temporada</label>
            <input type="text" name="temporada" value={formData.temporada} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-[#D4A843]/30" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Serie</label>
            <select name="serie" value={formData.serie} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-[#D4A843]/30">
              <option value="A">Serie A</option>
              <option value="B">Serie B</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Fase</label>
            <select name="fase" value={formData.fase} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-[#D4A843]/30">
              <option value="FASE_UNO">Fase Uno</option>
              <option value="FASE_DOS">Fase Dos</option>
              <option value="CLASIFICACION">Clasificación</option>
              <option value="PLAYOFF">Playoff</option>
              <option value="FINAL">Final</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Fecha de Inicio</label>
            <div className="relative">
              <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-[#D4A843]/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Fecha de Fin</label>
            <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-[#D4A843]/30" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Número de Equipos Participantes</label>
            <input type="number" name="equipos" value={formData.equipos} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-[#D4A843]/30" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Descripción Corta</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Detalles de la competición..." rows={3} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-[#D4A843]/30"></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          disabled={cargando}
          onClick={guardarCompeticion}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #D4A843, #B8922F)' }}
        >
          <Save size={16} />
          {cargando ? 'Guardando...' : 'Crear Competición'}
        </button>
      </div>
    </div>
  );
}
