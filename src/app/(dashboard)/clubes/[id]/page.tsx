'use client';

import { useState, useEffect, Suspense, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, MapPin, Calendar, Users, FileText, CheckCircle2, Edit, AlertTriangle } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

function KardexClub({ id }: { id: string }) {
  const router = useRouter();
  const supabase = crearClienteNavegador();
  const [club, setClub] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchClub() {
      const { data, error } = await supabase
        .from('clubes')
        .select(`
          *,
          estadios(nombre)
        `)
        .eq('id', id)
        .single();

      if (data) setClub(data);
      setCargando(false);
    }
    fetchClub();
  }, [id, supabase]);

  if (cargando) return <div className="p-10 text-center">Cargando kárdex del club...</div>;

  if (!club) return (
    <div className="space-y-6 max-w-[800px] mx-auto text-center">
      <h1 className="text-2xl font-bold">Club no encontrado</h1>
      <Link href="/clubes" className="text-blue-500 underline">Volver a Clubes</Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      {/* Navegación */}
      <Link
        href="/clubes"
        className="inline-flex items-center gap-2 text-sm font-medium no-underline transition-colors"
        style={{ color: 'var(--texto-secundario)' }}
      >
        <ArrowLeft size={16} />
        Volver a Clubes
      </Link>

      {/* Tarjeta principal del club */}
      <div className="rounded-xl overflow-hidden shadow-lg border" style={{ borderColor: 'var(--borde-suave)' }}>
        <div className="px-6 py-6" style={{ background: 'linear-gradient(135deg, #1B2A4A, #111D35)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-5">
              {/* Escudo/Avatar */}
              <div
                className="flex items-center justify-center rounded-full text-white text-3xl font-bold flex-shrink-0 shadow-inner"
                style={{
                  width: '90px',
                  height: '90px',
                  backgroundColor: club.color_principal || '#2980B9',
                  border: '4px solid rgba(255,255,255,0.2)',
                }}
              >
                {club.abreviatura}
              </div>
              
              {/* Info principal */}
              <div>
                <h1 className="text-2xl font-bold text-white">{club.nombre}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Shield size={16} />
                    Serie {club.serie}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70 text-sm">
                    <MapPin size={16} />
                    {club.ciudad}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Calendar size={16} />
                    Fundado: {club.fundacion ? new Date(club.fundacion).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Botón editar */}
            <Link
              href={`/clubes/${id}/editar`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/20 shadow-md"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Edit size={16} />
              Editar Club
            </Link>
          </div>
        </div>
        
        {/* Detalles adicionales */}
        <div className="p-6 bg-[var(--fondo-tarjeta)] text-[var(--texto-primario)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Control Económico */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--borde-suave)' }}>
                <FileText size={18} className="text-[#2980B9]" />
                Estado Legal y Financiero
              </h2>
              <div className="space-y-2">
                <p className="text-sm"><strong>RUC:</strong> {club.ruc || 'No registrado'}</p>
                <p className="text-sm flex items-center gap-2">
                  <strong>Control Económico:</strong> 
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    club.estado_control_economico === 'APROBADO' ? 'bg-green-100 text-green-800' :
                    club.estado_control_economico === 'SUSPENDIDO' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {club.estado_control_economico}
                  </span>
                </p>
                <p className="text-sm"><strong>Presupuesto Aprobado:</strong> ${club.presupuesto_aprobado?.toLocaleString() || '0'}</p>
              </div>
            </div>

            {/* Infraestructura y Contacto */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--borde-suave)' }}>
                <MapPin size={18} className="text-[#27AE60]" />
                Infraestructura
              </h2>
              <div className="space-y-2">
                <p className="text-sm"><strong>Estadio Principal:</strong> {club.estadios?.nombre || 'No asignado'}</p>
                <p className="text-sm"><strong>Abreviatura:</strong> {club.abreviatura}</p>
                <p className="text-sm"><strong>Color Principal:</strong> 
                  <span className="inline-block w-4 h-4 ml-2 rounded-full border border-gray-300 align-middle" style={{ backgroundColor: club.color_principal || '#ffffff' }}></span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaginaDetalleClub({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <KardexClub id={id} />
    </Suspense>
  )
}
