import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Crea un cliente de Supabase para uso en el servidor (Server Components, Route Handlers, Server Actions).
 * Gestiona las cookies automáticamente para mantener la sesión del usuario.
 */
export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // En Server Components las cookies son de solo lectura.
            // Este bloque catch es necesario para evitar errores
            // cuando se llama desde un Server Component.
          }
        },
      },
    }
  );
}
