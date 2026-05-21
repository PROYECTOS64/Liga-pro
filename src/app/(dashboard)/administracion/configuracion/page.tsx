'use client';

import { useState } from 'react';
import { 
  Settings, Save, AlertTriangle, DollarSign, 
  CalendarDays, Users, Database
} from 'lucide-react';

export default function PaginaConfiguracion() {
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [config, setConfig] = useState({
    multaAmarillaA: 20,
    multaRojaA: 100,
    multaAmarillaB: 10,
    multaRojaB: 50,
    multaInfraccionGrave: 500,
    multaReincidenciaA: 2000,
    multaReincidenciaB: 1000,
    ventanaTransferenciasAbierta: true,
    modoMantenimiento: false,
    maxJugadoresPlanilla: 23,
    minutosCierrePlanilla: 70
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const guardarConfiguracion = () => {
    setGuardando(true);
    setExito(false);
    // Simular guardado en base de datos
    setTimeout(() => {
      setGuardando(false);
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto animate-fade-in">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-lg shadow-slate-900/20">
              <Settings size={20} className="text-white" />
            </div>
            Configuración Global
          </h1>
          <p className="text-sm mt-1 text-white/60 ml-[52px]">
            Parametrización del sistema, multas y reglas de competición
          </p>
        </div>
        <button
          onClick={guardarConfiguracion}
          disabled={guardando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #27AE60, #2ECC71)' }}
        >
          {guardando ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={18} />}
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {exito && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">Configuración actualizada exitosamente.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multas Disciplinarias Serie A */}
        <div className="rounded-xl bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] shadow-[var(--sombra-tarjeta)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--borde-suave)] bg-[var(--fondo-principal)] flex items-center gap-3">
            <DollarSign size={18} className="text-amber-500" />
            <h2 className="font-semibold text-sm text-[var(--texto-primario)]">Multas Disciplinarias (Serie A)</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Tarjeta Amarilla (USD)</label>
              <input type="number" name="multaAmarillaA" value={config.multaAmarillaA} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Tarjeta Roja (USD)</label>
              <input type="number" name="multaRojaA" value={config.multaRojaA} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Multa por Reincidencia (USD)</label>
              <input type="number" name="multaReincidenciaA" value={config.multaReincidenciaA} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-amber-500" />
            </div>
          </div>
        </div>

        {/* Multas Disciplinarias Serie B */}
        <div className="rounded-xl bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] shadow-[var(--sombra-tarjeta)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--borde-suave)] bg-[var(--fondo-principal)] flex items-center gap-3">
            <DollarSign size={18} className="text-blue-500" />
            <h2 className="font-semibold text-sm text-[var(--texto-primario)]">Multas Disciplinarias (Serie B)</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Tarjeta Amarilla (USD)</label>
              <input type="number" name="multaAmarillaB" value={config.multaAmarillaB} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Tarjeta Roja (USD)</label>
              <input type="number" name="multaRojaB" value={config.multaRojaB} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Multa por Reincidencia (USD)</label>
              <input type="number" name="multaReincidenciaB" value={config.multaReincidenciaB} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Reglas de Competición */}
        <div className="rounded-xl bg-[var(--fondo-tarjeta)] border border-[var(--borde-suave)] shadow-[var(--sombra-tarjeta)] overflow-hidden md:col-span-2">
          <div className="px-5 py-4 border-b border-[var(--borde-suave)] bg-[var(--fondo-principal)] flex items-center gap-3">
            <CalendarDays size={18} className="text-purple-500" />
            <h2 className="font-semibold text-sm text-[var(--texto-primario)]">Reglas de Operación y Competición</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Minutos previos para cierre de Planilla (Regla T-70)</label>
                <input type="number" name="minutosCierrePlanilla" value={config.minutosCierrePlanilla} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--texto-secundario)] mb-1">Máximo de jugadores por Planilla</label>
                <input type="number" name="maxJugadoresPlanilla" value={config.maxJugadoresPlanilla} onChange={handleChange} className="w-full px-3 py-2 rounded-lg text-sm bg-[var(--fondo-principal)] border border-[var(--borde-suave)] text-[var(--texto-primario)] outline-none focus:border-purple-500" />
              </div>
            </div>
            <div className="space-y-4 flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-[var(--borde-suave)] hover:bg-[var(--fondo-principal)] transition-colors">
                <input type="checkbox" name="ventanaTransferenciasAbierta" checked={config.ventanaTransferenciasAbierta} onChange={handleChange} className="w-4 h-4 rounded text-purple-600 bg-[var(--fondo-principal)] border-[var(--borde-suave)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--texto-primario)]">Ventana de Transferencias</p>
                  <p className="text-xs text-[var(--texto-terciario)]">Permitir inscripción de nuevos jugadores en clubes</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-red-500/20 hover:bg-red-500/5 transition-colors">
                <input type="checkbox" name="modoMantenimiento" checked={config.modoMantenimiento} onChange={handleChange} className="w-4 h-4 rounded text-red-600 bg-[var(--fondo-principal)] border-[var(--borde-suave)]" />
                <div>
                  <p className="text-sm font-medium text-red-600">Modo Mantenimiento del Sistema</p>
                  <p className="text-xs text-red-600/70">Bloquea el acceso a comisarios y delegados. Solo Administradores.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy CheckCircle para evitar errores de importación perdidos arriba
function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
}
