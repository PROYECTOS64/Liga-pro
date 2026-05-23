'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, User, FileText, CheckCircle2 } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

function Formulario() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipo = searchParams?.get('tipo') || 'jugador'; // 'jugador', 'tecnico', 'medico'
  
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  const supabase = crearClienteNavegador();
  const [clubesList, setClubesList] = useState<{id: string, nombre: string}[]>([]);

  // Formulario básico
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    club_id: '',
    posicion: 'Delantero',
    dorsal: '',
    fechaNacimiento: '',
    nacionalidad: 'Ecuatoriana',
    cedula: '',
    tipo_staff: tipo === 'medico' ? 'MEDICO' : 'DIRECTOR_TECNICO'
  });

  const posiciones = ['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO'];

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
        router.replace('/jugadores');
      } else {
        setAutorizado(true);
      }
    }
    checkRole();

    async function fetchClubes() {
      const { data } = await supabase.from('clubes').select('id, nombre');
      if (data) {
        setClubesList(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, club_id: data[0].id }));
        }
      }
    }
    fetchClubes();
  }, [supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarJugador = async (crearOtro: boolean) => {
    setCargando(true);
    
    if (tipo === 'jugador') {
      const { error } = await supabase.from('jugadores').insert({
        nombre_completo: `${formData.nombre} ${formData.apellidos}`.trim(),
        club_id: formData.club_id || null,
        cedula: formData.cedula,
        fecha_nacimiento: formData.fechaNacimiento || null,
        posicion: formData.posicion.toUpperCase(),
        dorsal: formData.dorsal ? parseInt(formData.dorsal) : null,
      });
      if (error) {
        alert('Error al guardar jugador: ' + error.message);
        setCargando(false);
        return;
      }
    } else {
      const { error } = await supabase.from('staff').insert({
        nombre_completo: `${formData.nombre} ${formData.apellidos}`.trim(),
        club_id: formData.club_id || null,
        cedula: formData.cedula,
        tipo_staff: formData.tipo_staff,
        is_medico: tipo === 'medico',
        is_director_tecnico: tipo === 'tecnico'
      });
      if (error) {
        alert('Error al guardar staff: ' + error.message);
        setCargando(false);
        return;
      }
    }

    setCargando(false);
    setExito(true);

    setTimeout(() => {
      setExito(false);
      if (crearOtro) {
        setFormData({
          ...formData,
          nombre: '',
          apellidos: '',
          dorsal: '',
          cedula: '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/jugadores');
      }
    }, 1500);
  };

  if (!autorizado) {
    return <div className="p-12 text-center text-[var(--texto-secundario)] bg-[var(--fondo-tarjeta)] rounded-xl border border-[var(--borde-suave)] shadow-sm">Verificando permisos de acceso...</div>;
  }

  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      {/* Navegación */}
      <Link
        href="/jugadores"
        className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
        style={{ color: 'var(--texto-secundario)' }}
      >
        <ArrowLeft size={16} />
        Volver a Jugadores
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
            {tipo === 'jugador' ? 'Registrar Nuevo Jugador' : 'Registrar Nuevo Staff'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
            Ingresa los datos {tipo === 'jugador' ? 'del jugador' : 'del staff'} para afiliarlo a un club
          </p>
        </div>
      </div>

      {exito && (
        <div className="flex items-center gap-2 p-4 rounded-lg animate-slide-up" style={{ background: '#DEF7EC', border: '1px solid #31C48D' }}>
          <CheckCircle2 size={20} style={{ color: '#03543F' }} />
          <span className="text-sm font-bold" style={{ color: '#03543F' }}>
            ¡Jugador registrado correctamente!
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
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nombres</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej. Enner Remberto" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Apellidos</label>
            <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Ej. Valencia Lastra" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Cédula / Pasaporte</label>
            <div className="relative">
              <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="0900000000" className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
              <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Fecha de Nacimiento</label>
            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Club de Afiliación</label>
            <select name="club_id" value={formData.club_id} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }}>
              {clubesList.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nacionalidad</label>
            <input type="text" name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all" style={{ background: 'var(--fondo-principal)', border: '1px solid var(--borde-suave)', color: 'var(--texto-primario)' }} />
          </div>

          {tipo === 'jugador' && (
            <>
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
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
        <button
          disabled={cargando}
          onClick={() => guardarJugador(false)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #243558)' }}
        >
          <Save size={16} />
          {tipo === 'jugador' ? 'Guardar Jugador' : 'Guardar Staff'}
        </button>
        <button
          disabled={cargando}
          onClick={() => guardarJugador(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #27AE60, #1E8449)' }}
        >
          <Plus size={16} />
          Guardar y registrar otro
        </button>
      </div>
    </div>
  );
}

export default function PaginaNuevoJugador() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Formulario />
    </Suspense>
  )
}
