'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Shield, MapPin, Building, CheckCircle2 } from 'lucide-react';

export default function PaginaNuevoClub() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    abreviatura: '',
    serie: 'A',
    ciudad: '',
    fundacion: '',
    presidente: '',
    estadio: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarClub = async () => {
    setCargando(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 800));
    setCargando(false);
    setExito(true);

    setTimeout(() => {
      router.push('/clubes');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-[800px] mx-auto animate-fade-in">
      <Link
        href="/clubes"
        className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
        style={{ color: 'var(--texto-secundario)' }}
      >
        <ArrowLeft size={16} />
        Volver a Clubes
      </Link>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
          Registrar Nuevo Club
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
          Ingresa la información oficial para afiliar el equipo a LigaPro EC.
        </p>
      </div>

      {exito && (
        <div className="flex items-center gap-2 p-4 rounded-lg animate-slide-up" style={{ background: '#DEF7EC', border: '1px solid #31C48D' }}>
          <CheckCircle2 size={20} style={{ color: '#03543F' }} />
          <span className="text-sm font-bold" style={{ color: '#03543F' }}>
            ¡Club registrado exitosamente!
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
          <Shield size={20} style={{ color: '#27AE60' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>Datos Institucionales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nombre Completo del Club</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Barcelona Sporting Club" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-green-500/30" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Abreviatura (3 letras)</label>
            <input type="text" name="abreviatura" value={formData.abreviatura} onChange={handleChange} placeholder="Ej. BSC" maxLength={3} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] uppercase focus:ring-2 focus:ring-green-500/30" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Serie a la que pertenece</label>
            <select name="serie" value={formData.serie} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-green-500/30">
              <option value="A">Serie A</option>
              <option value="B">Serie B</option>
              <option value="Ascenso">Ascenso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Ciudad Sede</label>
            <div className="relative">
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Ej. Guayaquil" className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-green-500/30" />
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Presidente Actual</label>
            <input type="text" name="presidente" value={formData.presidente} onChange={handleChange} placeholder="Nombre del presidente..." className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-green-500/30" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Fecha de Fundación</label>
            <input type="date" name="fundacion" value={formData.fundacion} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-green-500/30" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Estadio Principal</label>
            <div className="relative">
              <input type="text" name="estadio" value={formData.estadio} onChange={handleChange} placeholder="Nombre del estadio donde juega de local..." className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all border border-[var(--borde-suave)] bg-[var(--fondo-principal)] text-[var(--texto-primario)] focus:ring-2 focus:ring-green-500/30" />
              <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          disabled={cargando}
          onClick={guardarClub}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 hover:-translate-y-0.5 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)' }}
        >
          <Save size={16} />
          {cargando ? 'Registrando...' : 'Guardar y Registrar Club'}
        </button>
      </div>
    </div>
  );
}
