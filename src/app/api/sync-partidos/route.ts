import { NextResponse } from 'next/server';
import { sincronizarPartidos } from '@/lib/servicios/apiFutbol';

// Forzamos a que esta ruta sea siempre dinámica y no se cachee
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Verificación básica de seguridad (Opcional pero recomendada para Cron Jobs)
    // Extraemos un "secret" de los headers o query params para asegurar que solo
    // el Cron Job pueda lanzar esta sincronización.
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret') || request.headers.get('Authorization')?.replace('Bearer ', '');

    // Comentar o ajustar esto dependiendo de si tienes un CRON_SECRET configurado
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Ejecutar el servicio de sincronización
    const resultado = await sincronizarPartidos();

    if (!resultado.exito) {
      return NextResponse.json(
        { error: 'Falló la sincronización', detalle: resultado.error },
        { status: 500 }
      );
    }

    // 3. Responder con éxito
    return NextResponse.json({
      success: true,
      mensaje: resultado.mensaje,
      cantidad: resultado.cantidad,
      fecha_sincronizacion: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    );
  }
}
