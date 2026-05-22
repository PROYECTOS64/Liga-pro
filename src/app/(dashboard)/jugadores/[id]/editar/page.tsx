'use client';

import { useState, useEffect, Suspense, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, FileText, CheckCircle2 } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

function FormularioEditar({ id }: { id: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const supabase = crearClienteNavegador();
  const [clubesList, setClubesList] = useState<{id: string, nombre: string}[]>([]);
  const [esStaff, setEsStaff] = useState(false);

  const [formData, setFormData] = useState({
    nombre_completo: '',
    club_id: '',
    posicion: 'Delantero',
    dorsal: '',
    fecha_nacimiento: '',
    nacionalidad: 'Ecuatoriana',
    cedula: '',
    tipo_staff: 'CUERPO_TECNICO'
  });

  const posiciones = ['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO'];

  useEffect(() => {
    async function fetchDatos() {
      // 1. Fetch clubes
      const { data: clubesData } = await supabase.from('clubes').select('id, nombre');
      if (clubesData) {
        setClubesList(clubesData);
      }

      // 2. Fetch jugador o staff
      const { data: jugadorData, error } = await supabase.from('jugadores').select('*').eq('id', id).single();
      if (jugadorData) {
        setFormData({
          nombre_completo: jugadorData.nombre_completo || '',
          club_id: jugadorData.club_id || '',
          posicion: jugadorData.posicion || 'DELANTERO',
          dorsal: jugadorData.dorsal ? jugadorData.dorsal.toString() : '',
          fecha_nacimiento: jugadorData.fecha_nacimiento || '',
          nacionalidad: jugadorData.nacionalidad || 'Ecuatoriana',
          cedula: jugadorData.cedula || '',
          tipo_staff: ''
        });
        setEsStaff(false);
      } else {
        const { data: staffData } = await supabase.from('staff').select('*').eq('id', id).single();
        if (staffData) {
          setFormData({
            nombre_completo: staffData.nombre_completo || '',
            club_id: staffData.club_id || '',
            posicion: '',
            dorsal: '',
            fecha_nacimiento: '',
            nacionalidad: '',
            cedula: staffData.cedula || '',
            tipo_staff: staffData.tipo_staff || 'CUERPO_TECNICO'
          });
          setEsStaff(true);
        }
      }
      setCargando(false);
    }
    fetchDatos();
  }, [id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    setGuardando(true);
    
    if (!esStaff) {
      const { error } = await supabase.from('jugadores').update({
        nombre_completo: formData.nombre_completo.trim(),
        club_id: formData.club_id || null,
        cedula: formData.cedula,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        nacionalidad: formData.nacionalidad,
        posicion: formData.posicion.toUpperCase(),
        dorsal: formData.dorsal ? parseInt(formData.dorsal) : null,
      }).eq('id', id);
      
      if (error) {
        alert('Error al actualizar jugador: ' + error.message);
        setGuardando(false);
        return;
      }
    } else {
      const { error } = await supabase.from('staff').update({
        nombre_completo: formData.nombre_completo.trim(),
        club_id: formData.club_id || null,
        cedula: formData.cedula,
        tipo_staff: formData.tipo_staff
      }).eq('id', id);

      if (error) {
        alert('Error al actualizar staff: ' + error.message);
        setGuardando(false);
        return;
      }
    }

    setGuardando(false);
    setExito(true);

    setTimeout(() => {
      setExito(false);
      router.push(`/jugadores/${id}`);
    }, 1500);
  };

  if (cargando) return <div className="p-10 text-center">Cargando datos...</div>;

  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      {/* Navegación */}
      <Link
        href={`/jugadores/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
        style={{ color: 'var(--texto-secundario)' }}
      >
        <ArrowLeft size={16} />
        Volver al Perfil
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
            {esStaff ? 'Editar Staff' : 'Editar Jugador'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
            Modifica los datos y guarda los cambios
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
        className="rounded-xl overflow-hidden p-6"
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
        }}
      >
        <div className="flex items-center gap-2 mb-6 border-b pb-4" style={{ borderColor: 'var(--borde-suave)' }}>
          <User size={20} style={{ color: '#2980B9' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>Datos Personales y Deportivos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nombres Completos</label>
            <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} placeholder="Ej. Enner Remberto Valencia" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Cédula / Pasaporte</label>
            <div className="relative">
              <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="0900000000" className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
              <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Club de Afiliación</label>
            <select name="club_id" value={formData.club_id} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}>
              <option value="">Ninguno</option>
              {clubesList.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {!esStaff && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nacionalidad</label>
                <input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Posición en el Campo</label>
                <select name="posicion" value={formData.posicion} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}>
                  {posiciones.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Número de Dorsal</label>
                <input type="number" name="dorsal" value={formData.dorsal} onChange={handleChange} placeholder="Ej. 10" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
              </div>
            </>
          )}

          {esStaff && (
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Rol</label>
              <select name="tipo_staff" value={formData.tipo_staff} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}>
                <option value="CUERPO_TECNICO">Cuerpo Técnico</option>
                <option value="CUERPO_MEDICO">Cuerpo Médico</option>
              </select>
            </div>
          )}
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

export default function PaginaEditarJugador({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <FormularioEditar id={id} />
    </Suspense>
  )
}
