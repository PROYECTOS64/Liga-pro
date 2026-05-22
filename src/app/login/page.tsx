'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, Eye, EyeOff, Globe, ArrowRight, Shield, Users } from 'lucide-react';
import { crearClienteNavegador } from '@/lib/supabase/cliente';

function LoginContenido() {
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const manejarLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const supabase = crearClienteNavegador();

      if (modoRegistro) {
        const { error: errorRegistro } = await supabase.auth.signUp({
          email,
          password: contrasena,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              nombre_completo: nombreCompleto,
            },
          },
        });

        if (errorRegistro) throw errorRegistro;
        setMensajeExito('¡Cuenta creada exitosamente! Revisa tu correo para confirmar tu cuenta. El enlace de confirmación te llevará directamente al sistema.');
        setModoRegistro(false);
      } else {

        const { error: errorLogin } = await supabase.auth.signInWithPassword({
          email,
          password: contrasena,
        });

        if (errorLogin) throw errorLogin;
        document.cookie = "mock_session_role=usuario; path=/; max-age=86400";
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      if (mensaje.includes('Invalid login credentials')) {
        setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else if (mensaje.includes('Email not confirmed')) {
        setError('Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.');
      } else if (mensaje.includes('already registered') || mensaje.includes('User already registered')) {
        setError('Este correo ya está registrado. Intenta iniciar sesión en la pestaña "Iniciar Sesión".');
      } else if (mensaje.includes('over_email_send_rate_limit') || mensaje.includes('email rate limit exceeded') || mensaje.includes('rate limit')) {
        setError('Límite de correos alcanzado. Supabase permite máximo 2 registros por hora en el plan gratuito. Espera unos minutos e intenta de nuevo, o usa una cuenta de Google.');
      } else if (mensaje.includes('Password should be at least')) {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (mensaje.includes('Unable to validate email address')) {
        setError('El formato del correo electrónico no es válido.');
      } else if (mensaje.includes('email_address_invalid')) {
        setError('El correo electrónico ingresado no es válido o no está permitido.');
      } else {
        setError(mensaje);
      }
    } finally {
      setCargando(false);
    }
  };

  const manejarLoginGoogle = async () => {
    setError('');
    setCargando(true);
    try {
      const supabase = crearClienteNavegador();
      const { error: errorOAuth } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (errorOAuth) throw errorOAuth;
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      setError(mensaje);
      setCargando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(135deg, #1B2A4A 0%, #111D35 40%, #0A1628 100%)',
      }}
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, #D4A843 0%, transparent 70%)',
            top: '-200px',
            right: '-100px',
          }}
        />
        <div
          className="absolute rounded-full opacity-8"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, #27AE60 0%, transparent 70%)',
            bottom: '-150px',
            left: '-100px',
          }}
        />
        {/* Patrón de campo de fútbol sutil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Tarjeta principal de login */}
      <div
        className="relative w-full max-w-md animate-scale-in"
        style={{
          background: 'rgba(255, 255, 255, 0.97)',
          borderRadius: 'var(--radio-xl)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Barra superior decorativa */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #27AE60, #D4A843, #C0392B)',
          }}
        />

        <div className="px-8 pt-8 pb-10">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #27AE60, #2ECC71)',
                  boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
                }}
              >
                <Trophy size={32} className="text-white" />
              </div>
            </div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: 'var(--ligapro-navy)' }}
            >
              LIGAPRO <span style={{ color: 'var(--ligapro-gold)' }}>EC</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--texto-secundario)' }}>
              Sistema Integral de Gestión de Competiciones
            </p>
          </div>

          {/* Mensaje de éxito */}
          {mensajeExito && (
            <div
              className="mb-6 p-3 rounded-lg text-sm flex items-start gap-2"
              style={{ background: '#DEF7EC', color: '#03543F' }}
            >
              <Shield size={16} className="mt-0.5 flex-shrink-0" />
              {mensajeExito}
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div
              className="mb-6 p-3 rounded-lg text-sm flex items-start gap-2"
              style={{ background: '#FEE2E2', color: '#991B1B' }}
            >
              <Shield size={16} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Tabs UI */}
          <div className="flex bg-[var(--fondo-principal)] p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setModoRegistro(false); setError(''); setMensajeExito(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                !modoRegistro ? 'bg-white shadow text-[var(--ligapro-navy)]' : 'text-[var(--texto-secundario)] hover:text-[var(--texto-primario)]'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setModoRegistro(true); setError(''); setMensajeExito(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                modoRegistro ? 'bg-white shadow text-[var(--ligapro-navy)]' : 'text-[var(--texto-secundario)] hover:text-[var(--texto-primario)]'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarLoginEmail} className="space-y-4">
            {modoRegistro && (
              <>
                <div>
                  <label htmlFor="nombreCompleto" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nombre Completo</label>
                  <div className="relative">
                    <input id="nombreCompleto" type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} placeholder="Ej. Juan Pérez" required={modoRegistro} className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all" style={{ border: '1.5px solid var(--borde-suave)', background: 'var(--fondo-principal)', color: 'var(--texto-primario)' }} onFocus={(e) => (e.target.style.borderColor = 'var(--ligapro-blue)')} onBlur={(e) => (e.target.style.borderColor = 'var(--borde-suave)')} />
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
                  </div>
                </div>
                <div>
                  <label htmlFor="usuario" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--texto-primario)' }}>Nombre de Usuario</label>
                  <div className="relative">
                    <input id="usuario" type="text" placeholder="Ej. juanperez123" required={modoRegistro} className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all" style={{ border: '1.5px solid var(--borde-suave)', background: 'var(--fondo-principal)', color: 'var(--texto-primario)' }} onFocus={(e) => (e.target.style.borderColor = 'var(--ligapro-blue)')} onBlur={(e) => (e.target.style.borderColor = 'var(--borde-suave)')} />
                    <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--texto-primario)' }}>Correo Electrónico</label>
              <div className="relative">
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all" style={{ border: '1.5px solid var(--borde-suave)', background: 'var(--fondo-principal)', color: 'var(--texto-primario)' }} onFocus={(e) => (e.target.style.borderColor = 'var(--ligapro-blue)')} onBlur={(e) => (e.target.style.borderColor = 'var(--borde-suave)')} />
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
              </div>
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--texto-primario)' }}>Contraseña</label>
              <div className="relative">
                <input id="contrasena" type={mostrarContrasena ? 'text' : 'password'} value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full pl-10 pr-12 py-3 rounded-lg text-sm outline-none transition-all" style={{ border: '1.5px solid var(--borde-suave)', background: 'var(--fondo-principal)', color: 'var(--texto-primario)' }} onFocus={(e) => (e.target.style.borderColor = 'var(--ligapro-blue)')} onBlur={(e) => (e.target.style.borderColor = 'var(--borde-suave)')} />
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--texto-terciario)' }} />
                <button type="button" onClick={() => setMostrarContrasena(!mostrarContrasena)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded" style={{ color: 'var(--texto-terciario)' }} tabIndex={-1}>
                  {mostrarContrasena ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {modoRegistro && <p className="mt-1 text-xs" style={{ color: 'var(--texto-terciario)' }}>Mínimo 6 caracteres.</p>}
            </div>

            <button type="submit" disabled={cargando} className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-lg text-white font-semibold text-sm transition-all" style={{ background: cargando ? '#6B7280' : 'linear-gradient(135deg, #1B2A4A, #243558)', boxShadow: cargando ? 'none' : '0 4px 12px rgba(27, 42, 74, 0.3)', cursor: cargando ? 'not-allowed' : 'pointer' }}>
              {cargando ? <div className="animate-girar" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> : <>{modoRegistro ? 'Registrar Cuenta' : 'Ingresar al Sistema'} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--borde-suave)]" />
            <span className="text-xs font-medium text-[var(--texto-terciario)]">O continúa con</span>
            <div className="flex-1 h-px bg-[var(--borde-suave)]" />
          </div>

          <button onClick={manejarLoginGoogle} disabled={cargando} className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium text-sm transition-all border border-[var(--borde-suave)] text-[var(--texto-primario)] hover:bg-[var(--fondo-principal)] disabled:opacity-50">
            <Globe size={18} style={{ color: '#4285F4' }} />
            Continuar con Google
          </button>
        </div>

        {/* Footer de seguridad */}
        <div
          className="px-8 py-3 text-center border-t"
          style={{
            background: 'var(--fondo-principal)',
            borderColor: 'var(--borde-suave)',
          }}
        >
          <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: 'var(--texto-terciario)' }}>
            <Lock size={12} />
            Conexión segura TLS 1.3 · Contraseñas encriptadas con bcrypt
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaginaLogin() {
  return <LoginContenido />;
}
