'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, Calendar, Users, FileText, Ban, DollarSign, Activity } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

export default function PaginaDisciplinario() {
  const [suspensiones, setSuspensiones] = useState<any[]>([]);
  const [multas, setMultas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState<'SUSPENSIONES' | 'MULTAS'>('SUSPENSIONES');

  useEffect(() => {
    async function fetchData() {
      const supabase = crearClienteNavegador();
      
      // Fetch suspensiones
      const { data: dataSuspensiones } = await supabase
        .from('suspensiones')
        .select(`
          *,
          jugadores(nombre_completo, clubes(nombre, escudo_url)),
          partidos(jornada)
        `)
        .order('fecha_inicio', { ascending: false })
        .limit(20);

      if (dataSuspensiones) setSuspensiones(dataSuspensiones);

      // Fetch multas
      const { data: dataMultas } = await supabase
        .from('multas')
        .select(`
          *,
          clubes(nombre, escudo_url),
          partidos(jornada)
        `)
        .order('fecha_generacion', { ascending: false })
        .limit(20);

      if (dataMultas) setMultas(dataMultas);

      setCargando(false);
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fade-in">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 shadow-lg shadow-red-900/20">
              <AlertTriangle size={20} className="text-white" />
            </div>
            Control Disciplinario
          </h1>
          <p className="text-sm mt-1 text-white/60 ml-[52px]">
            Tribunal de Sanciones, multas y jugadores inhabilitados
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] rounded-xl p-5 flex items-center gap-4 shadow-[var(--sombra-tarjeta)]">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Ban size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--texto-secundario)]">Jugadores Suspendidos</p>
            <p className="text-2xl font-bold text-[var(--texto-primario)]">{suspensiones.filter(s => s.activa).length}</p>
          </div>
        </div>
        <div className="bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] rounded-xl p-5 flex items-center gap-4 shadow-[var(--sombra-tarjeta)]">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <DollarSign size={24} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--texto-secundario)]">Multas Pendientes</p>
            <p className="text-2xl font-bold text-[var(--texto-primario)]">
              ${multas.filter(m => m.estado_pago === 'PENDIENTE').reduce((acc, curr) => acc + curr.monto_usd, 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] rounded-xl p-5 flex items-center gap-4 shadow-[var(--sombra-tarjeta)]">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Activity size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--texto-secundario)]">Incidentes de Jornada</p>
            <p className="text-2xl font-bold text-[var(--texto-primario)]">{suspensiones.length + multas.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs y Panel Principal */}
      <div className="rounded-xl overflow-hidden bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] shadow-[var(--sombra-tarjeta)]">
        <div className="flex border-b border-[var(--borde-suave)] bg-[var(--fondo-principal)]">
          <button 
            onClick={() => setTabActiva('SUSPENSIONES')}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${tabActiva === 'SUSPENSIONES' ? 'text-red-500 border-b-2 border-red-500 bg-red-500/5' : 'text-[var(--texto-secundario)] hover:bg-[var(--fondo-tarjeta)]'}`}
          >
            Jugadores Suspendidos
          </button>
          <button 
            onClick={() => setTabActiva('MULTAS')}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${tabActiva === 'MULTAS' ? 'text-amber-500 border-b-2 border-amber-500 bg-amber-500/5' : 'text-[var(--texto-secundario)] hover:bg-[var(--fondo-tarjeta)]'}`}
          >
            Libro de Multas (Ledger)
          </button>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-[var(--texto-secundario)]">Cargando registros disciplinarios...</div>
        ) : (
          <div className="p-0">
            {tabActiva === 'SUSPENSIONES' && (
              <table className="w-full text-left">
                <thead className="bg-[var(--fondo-principal)] border-b border-[var(--borde-suave)]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)]">Jugador</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)]">Club</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)]">Motivo</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] text-center">Partidos Restantes</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--borde-suave)]">
                  {suspensiones.map(s => (
                    <tr key={s.id} className="hover:bg-[var(--fondo-principal)]">
                      <td className="px-6 py-4 text-sm font-semibold text-[var(--texto-primario)]">
                        {s.jugadores?.nombre_completo}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--texto-secundario)]">
                        {s.jugadores?.clubes?.nombre}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-4 rounded-sm ${s.tipo_tarjeta_origen === 'ROJA' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                          <span className="text-sm text-[var(--texto-primario)]">{s.motivo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-[var(--texto-primario)]">
                        {s.partidos_restantes}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${s.activa ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                          {s.activa ? 'Inhabilitado' : 'Cumplida'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {suspensiones.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--texto-terciario)]">No hay jugadores suspendidos.</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {tabActiva === 'MULTAS' && (
              <table className="w-full text-left">
                <thead className="bg-[var(--fondo-principal)] border-b border-[var(--borde-suave)]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)]">Club Infractor</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)]">Concepto</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] text-right">Monto (USD)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--texto-secundario)] text-center">Estado de Cobro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--borde-suave)]">
                  {multas.map(m => (
                    <tr key={m.id} className="hover:bg-[var(--fondo-principal)]">
                      <td className="px-6 py-4 text-sm font-semibold text-[var(--texto-primario)]">
                        {m.clubes?.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--texto-secundario)]">
                        {m.concepto}
                        {m.es_reincidencia && <span className="ml-2 px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] uppercase font-bold">Reincidencia</span>}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-amber-500">
                        ${m.monto_usd.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          m.estado_pago === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-500' :
                          m.estado_pago === 'COBRADO' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {m.estado_pago}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {multas.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-[var(--texto-terciario)]">No hay multas registradas.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
