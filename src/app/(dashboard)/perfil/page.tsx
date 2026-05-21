'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, Key, Bell, Smartphone } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

export default function PaginaPerfil() {
  const [perfil, setPerfil] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function fetchPerfil() {
      const supabase = crearClienteNavegador();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: perfilData } = await supabase
          .from('perfiles')
          .select('*, clubes(nombre)')
          .eq('user_id', user.id)
          .single();
          
        if (perfilData) {
          setPerfil({ ...perfilData, email: user.email });
        }
      } else if (document.cookie.includes('mock_admin_session=true')) {
        setPerfil({
          nombre_completo: 'Administrador Principal',
          email: 'admin@ligapro.ec',
          rol: 'ADMIN',
          telefono: '+593 99 999 9999',
          cargo: 'Director de Competiciones'
        });
      }
      setCargando(false);
    }
    fetchPerfil();
  }, []);

  if (cargando) {
    return <div className="p-12 text-center text-[var(--texto-secundario)]">Cargando perfil...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 shadow-lg shadow-indigo-900/20">
              <User size={20} className="text-white" />
            </div>
            Mi Perfil
          </h1>
          <p className="text-sm mt-1 text-white/60 ml-[52px]">
            Gestión de cuenta personal y credenciales de acceso
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Resumen */}
        <div className="rounded-xl bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] shadow-[var(--sombra-tarjeta)] overflow-hidden h-fit">
          <div className="p-6 flex flex-col items-center text-center border-b border-[var(--borde-suave)]">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
              {perfil?.nombre_completo?.charAt(0) || 'U'}
            </div>
            <h2 className="text-lg font-bold text-[var(--texto-primario)]">{perfil?.nombre_completo}</h2>
            <p className="text-sm text-[var(--texto-secundario)]">{perfil?.cargo || 'Usuario del Sistema'}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Shield size={14} />
              {perfil?.rol || 'Rol no asignado'}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-[var(--texto-secundario)]">
              <Mail size={16} />
              {perfil?.email}
            </div>
            {perfil?.telefono && (
              <div className="flex items-center gap-3 text-sm text-[var(--texto-secundario)]">
                <Smartphone size={16} />
                {perfil?.telefono}
              </div>
            )}
            {perfil?.clubes && (
              <div className="flex items-center gap-3 text-sm text-[var(--texto-secundario)]">
                <Shield size={16} />
                Club: {perfil.clubes.nombre}
              </div>
            )}
          </div>
        </div>

        {/* Formularios de Actualización */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] shadow-[var(--sombra-tarjeta)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--borde-suave)] bg-[var(--fondo-principal)]">
              <h2 className="font-semibold text-sm text-[var(--texto-primario)]">Información Personal</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Nombre Completo</label>
                  <input type="text" defaultValue={perfil?.nombre_completo} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Cargo / Puesto</label>
                  <input type="text" defaultValue={perfil?.cargo} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Teléfono Móvil</label>
                  <input type="tel" defaultValue={perfil?.telefono} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  <Save size={16} /> Guardar Cambios
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] shadow-[var(--sombra-tarjeta)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--borde-suave)] bg-[var(--fondo-principal)]">
              <h2 className="font-semibold text-sm text-[var(--texto-primario)]">Seguridad y Acceso</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--borde-suave)] bg-[var(--fondo-principal)]">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--texto-primario)] flex items-center gap-2"><Key size={16}/> Cambiar Contraseña</h3>
                  <p className="text-xs text-[var(--texto-secundario)] mt-1">Se enviará un enlace de restablecimiento a tu correo electrónico registrado.</p>
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] text-[var(--texto-primario)] hover:bg-[var(--fondo-principal)]">
                  Solicitar Enlace
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--borde-suave)] bg-[var(--fondo-principal)]">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--texto-primario)] flex items-center gap-2"><Bell size={16}/> Notificaciones de Competición</h3>
                  <p className="text-xs text-[var(--texto-secundario)] mt-1">Recibir alertas por correo sobre cambios en fechas, bloqueos de planillas y multas.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
