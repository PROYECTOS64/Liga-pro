'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

export interface EstadioForm {
  id?: string;
  nombre: string;
  ciudad: string;
  capacidad: number;
  tipo_cesped: 'NATURAL' | 'SINTETICO' | 'HIBRIDO';
  is_habilitado: boolean;
}

interface ModalEstadioProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  estadioAEditar: EstadioForm | null;
}

export default function ModalEstadio({ isOpen, onClose, onSaved, estadioAEditar }: ModalEstadioProps) {
  const [formData, setFormData] = useState<EstadioForm>({
    nombre: '',
    ciudad: '',
    capacidad: 0,
    tipo_cesped: 'NATURAL',
    is_habilitado: true,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (estadioAEditar) {
        setFormData(estadioAEditar);
      } else {
        setFormData({
          nombre: '',
          ciudad: '',
          capacidad: 0,
          tipo_cesped: 'NATURAL',
          is_habilitado: true,
        });
      }
      setError('');
    }
  }, [isOpen, estadioAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    let finalValue = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = parseInt(value, 10) || 0;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.ciudad) {
      setError('El nombre y la ciudad son obligatorios.');
      return;
    }

    setGuardando(true);
    setError('');
    const supabase = crearClienteNavegador();

    const dataToSave = {
      nombre: formData.nombre,
      ciudad: formData.ciudad,
      capacidad: formData.capacidad,
      tipo_cesped: formData.tipo_cesped,
      is_habilitado: formData.is_habilitado,
    };

    let resultError = null;

    if (formData.id) {
      const { error } = await supabase.from('estadios').update(dataToSave).eq('id', formData.id);
      resultError = error;
    } else {
      const { error } = await supabase.from('estadios').insert([dataToSave]);
      resultError = error;
    }

    if (resultError) {
      setError('Error al guardar el estadio: ' + resultError.message);
      setGuardando(false);
    } else {
      setGuardando(false);
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'var(--fondo-tarjeta)', border: '1px solid var(--borde-suave)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--borde-suave)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>
            {formData.id ? 'Editar Estadio' : 'Nuevo Estadio'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:bg-white/10"
            style={{ color: 'var(--texto-secundario)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm font-medium text-white bg-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>Nombre del Estadio *</label>
            <input 
              type="text" 
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Estadio Monumental"
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2"
              style={{ background: 'var(--fondo-principal)', borderColor: 'var(--borde-suave)', color: 'var(--texto-primario)' }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>Ciudad *</label>
            <input 
              type="text" 
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Ej. Guayaquil"
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2"
              style={{ background: 'var(--fondo-principal)', borderColor: 'var(--borde-suave)', color: 'var(--texto-primario)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>Capacidad</label>
              <input 
                type="number" 
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2"
                style={{ background: 'var(--fondo-principal)', borderColor: 'var(--borde-suave)', color: 'var(--texto-primario)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>Tipo de Césped</label>
              <select 
                name="tipo_cesped"
                value={formData.tipo_cesped}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2"
                style={{ background: 'var(--fondo-principal)', borderColor: 'var(--borde-suave)', color: 'var(--texto-primario)' }}
              >
                <option value="NATURAL">Natural</option>
                <option value="SINTETICO">Sintético</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="text-sm font-medium cursor-pointer flex items-center gap-2" style={{ color: 'var(--texto-primario)' }}>
              <input 
                type="checkbox" 
                name="is_habilitado"
                checked={formData.is_habilitado}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Estadio Habilitado
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t" style={{ borderColor: 'var(--borde-suave)' }}>
            <button 
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'var(--texto-secundario)', border: '1px solid var(--borde-suave)' }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #27AE60, #1E8449)' }}
            >
              <Save size={16} />
              {guardando ? 'Guardando...' : 'Guardar Estadio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
