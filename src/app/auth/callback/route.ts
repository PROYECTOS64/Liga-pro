import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/servidor';

/**
 * Ruta de callback para OAuth y Magic Links de Supabase.
 * Intercambia el código de autorización por una sesión válida
 * y redirige al usuario a la página solicitada o al dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si no hay código o hay un error, redirigir a login con mensaje de error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
