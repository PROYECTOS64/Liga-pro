'use client';

import { useState, useEffect, Suspense, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle2, Shield, FileText, MapPin } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

function FormularioEditarClub({ id }: { id: string }) {
  const router = useRouter();
  const supabase = crearClienteNavegador();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [autorizado, setAutorizado] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    abreviatura: '',
    fundacion: '',
    ciudad: '',
    serie: 'A',
    ruc: '',
    estado_control_economico: 'EN_REVISION',
    presupuesto_aprobado: '',
    color_principal: '#1B2A4A',
  });

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      let rolReal = 'usuario';
      if (user.email === 'admin@ligapro.ec') {
        rolReal = 'admin';
      } else {
        const { data: perfil } = await supabase.from('perfiles').select('rol').eq('user_id', user.id).single();
        if (perfil?.rol === 'ADMIN') rolReal = 'admin';
        else if (perfil?.rol === 'DELEGADO_CLUB') rolReal = 'club';
        else if (perfil?.rol === 'ARBITRO') rolReal = 'arbitro';
      }
      
      if (rolReal !== 'admin') {
        router.replace('/clubes');
      } else {
        setAutorizado(true);
      }
    }
    checkRole();

    async function fetchClub() {
      const { data } = await supabase.from('clubes').select('*').eq('id', id).single();
      if (data) {
        setFormData({
          nombre: data.nombre || '',
          abreviatura: data.abreviatura || '',
          fundacion: data.fundacion || '',
          ciudad: data.ciudad || '',
          serie: data.serie || 'A',
          ruc: data.ruc || '',
          estado_control_economico: data.estado_control_economico || 'EN_REVISION',
          presupuesto_aprobado: data.presupuesto_aprobado ? data.presupuesto_aprobado.toString() : '',
          color_principal: data.color_principal || '#1B2A4A',
        });
      }
      setCargando(false);
    }
    fetchClub();
  }, [id, supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    setGuardando(true);
    
    const payload = {
      nombre: formData.nombre.trim(),
      abreviatura: formData.abreviatura.toUpperCase().trim(),
      fundacion: formData.fundacion || null,
      ciudad: formData.ciudad.trim(),
      serie: formData.serie,
      estado_control_economico: formData.estado_control_economico,
      color_principal: formData.color_principal,
    };

    const { error } = await supabase.from('clubes').update(payload).eq('id', id);

    if (error) {
      alert('Error al actualizar club: ' + error.message);
      setGuardando(false);
      return;
    }

    setGuardando(false);
    setExito(true);

    setTimeout(() => {
      setExito(false);
      window.location.href = `/clubes/${id}`;
    }, 1500);
  };

  if (cargando || !autorizado) return <div className="p-12 text-center text-[var(--texto-secundario)] bg-[var(--fondo-tarjeta)] rounded-xl border border-[var(--borde-suave)] shadow-sm">Verificando permisos de acceso...</div>;

  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <Link
        href={`/clubes/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
        style={{ color: 'var(--texto-secundario)' }}
      >
        <ArrowLeft size={16} />
        Volver al Kárdex
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
            Editar Club
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
            Modifica la información general e institucional del club
          </p>
        </div>
      </div>

      {exito && (
        <div className="flex items-center gap-2 p-4 rounded-lg animate-slide-up" style={{ background: '#DEF7EC', border: '1px solid #31C48D' }}>
          <CheckCircle2 size={20} style={{ color: '#03543F' }} />
          <span className="text-sm font-bold" style={{ color: '#03543F' }}>
            ¡Cambios guardados correctamente!
          </span>
        </div>
      )}

      {/* Formulario */}
      <div
        className="rounded-xl overflow-hidden p-6 space-y-8"
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
        }}
      >
        
        {/* Sección: Información General */}
        <div>
          <div className="flex items-center gap-2 mb-4 border-b pb-3" style={{ borderColor: 'var(--borde-suave)' }}>
            <Shield size={20} style={{ color: '#27AE60' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>Información General</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nombre del Club</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Abreviatura (3 letras)</label>
              <input type="text" name="abreviatura" maxLength={3} value={formData.abreviatura} onChange={handleChange} placeholder="Ej. BSC" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all uppercase" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Color Principal</label>
              <div className="flex items-center gap-3">
                <input type="color" name="color_principal" value={formData.color_principal} onChange={handleChange} className="w-12 h-10 rounded cursor-pointer p-1" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)' }} />
                <span className="text-sm font-mono" style={{ color: 'var(--texto-secundario)' }}>{formData.color_principal}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Ciudad Sede</label>
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Fecha de Fundación</label>
              <input type="date" name="fundacion" value={formData.fundacion} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
            </div>
          </div>
        </div>

        {/* Sección: Control Económico e Institucional */}
        <div>
          <div className="flex items-center gap-2 mb-4 border-b pb-3" style={{ borderColor: 'var(--borde-suave)' }}>
            <FileText size={20} style={{ color: '#2980B9' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>Institucional y Financiero</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>RUC / NIT</label>
              <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Serie Activa</label>
              <select name="serie" value={formData.serie} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}>
                <option value="A">Serie A</option>
                <option value="B">Serie B</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Estado Legal/Financiero</label>
              <select name="estado_control_economico" value={formData.estado_control_economico} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}>
                <option value="APROBADO">Aprobado</option>
                <option value="EN_REVISION">En Revisión</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Presupuesto Aprobado (USD)</label>
              <input type="number" name="presupuesto_aprobado" value={formData.presupuesto_aprobado} onChange={handleChange} placeholder="0.00" step="0.01" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
            </div>
          </div>
        </div>

      </div>

      {/* Botones de acción */}
      <div className="flex justify-end mt-6">
        <button
          disabled={guardando}
          onClick={guardarCambios}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #243558)' }}
        >
          <Save size={16} />
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}

export default function PaginaEditarClub({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <FormularioEditarClub id={id} />
    </Suspense>
  )
}
