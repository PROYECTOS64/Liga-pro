'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy, ArrowLeft, Scale, ChevronRight, CheckCircle2,
  Circle, Target, Users, Minus, ArrowUpDown,
  Play, RotateCcw, Info, AlertTriangle, Zap
} from 'lucide-react';

// ============================================
// DATOS DE EJEMPLO - Desempate
// ============================================
interface EquipoDesempate {
  club: string;
  abreviatura: string;
  color: string;
  pts: number;
  dg: number;
  gf: number;
  gc: number;
  enfrentamientosDirectos: {
    rival: string;
    resultado: string;
    goles: string;
  }[];
  tarjetasAmarillas: number;
  tarjetasRojas: number;
}

const equiposEmpatados: EquipoDesempate[] = [
  {
    club: 'Aucas',
    abreviatura: 'AUC',
    color: '#FF8C00',
    pts: 25,
    dg: 3,
    gf: 20,
    gc: 17,
    enfrentamientosDirectos: [
      { rival: 'El Nacional', resultado: 'G', goles: '2-1' },
      { rival: 'El Nacional', resultado: 'E', goles: '0-0' },
    ],
    tarjetasAmarillas: 42,
    tarjetasRojas: 3,
  },
  {
    club: 'El Nacional',
    abreviatura: 'NAC',
    color: '#FF0000',
    pts: 25,
    dg: 3,
    gf: 19,
    gc: 16,
    enfrentamientosDirectos: [
      { rival: 'Aucas', resultado: 'P', goles: '1-2' },
      { rival: 'Aucas', resultado: 'E', goles: '0-0' },
    ],
    tarjetasAmarillas: 48,
    tarjetasRojas: 5,
  },
];

// Los 5 criterios de desempate del reglamento
const criteriosDesempate = [
  {
    numero: 1,
    titulo: 'Mayor diferencia de gol general',
    descripcion: 'Se compara la diferencia entre goles a favor y goles en contra de toda la temporada.',
    icono: Target,
    color: '#D4A843',
  },
  {
    numero: 2,
    titulo: 'Mayor número de goles a favor',
    descripcion: 'Se compara el total de goles anotados por cada equipo en toda la competición.',
    icono: Zap,
    color: '#27AE60',
  },
  {
    numero: 3,
    titulo: 'Resultado entre los equipos empatados',
    descripcion: 'Se revisan los enfrentamientos directos entre los equipos. Se consideran victorias, empates y derrotas.',
    icono: Users,
    color: '#2980B9',
  },
  {
    numero: 4,
    titulo: 'Diferencia de gol entre los empatados',
    descripcion: 'Si después del criterio anterior persiste el empate, se considera la diferencia de gol solo en los enfrentamientos directos.',
    icono: ArrowUpDown,
    color: '#E67E22',
  },
  {
    numero: 5,
    titulo: 'Menor número de tarjetas (sorteo)',
    descripcion: 'Se compara el fair play: tarjetas amarillas y rojas acumuladas. Si persiste el empate, se procede al sorteo.',
    icono: AlertTriangle,
    color: '#C0392B',
  },
];

interface PasoResolucion {
  criterio: number;
  titulo: string;
  detalle: string;
  resultado: 'RESUELTO' | 'EMPATE_PERSISTE' | 'PENDIENTE';
  ganador?: string;
  valores: { equipo: string; valor: string }[];
}

const pasosResolucion: PasoResolucion[] = [
  {
    criterio: 1,
    titulo: 'Diferencia de Gol General',
    detalle: 'Ambos equipos tienen DG = +3. El empate persiste.',
    resultado: 'EMPATE_PERSISTE',
    valores: [
      { equipo: 'Aucas', valor: '+3' },
      { equipo: 'El Nacional', valor: '+3' },
    ],
  },
  {
    criterio: 2,
    titulo: 'Goles a Favor',
    detalle: 'Aucas tiene 20 goles a favor vs El Nacional con 19. Aucas gana este criterio.',
    resultado: 'RESUELTO',
    ganador: 'Aucas',
    valores: [
      { equipo: 'Aucas', valor: '20 goles' },
      { equipo: 'El Nacional', valor: '19 goles' },
    ],
  },
  {
    criterio: 3,
    titulo: 'Enfrentamientos Directos',
    detalle: 'No fue necesario aplicar este criterio.',
    resultado: 'PENDIENTE',
    valores: [
      { equipo: 'Aucas', valor: '1G 1E 0P' },
      { equipo: 'El Nacional', valor: '0G 1E 1P' },
    ],
  },
  {
    criterio: 4,
    titulo: 'DG Enfrentamientos Directos',
    detalle: 'No fue necesario aplicar este criterio.',
    resultado: 'PENDIENTE',
    valores: [
      { equipo: 'Aucas', valor: '+1' },
      { equipo: 'El Nacional', valor: '-1' },
    ],
  },
  {
    criterio: 5,
    titulo: 'Fair Play / Sorteo',
    detalle: 'No fue necesario aplicar este criterio.',
    resultado: 'PENDIENTE',
    valores: [
      { equipo: 'Aucas', valor: '42 TA / 3 TR' },
      { equipo: 'El Nacional', valor: '48 TA / 5 TR' },
    ],
  },
];

export default function PaginaDesempate() {
  const [calculoActivo, setCalculoActivo] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    setAnimado(true);
  }, []);

  const ejecutarCalculo = () => {
    setCalculoActivo(true);
    setPasoActual(0);
    // Avance automático
    let paso = 0;
    const intervalo = setInterval(() => {
      paso++;
      if (paso >= pasosResolucion.length) {
        clearInterval(intervalo);
      }
      setPasoActual(paso);
    }, 1200);
  };

  const reiniciarCalculo = () => {
    setCalculoActivo(false);
    setPasoActual(0);
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Cabecera */}
      <div className={`transition-all duration-500 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <Link
          href="/competiciones"
          className="inline-flex items-center gap-2 text-sm font-medium no-underline mb-4 transition-colors"
          style={{ color: 'var(--texto-secundario)' }}
        >
          <ArrowLeft size={16} />
          Volver a Competiciones
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--texto-primario)' }}>
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: '42px', height: '42px', background: '#FEF3C7' }}
              >
                <Scale size={22} style={{ color: '#D4A843' }} />
              </div>
              Desempates
            </h1>
            <p className="text-sm mt-1 ml-[54px]" style={{ color: 'var(--texto-secundario)' }}>
              Algoritmo de resolución de empates según reglamento LigaPro
            </p>
          </div>
        </div>
      </div>

      {/* Explicación del algoritmo */}
      <div
        className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
          animationDelay: '100ms',
          animationFillMode: 'both',
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-3.5"
          style={{ background: 'linear-gradient(135deg, #D4A843, #B8922F)' }}
        >
          <Info size={18} className="text-white" />
          <h2 className="text-white font-semibold text-sm">Criterios de Desempate - Reglamento LigaPro</h2>
        </div>

        <div className="p-5">
          <p className="text-sm mb-5" style={{ color: 'var(--texto-secundario)' }}>
            Cuando dos o más equipos terminan con la misma cantidad de puntos, se aplican los siguientes criterios en orden para determinar la posición final:
          </p>

          <div className="space-y-3">
            {criteriosDesempate.map((criterio) => {
              const Icono = criterio.icono;
              return (
                <div
                  key={criterio.numero}
                  className="flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-gray-50"
                  style={{ border: '1px solid var(--borde-suave)' }}
                >
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: `${criterio.color}15`,
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: criterio.color }}>
                      {criterio.numero}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icono size={16} style={{ color: criterio.color }} />
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
                        {criterio.titulo}
                      </h3>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--texto-secundario)' }}>
                      {criterio.descripcion}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--texto-terciario)' }} className="flex-shrink-0 mt-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulador de desempate */}
      <div
        className={`rounded-xl overflow-hidden transition-all duration-500 ${animado ? 'animate-slide-up' : 'opacity-0'}`}
        style={{
          background: 'var(--fondo-tarjeta)',
          boxShadow: 'var(--sombra-tarjeta)',
          border: '1px solid var(--borde-suave)',
          animationDelay: '200ms',
          animationFillMode: 'both',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #111D35)' }}
        >
          <div className="flex items-center gap-3">
            <Scale size={18} className="text-white" />
            <h2 className="text-white font-semibold text-sm">Simulador de Desempate</h2>
          </div>
          <div className="flex items-center gap-2">
            {!calculoActivo ? (
              <button
                onClick={ejecutarCalculo}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <Play size={14} />
                Ejecutar Cálculo
              </button>
            ) : (
              <button
                onClick={reiniciarCalculo}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <RotateCcw size={14} />
                Reiniciar
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* Equipos empatados */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--texto-secundario)' }}>
              Equipos Empatados — {equiposEmpatados[0]?.pts} puntos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {equiposEmpatados.map((equipo) => (
                <div
                  key={equipo.club}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ border: '1px solid var(--borde-suave)', background: 'var(--fondo-principal)' }}
                >
                  <div
                    className="flex items-center justify-center rounded-full text-white text-sm font-bold flex-shrink-0"
                    style={{ width: '48px', height: '48px', background: equipo.color }}
                  >
                    {equipo.abreviatura}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>{equipo.club}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                        <span className="font-semibold">{equipo.pts}</span> pts
                      </span>
                      <span className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                        DG: <span className="font-semibold">{equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg}</span>
                      </span>
                      <span className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                        GF: <span className="font-semibold">{equipo.gf}</span>
                      </span>
                      <span className="text-xs" style={{ color: 'var(--texto-secundario)' }}>
                        GC: <span className="font-semibold">{equipo.gc}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pasos de resolución */}
          {calculoActivo && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--texto-secundario)' }}>
                Resolución Paso a Paso
              </p>

              {pasosResolucion.map((paso, i) => {
                const esVisible = i <= pasoActual;
                const esActivo = i === pasoActual;

                if (!esVisible) return null;

                return (
                  <div
                    key={paso.criterio}
                    className="rounded-xl overflow-hidden transition-all duration-500 animate-slide-up"
                    style={{
                      border: `1px solid ${paso.resultado === 'RESUELTO' ? '#27AE60' : paso.resultado === 'EMPATE_PERSISTE' ? '#E67E22' : 'var(--borde-suave)'}`,
                      background: paso.resultado === 'RESUELTO' ? 'rgba(39, 174, 96, 0.04)' : 'transparent',
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{
                            width: '32px',
                            height: '32px',
                            background: paso.resultado === 'RESUELTO' ? '#DEF7EC' : paso.resultado === 'EMPATE_PERSISTE' ? '#FEF3C7' : '#F3F4F6',
                          }}
                        >
                          {paso.resultado === 'RESUELTO' ? (
                            <CheckCircle2 size={16} style={{ color: '#27AE60' }} />
                          ) : paso.resultado === 'EMPATE_PERSISTE' ? (
                            <Minus size={16} style={{ color: '#E67E22' }} />
                          ) : (
                            <Circle size={16} style={{ color: 'var(--texto-terciario)' }} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--texto-primario)' }}>
                            Criterio {paso.criterio}: {paso.titulo}
                          </h4>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--texto-secundario)' }}>
                            {paso.detalle}
                          </p>
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                          style={{
                            background: paso.resultado === 'RESUELTO' ? '#DEF7EC' : paso.resultado === 'EMPATE_PERSISTE' ? '#FEF3C7' : '#F3F4F6',
                            color: paso.resultado === 'RESUELTO' ? '#03543F' : paso.resultado === 'EMPATE_PERSISTE' ? '#92400E' : 'var(--texto-terciario)',
                          }}
                        >
                          {paso.resultado === 'RESUELTO' ? '✓ Resuelto' : paso.resultado === 'EMPATE_PERSISTE' ? 'Empate persiste' : 'No aplicado'}
                        </span>
                      </div>

                      {/* Valores de comparación */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {paso.valores.map((v) => (
                          <div
                            key={v.equipo}
                            className="flex items-center justify-between px-3 py-2 rounded-lg"
                            style={{
                              background: 'var(--fondo-principal)',
                              border: paso.ganador === v.equipo ? '2px solid #27AE60' : '1px solid var(--borde-suave)',
                            }}
                          >
                            <span className="text-xs font-medium" style={{ color: 'var(--texto-primario)' }}>{v.equipo}</span>
                            <span
                              className="text-xs font-bold"
                              style={{ color: paso.ganador === v.equipo ? '#27AE60' : 'var(--texto-secundario)' }}
                            >
                              {v.valor}
                              {paso.ganador === v.equipo && ' ✓'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Resultado final */}
              {pasoActual >= pasosResolucion.length - 1 && (
                <div
                  className="rounded-xl p-5 text-center animate-slide-up"
                  style={{
                    background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.08), rgba(39, 174, 96, 0.02))',
                    border: '2px solid #27AE60',
                  }}
                >
                  <Trophy size={32} style={{ color: '#D4A843' }} className="mx-auto mb-2" />
                  <h3 className="text-lg font-bold" style={{ color: 'var(--texto-primario)' }}>
                    Desempate Resuelto
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--texto-secundario)' }}>
                    <span className="font-bold" style={{ color: '#27AE60' }}>Aucas</span> queda por encima de El Nacional por mayor número de goles a favor (Criterio 2)
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#DEF7EC', border: '1px solid #27AE60' }}>
                      <span className="text-sm font-bold" style={{ color: '#03543F' }}>6°</span>
                      <span className="text-sm font-medium" style={{ color: '#03543F' }}>Aucas</span>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--texto-terciario)' }} />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#F3F4F6', border: '1px solid var(--borde-suave)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--texto-primario)' }}>7°</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--texto-primario)' }}>El Nacional</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Placeholder cuando no se ha ejecutado */}
          {!calculoActivo && (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="flex items-center justify-center rounded-full mb-4"
                style={{ width: '72px', height: '72px', background: 'var(--fondo-principal)', border: '2px solid var(--borde-suave)' }}
              >
                <Scale size={32} style={{ color: 'var(--texto-terciario)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--texto-secundario)' }}>
                Presiona &quot;Ejecutar Cálculo&quot; para ver la resolución paso a paso
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--texto-terciario)' }}>
                Se aplicarán los 5 criterios del reglamento en orden
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
