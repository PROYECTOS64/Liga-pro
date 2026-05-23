'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Landmark, MapPin, Users, Leaf, Search, Filter,
  CheckCircle2, XCircle, Building2, ChevronRight,
  Plus, Download, PenLine
} from 'lucide-react';
import ModalEstadio, { EstadioForm } from '@/components/ModalEstadio';

export default function PaginaEstadios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'habilitado' | 'deshabilitado'>('todos');
  const [filtroCesped, setFiltroCesped] = useState<'todos' | 'NATURAL' | 'SINTETICO' | 'HIBRIDO'>('todos');
  const [estadios, setEstadios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estadioAEditar, setEstadioAEditar] = useState<EstadioForm | null>(null);

  const fetchEstadios = async () => {
    const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
    const { data } = await supabase
      .from('estadios')
      .select(`
        *,
        clubes(nombre)
      `)
      .order('nombre', { ascending: true });

    if (data) {
      setEstadios(data);
    }
    setCargando(false);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user.email === 'admin@ligapro.ec') {
           setUserRole('admin');
        } else {
           const { data: perfil } = await supabase.from('perfiles').select('rol').eq('user_id', user.id).single();
           setUserRole(perfil?.rol?.toLowerCase() || 'usuario');
        }
      }
    };
    fetchUserRole();
    fetchEstadios();
  }, []);

  const handleNuevoEstadio = () => {
    setEstadioAEditar(null);
    setIsModalOpen(true);
  };

  const handleEditarEstadio = (e: React.MouseEvent, estadio: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEstadioAEditar({
      id: estadio.id,
      nombre: estadio.nombre,
      ciudad: estadio.ciudad,
      capacidad: estadio.capacidad,
      tipo_cesped: estadio.tipo_cesped,
      is_habilitado: estadio.is_habilitado,
    });
    setIsModalOpen(true);
  };

  const handleModalGuardado = () => {
    setIsModalOpen(false);
    fetchEstadios(); // Recargar la lista
  };

  const estadiosFiltrados = estadios.filter((e) => {
    const coincideBusqueda =
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.ciudad.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      filtroEstado === 'todos' ||
      (filtroEstado === 'habilitado' && e.is_habilitado) ||
      (filtroEstado === 'deshabilitado' && !e.is_habilitado);
    const coincideCesped =
      filtroCesped === 'todos' || e.tipo_cesped === filtroCesped;
    return coincideBusqueda && coincideEstado && coincideCesped;
  });

  const totalHabilitados = estadios.filter(e => e.is_habilitado).length;
  const totalDeshabilitados = estadios.filter(e => !e.is_habilitado).length;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
            Registro de Estadios
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
            Gestión y control de los escenarios deportivos registrados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'var(--fondo-tarjeta)',
              color: 'var(--texto-primario)',
              border: '1px solid var(--borde-suave)',
            }}
          >
            <Download size={16} />
            Exportar
          </button>
          {userRole === 'admin' && (
            <button
              onClick={handleNuevoEstadio}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #2980B9, #1F6691)' }}
            >
              <Plus size={16} />
              Nuevo Estadio
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#EBF5FF' }}>
            <Landmark size={24} style={{ color: '#2980B9' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Total Estadios</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{estadios.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#DEF7EC' }}>
            <CheckCircle2 size={24} style={{ color: '#27AE60' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Habilitados</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{totalHabilitados}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-xl" style={{
          background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)',
        }}>
          <div className="flex items-center justify-center rounded-xl" style={{ width: '52px', height: '52px', background: '#FEE2E2' }}>
            <XCircle size={24} style={{ color: '#C0392B' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>Deshabilitados</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>{totalDeshabilitados}</p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, ciudad o club..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#2980B9]/30"
            style={{
              background: 'var(--fondo-tarjeta)',
              borderColor: 'var(--borde-suave)',
              color: 'var(--texto-primario)',
            }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} style={{ color: 'var(--texto-secundario)' }} />
          {(['todos', 'habilitado', 'deshabilitado'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filtroEstado === f ? '#1B2A4A' : 'var(--fondo-tarjeta)',
                color: filtroEstado === f ? 'white' : 'var(--texto-secundario)',
                border: `1px solid ${filtroEstado === f ? '#1B2A4A' : 'var(--borde-suave)'}`,
              }}
            >
              {f === 'todos' ? 'Todos' : f === 'habilitado' ? 'Habilitados' : 'Deshabilitados'}
            </button>
          ))}
          <span className="text-xs" style={{ color: 'var(--texto-terciario)' }}>|</span>
          {(['todos', 'NATURAL', 'SINTETICO', 'HIBRIDO'] as any).map((f: any) => (
            <button
              key={f}
              onClick={() => setFiltroCesped(f)}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filtroCesped === f ? '#27AE60' : 'var(--fondo-tarjeta)',
                color: filtroCesped === f ? 'white' : 'var(--texto-secundario)',
                border: `1px solid ${filtroCesped === f ? '#27AE60' : 'var(--borde-suave)'}`,
              }}
            >
              {f === 'todos' ? 'Todo Césped' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Estadios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {estadiosFiltrados.map((estadio) => (
          <Link
            key={estadio.id}
            href={`/infraestructura/${estadio.id}`}
            className="group no-underline"
          >
            <div
              className="rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 h-full"
              style={{
                background: 'var(--fondo-tarjeta)',
                boxShadow: 'var(--sombra-tarjeta)',
                border: '1px solid var(--borde-suave)',
              }}
            >
              {/* Placeholder imagen */}
              <div className="h-32 flex items-center justify-center relative" style={{
                background: 'linear-gradient(135deg, #1B2A4A, #243558)',
              }}>
                <Building2 size={40} className="text-white/20" />
                <div className="absolute top-3 right-3">
                  {estadio.is_habilitado ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: '#DEF7EC', color: '#03543F' }}>
                      <CheckCircle2 size={10} /> Habilitado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: '#FEE2E2', color: '#991B1B' }}>
                      <XCircle size={10} /> Deshabilitado
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <h3 className="text-sm font-bold truncate" style={{ color: 'var(--texto-primario)' }}>
                  {estadio.nombre}
                </h3>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin size={12} style={{ color: 'var(--texto-terciario)' }} />
                    <span style={{ color: 'var(--texto-secundario)' }}>{estadio.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Building2 size={12} style={{ color: 'var(--texto-terciario)' }} />
                    <span style={{ color: 'var(--texto-secundario)' }}>{estadio.clubes?.[0]?.nombre || 'Varios clubes'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users size={12} style={{ color: 'var(--texto-terciario)' }} />
                    <span style={{ color: 'var(--texto-secundario)' }}>
                      Capacidad: {estadio.capacidad?.toLocaleString('es-EC')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Leaf size={12} style={{ color: 'var(--texto-terciario)' }} />
                    <span style={{ color: 'var(--texto-secundario)' }}>Césped {estadio.tipo_cesped}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--borde-suave)' }}>
                  {userRole === 'admin' ? (
                    <button 
                      onClick={(e) => handleEditarEstadio(e, estadio)}
                      className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md transition-colors" 
                      style={{ color: '#D4A843', background: 'rgba(212, 168, 67, 0.1)' }}
                    >
                      <PenLine size={14} /> Editar
                    </button>
                  ) : (
                    <span className="text-xs text-transparent">Espacio</span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--ligapro-blue)' }}>
                    Ver Checklist <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Sin resultados */}
      {estadiosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Landmark size={48} style={{ color: 'var(--texto-terciario)' }} className="mx-auto mb-4" />
          <p className="text-lg font-semibold" style={{ color: 'var(--texto-primario)' }}>
            No se encontraron estadios
          </p>
          <p className="text-sm" style={{ color: 'var(--texto-secundario)' }}>
            Modifica los filtros de búsqueda para ver resultados
          </p>
        </div>
      )}
      {/* Modal */}
      <ModalEstadio 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleModalGuardado}
        estadioAEditar={estadioAEditar}
      />
    </div>
  );
}
