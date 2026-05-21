import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware/Proxy de autenticación para Next.js.
 * Intercepta todas las peticiones para:
 * 1. Refrescar la sesión de Supabase automáticamente.
 * 2. Redirigir usuarios no autenticados a /login.
 * 3. Redirigir usuarios autenticados fuera de rutas públicas (login, registro).
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Primero actualizar las cookies en la petición entrante
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Crear una nueva respuesta con las cookies actualizadas
          supabaseResponse = NextResponse.next({ request });
          // Propagar las cookies a la respuesta saliente
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No usar supabase.auth.getSession() aquí.
  // getUser() valida el token con el servidor de Supabase,
  // mientras que getSession() solo lee el JWT sin validar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const mockAdmin = request.cookies.get('mock_admin_session')?.value === 'true';
  const mockSessionRole = request.cookies.get('mock_session_role')?.value;
  const mockSessionActive = mockSessionRole !== undefined && mockSessionRole !== '';

  // Rutas públicas que no requieren autenticación
  const rutasPublicas = ['/login', '/registro', '/auth/callback'];
  const esRutaPublica = rutasPublicas.some((ruta) =>
    request.nextUrl.pathname.startsWith(ruta)
  );

  // Redirigir a login si no está autenticado y no es ruta pública
  if (!user && !mockAdmin && !mockSessionActive && !esRutaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirigir al dashboard si ya está autenticado y accede a ruta pública
  if ((user || mockAdmin || mockSessionActive) && esRutaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (ícono del navegador)
     * - Archivos de imagen estáticos (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
