import { createBrowserClient } from '@supabase/ssr';

/**
 * Crea un cliente de Supabase para uso en el navegador (Client Components).
 * Utiliza las variables de entorno públicas para la conexión.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
