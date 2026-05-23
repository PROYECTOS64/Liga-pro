'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, Plus, Search, Filter, AlertTriangle, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

export default function PaginaClubes() {
  const [clubes, setClubes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('TODAS');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = crearClienteNavegador();
    
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.email === 'admin@ligapro.ec') {
           setUserRole('admin');
        } else {
           const { data: perfil } = await supabase.from('perfiles').select('rol').eq('user_id', user.id).single();
           let rolReal = 'usuario';
           if (perfil?.rol === 'ADMIN') rolReal = 'admin';
           else if (perfil?.rol === 'DELEGADO_CLUB') rolReal = 'club';
           else if (perfil?.rol === 'ARBITRO') rolReal = 'arbitro';
           setUserRole(rolReal);
        }
      }
    };

    async function fetchClubes() {
      const { data, error } = await supabase
        .from('clubes')
        .select(`
          *,
          estadios(nombre)
        `)
        .order('nombre', { ascending: true });

      if (data) {
        setClubes(data);
      }
      setCargando(false);
    }
    fetchUserRole();
    fetchClubes();
  }, []);

  const clubesFiltrados = clubes.filter(club => {
    const coincideBusqueda = club.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             club.abreviatura.toLowerCase().includes(busqueda.toLowerCase());
    const coincideSerie = filtroSerie === 'TODAS' || club.serie === filtroSerie;
    return coincideBusqueda && coincideSerie;
  });

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'APROBADO': return { bg: '#DEF7EC', text: '#03543F', icon: <CheckCircle2 size={14}/> };
      case 'RECHAZADO': return { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle size={14}/> };
      case 'SUSPENDIDO': return { bg: '#FEF3C7', text: '#92400E', icon: <AlertTriangle size={14}/> };
      case 'EN_REVISION': return { bg: '#E5E7EB', text: '#374151', icon: <Clock size={14}/> };
      default: return { bg: '#E5E7EB', text: '#374151', icon: null };
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fade-in">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg shadow-green-900/20">
              <Shield size={20} className="text-white" />
            </div>
            Clubes Afiliados
          </h1>
          <p className="text-sm mt-1 text-white/60 ml-[52px]">
            Directorio maestro y estado financiero de clubes LIGAPRO EC
          </p>
        </div>
        {userRole === 'admin' && (
          <Link
            href="/clubes/nuevo"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 shadow-lg no-underline"
            style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)' }}
          >
            <Plus size={18} />
            Registrar Club
          </Link>
        )}
      </div>

      {/* Panel principal */}
      <div className="rounded-xl overflow-hidden bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] shadow-[var(--sombra-tarjeta)]">
        
        {/* Filtros */}
        <div className="p-4 border-b border-[var(--borde-suave)] flex flex-col sm:flex-row gap-4 justify-between bg-[var(--fondo-principal)]">
          <div className="flex items-center gap-2 bg-[var(--fondo-tarjeta)] p-1 rounded-lg border border-[var(--borde-suave)]">
            {['TODAS', 'A', 'B'].map((serie) => (
              <button
                key={serie}
                onClick={() => setFiltroSerie(serie)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filtroSerie === serie 
                    ? 'bg-[var(--fondo-principal)] text-[var(--texto-primario)] shadow-sm' 
                    : 'text-[var(--texto-secundario)] hover:text-[var(--texto-primario)]'
                }`}
              >
                {serie === 'TODAS' ? 'Todas las Series' : `Serie ${serie}`}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--texto-terciario)]" />
            <input
              type="text"
              placeholder="Buscar club..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg text-sm border border-[var(--borde-suave)] bg-[var(--fondo-tarjeta)] text-[var(--texto-primario)] focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>

        {/* Tabla / Grid */}
        {cargando ? (
          <div className="p-12 text-center text-[var(--texto-secundario)]">Cargando clubes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--fondo-principal)] border-b border-[var(--borde-suave)]">
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] uppercase tracking-wider">Club</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] uppercase tracking-wider text-center">Serie</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] uppercase tracking-wider text-center">Control Económico</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] uppercase tracking-wider">Estadio Principal</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--borde-suave)]">
                {clubesFiltrados.map((club) => {
                  const estadoColor = getColorEstado(club.estado_control_economico);
                  return (
                    <tr key={club.id} className="hover:bg-[var(--fondo-principal)] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner"
                            style={{ backgroundColor: club.color_principal || '#1B2A4A' }}
                          >
                            {club.abreviatura}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--texto-primario)]">{club.nombre}</p>
                            <p className="text-xs text-[var(--texto-terciario)]">{club.ciudad}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] text-xs font-bold text-[var(--texto-primario)]">
                          {club.serie}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: estadoColor.bg, color: estadoColor.text }}
                        >
                          {estadoColor.icon}
                          {club.estado_control_economico}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--texto-secundario)]">
                        {club.estadios?.nombre || 'No asignado'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/clubes/${club.id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity bg-[#1B2A4A] hover:bg-[#243558]"
                        >
                          Ver Kárdex
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {clubesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--texto-terciario)]">
                      No se encontraron clubes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
