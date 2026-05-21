'use client';

import { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';

export default function PaginaArbitraje() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [arbitros, setArbitros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = await import('@/lib/supabase/cliente').then(m => m.crearClienteNavegador());
      
      const [resPartidos, resArbitros] = await Promise.all([
        supabase
          .from('partidos')
          .select(`
            id,
            jornada,
            fecha_hora,
            local:clubes!partidos_club_local_id_fkey(nombre),
            visitante:clubes!partidos_club_visitante_id_fkey(nombre),
            arbitros_partidos (
              rol,
              arbitro:arbitros(nombre, apellidos, categoria, es_var)
            )
          `)
          .order('fecha_hora', { ascending: false }),
        supabase
          .from('arbitros')
          .select('*')
      ]);

      if (resPartidos.data) {
        setPartidos(resPartidos.data.map((p: any) => ({
          ...p,
          local: p.local?.nombre || 'Local',
          visitante: p.visitante?.nombre || 'Visitante',
          fechaObj: new Date(p.fecha_hora)
        })));
      }
      
      if (resArbitros.data) {
        setArbitros(resArbitros.data);
      }

      setCargando(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--texto-primario)' }}>
          Asignación de Árbitros (Fase 4)
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
          Gestión de asignaciones arbitrales y verificación de reglas (rotación, categoría, VAR).
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--fondo-tarjeta)', boxShadow: 'var(--sombra-tarjeta)', border: '1px solid var(--borde-suave)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: 'var(--fondo-principal)', borderBottom: '1px solid var(--borde-suave)' }}>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Jornada</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Partido</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Fecha</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--texto-secundario)' }}>Cuerpo Arbitral Asignado</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--borde-suave)' }}>
              {cargando ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm" style={{ color: 'var(--texto-terciario)' }}>Cargando asignaciones...</td></tr>
              ) : partidos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-sm">J{p.jornada}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="font-bold">{p.local}</span> vs <span className="font-bold">{p.visitante}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {p.fechaObj.toLocaleDateString()} {p.fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    {p.arbitros_partidos && p.arbitros_partidos.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {p.arbitros_partidos.map((ap: any, i: number) => (
                          <div key={i} className="text-xs flex justify-between w-64 bg-gray-100 px-2 py-1 rounded">
                            <span className="font-semibold text-gray-700">{ap.rol}:</span>
                            <span>{ap.arbitro?.nombre} {ap.arbitro?.apellidos}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">Sin asignaciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
