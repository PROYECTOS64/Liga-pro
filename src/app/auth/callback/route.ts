import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/servidor';

/**
 * Ruta de callback para OAuth y Magic Links de Supabase.
 * Intercambia el código de autorización por una sesión válida,
 * establece la cookie de sesión para el proxy, y redirige al dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await crearClienteServidor();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Establecer la cookie de sesión que el proxy necesita para validar acceso
      const nombre = data.user.user_metadata?.full_name ||
                     data.user.user_metadata?.nombre_completo ||
                     data.user.email?.split('@')[0] ||
                     'Usuario';

      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.set('mock_session_role', 'usuario', {
        path: '/',
        maxAge: 86400,
        httpOnly: false,
        sameSite: 'lax',
      });
      response.cookies.set('mock_session_name', encodeURIComponent(nombre), {
        path: '/',
        maxAge: 86400,
        httpOnly: false,
        sameSite: 'lax',
      });
      return response;
    }
  }

  // Si no hay código o hay un error, redirigir a login con mensaje de error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
