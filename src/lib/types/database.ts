// =============================================================================
// TIPOS DE BASE DE DATOS - SIGC LigaPro EC
// Definiciones completas de TypeScript para todas las tablas del sistema.
// =============================================================================

// -----------------------------------------------------------------------------
// Enums del sistema
// -----------------------------------------------------------------------------

/** Estados posibles de un jugador */
export type EstadoJugador = 'ACTIVO' | 'SUSPENDIDO' | 'LESIONADO';

/** Series de competición */
export type Serie = 'A' | 'B';

/** Fases de una competición */
export type FaseCompeticion =
  | 'FASE_UNO'
  | 'FASE_DOS'
  | 'FASE_FINAL'
  | 'CLASIFICACION';

/** Estados posibles de un partido */
export type EstadoPartido =
  | 'PROGRAMADO'
  | 'EN_CURSO'
  | 'FINALIZADO'
  | 'SUSPENDIDO'
  | 'NO_PRESENTACION';

/** Estados posibles de una planilla */
export type EstadoPlanilla = 'BORRADOR' | 'ENVIADA' | 'BLOQUEADA';

/** Tipos de incidencia durante un partido */
export type TipoIncidencia =
  | 'GOL'
  | 'TARJETA_AMARILLA'
  | 'TARJETA_ROJA'
  | 'SUSTITUCION'
  | 'LESION';

/** Tipos de tarjeta disciplinaria */
export type TipoTarjeta = 'AMARILLA' | 'ROJA';

/** Tipos de uniforme */
export type TipoUniforme = 'PRINCIPAL' | 'ALTERNO';

/** Roles de usuario en el sistema */
export type RolUsuario =
  | 'ADMIN'
  | 'DELEGADO_CLUB'
  | 'COMISARIO'
  | 'ARBITRO'
  | 'CONTROL_ECONOMICO';

/** Estados de control económico */
export type EstadoControlEconomico =
  | 'APROBADO'
  | 'PENDIENTE'
  | 'OBSERVADO'
  | 'RECHAZADO';

/** Estados de una competición */
export type EstadoCompeticion =
  | 'PLANIFICADA'
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'CANCELADA';

/** Estados de certificación VAR */
export type EstadoCertificacionVAR =
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'EN_REVISION';

/** Estados de pago de multas */
export type EstadoPagoMulta = 'PENDIENTE' | 'PAGADA' | 'ANULADA';

// -----------------------------------------------------------------------------
// Tablas principales
// -----------------------------------------------------------------------------

/** Club de fútbol registrado en LigaPro */
export interface Club {
  id: string;
  nombre: string;
  abreviatura: string;
  escudo_url: string | null;
  estadio_id: string | null;
  is_filial: boolean;
  estado_control_economico: EstadoControlEconomico;
  serie: Serie;
  descendido_deportivamente: boolean;
  ascendido_serie_a: boolean;
  created_at: string;
  updated_at: string;
}

/** Jugador registrado en un club */
export interface Jugador {
  id: string;
  club_id: string;
  nombre_completo: string;
  cedula: string;
  fecha_nacimiento: string;
  posicion: string;
  dorsal: number | null;
  is_habilitado: boolean;
  foto_url: string | null;
  apodo: string | null;
  apodo_aprobacion_pdf_url: string | null;
  tarjetas_amarillas_acumuladas: number;
  estado: EstadoJugador;
  created_at: string;
  updated_at: string;
}

/** Miembro del cuerpo técnico o médico de un club */
export interface Staff {
  id: string;
  club_id: string;
  nombre_completo: string;
  cedula: string;
  tipo_staff: string;
  is_habilitado: boolean;
  is_director_tecnico: boolean;
  is_medico: boolean;
  created_at: string;
  updated_at: string;
}

/** Competición organizada por LigaPro */
export interface Competicion {
  id: string;
  nombre: string;
  serie: Serie;
  temporada: number;
  fase_actual: FaseCompeticion;
  estado: EstadoCompeticion;
  fecha_inicio: string;
  fecha_fin: string;
  created_at: string;
  updated_at: string;
}

/** Partido programado o jugado dentro de una competición */
export interface Partido {
  id: string;
  competicion_id: string;
  fase: FaseCompeticion;
  jornada: number;
  fecha_hora: string;
  club_local_id: string;
  club_visitante_id: string;
  estadio_id: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: EstadoPartido;
  es_horario_unificado: boolean;
  planilla_bloqueada: boolean;
  created_at: string;
  updated_at: string;
}

/** Registro de la tabla de posiciones para un club en una fase */
export interface TablaPosiciones {
  id: string;
  competicion_id: string;
  fase: FaseCompeticion;
  club_id: string;
  puntos: number;
  partidos_jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  goles_favor: number;
  goles_contra: number;
  saldo_goles: number;
  goles_visitante: number;
  posicion: number;
  created_at: string;
  updated_at: string;
}

/** Planilla oficial de un club para un partido */
export interface Planilla {
  id: string;
  partido_id: string;
  club_id: string;
  estado: EstadoPlanilla;
  fecha_envio: string | null;
  bloqueada_en: string | null;
  firmada_dt: boolean;
  firmada_medico: boolean;
  created_at: string;
  updated_at: string;
}

/** Jugador incluido en una planilla de partido */
export interface PlanillaJugador {
  id: string;
  planilla_id: string;
  jugador_id: string;
  es_titular: boolean;
  dorsal_partido: number;
  created_at: string;
}

/** Staff incluido en una planilla de partido */
export interface PlanillaStaff {
  id: string;
  planilla_id: string;
  staff_id: string;
  created_at: string;
}

/** Evento o incidencia ocurrida durante un partido */
export interface Incidencia {
  id: string;
  partido_id: string;
  tipo: TipoIncidencia;
  minuto: number;
  jugador_id: string;
  club_id: string;
  descripcion: string | null;
  jugador_entra_id: string | null;
  created_at: string;
}

/** Estadio registrado en el sistema */
export interface Estadio {
  id: string;
  nombre: string;
  ciudad: string;
  capacidad: number;
  tipo_cesped: string;
  certificado_fifa_url: string | null;
  certificado_vigencia: string | null;
  is_habilitado: boolean;
  created_at: string;
  updated_at: string;
}

/** Checklist de inspección de estadio previo a un partido */
export interface ChecklistEstadio {
  id: string;
  partido_id: string;
  estadio_id: string;
  comisario_id: string;
  altura_cesped_mm: number | null;
  estado_marcacion: string | null;
  pasabolas_registrados: number | null;
  fecha_inspeccion: string;
  created_at: string;
  updated_at: string;
}

/** Certificación de infraestructura VAR para un estadio */
export interface CertificacionVAR {
  id: string;
  estadio_id: string;
  velocidad_internet_mbps: number | null;
  voltaje_electrico: number | null;
  altura_andamios_m: number | null;
  firma_arbitraje: boolean;
  firma_escenarios: boolean;
  firma_derechos_tv: boolean;
  firma_proveedor_var: boolean;
  estado: EstadoCertificacionVAR;
  fecha_certificacion: string | null;
  created_at: string;
  updated_at: string;
}

/** Tarjeta disciplinaria mostrada en un partido */
export interface Tarjeta {
  id: string;
  partido_id: string;
  jugador_id: string;
  tipo: TipoTarjeta;
  minuto: number;
  fase_competicion: FaseCompeticion;
  created_at: string;
}

/** Suspensión aplicada a un jugador */
export interface Suspension {
  id: string;
  jugador_id: string;
  motivo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  partidos_restantes: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

/** Multa económica impuesta a un club */
export interface Multa {
  id: string;
  club_id: string;
  partido_id: string | null;
  concepto: string;
  monto_usd: number;
  estado_pago: EstadoPagoMulta;
  fecha_generacion: string;
  es_reincidencia: boolean;
  contador_reincidencia: number;
  created_at: string;
  updated_at: string;
}

/** Pasabolas registrado para un partido */
export interface Pasabola {
  id: string;
  partido_id: string;
  club_id: string;
  nombre_completo: string;
  cedula: string;
  fecha_nacimiento: string;
  edad_calculada: number;
  created_at: string;
}

/** Uniforme registrado y aprobado para un club */
export interface Uniforme {
  id: string;
  club_id: string;
  temporada: number;
  tipo: TipoUniforme;
  color_principal: string;
  color_secundario: string | null;
  imagen_url: string | null;
  is_aprobado: boolean;
  created_at: string;
  updated_at: string;
}

/** Perfil de usuario del sistema con rol y permisos */
export interface Perfil {
  id: string;
  user_id: string;
  nombre_completo: string;
  rol: RolUsuario;
  club_id: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Registro de auditoría para trazabilidad de cambios */
export interface AuditLog {
  id: string;
  usuario_id: string;
  accion: string;
  tabla_afectada: string;
  registro_id: string;
  valores_anteriores: Record<string, unknown> | null;
  valores_nuevos: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Tipo agrupador de la base de datos
// -----------------------------------------------------------------------------

/**
 * Tipo principal que agrupa todas las tablas del sistema SIGC LigaPro.
 * Cada clave corresponde al nombre de la tabla en Supabase.
 */
export interface Database {
  public: {
    Tables: {
      clubes: {
        Row: Club;
        Insert: Omit<Club, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Club, 'id' | 'created_at' | 'updated_at'>>;
      };
      jugadores: {
        Row: Jugador;
        Insert: Omit<Jugador, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Jugador, 'id' | 'created_at' | 'updated_at'>>;
      };
      staff: {
        Row: Staff;
        Insert: Omit<Staff, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>;
      };
      competiciones: {
        Row: Competicion;
        Insert: Omit<Competicion, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Competicion, 'id' | 'created_at' | 'updated_at'>>;
      };
      partidos: {
        Row: Partido;
        Insert: Omit<Partido, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Partido, 'id' | 'created_at' | 'updated_at'>>;
      };
      tabla_posiciones: {
        Row: TablaPosiciones;
        Insert: Omit<TablaPosiciones, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TablaPosiciones, 'id' | 'created_at' | 'updated_at'>>;
      };
      planillas: {
        Row: Planilla;
        Insert: Omit<Planilla, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Planilla, 'id' | 'created_at' | 'updated_at'>>;
      };
      planilla_jugadores: {
        Row: PlanillaJugador;
        Insert: Omit<PlanillaJugador, 'id' | 'created_at'>;
        Update: Partial<Omit<PlanillaJugador, 'id' | 'created_at'>>;
      };
      planilla_staff: {
        Row: PlanillaStaff;
        Insert: Omit<PlanillaStaff, 'id' | 'created_at'>;
        Update: Partial<Omit<PlanillaStaff, 'id' | 'created_at'>>;
      };
      incidencias: {
        Row: Incidencia;
        Insert: Omit<Incidencia, 'id' | 'created_at'>;
        Update: Partial<Omit<Incidencia, 'id' | 'created_at'>>;
      };
      estadios: {
        Row: Estadio;
        Insert: Omit<Estadio, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Estadio, 'id' | 'created_at' | 'updated_at'>>;
      };
      checklist_estadios: {
        Row: ChecklistEstadio;
        Insert: Omit<ChecklistEstadio, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ChecklistEstadio, 'id' | 'created_at' | 'updated_at'>>;
      };
      certificaciones_var: {
        Row: CertificacionVAR;
        Insert: Omit<CertificacionVAR, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CertificacionVAR, 'id' | 'created_at' | 'updated_at'>>;
      };
      tarjetas: {
        Row: Tarjeta;
        Insert: Omit<Tarjeta, 'id' | 'created_at'>;
        Update: Partial<Omit<Tarjeta, 'id' | 'created_at'>>;
      };
      suspensiones: {
        Row: Suspension;
        Insert: Omit<Suspension, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Suspension, 'id' | 'created_at' | 'updated_at'>>;
      };
      multas: {
        Row: Multa;
        Insert: Omit<Multa, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Multa, 'id' | 'created_at' | 'updated_at'>>;
      };
      pasabolas: {
        Row: Pasabola;
        Insert: Omit<Pasabola, 'id' | 'created_at'>;
        Update: Partial<Omit<Pasabola, 'id' | 'created_at'>>;
      };
      uniformes: {
        Row: Uniforme;
        Insert: Omit<Uniforme, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Uniforme, 'id' | 'created_at' | 'updated_at'>>;
      };
      perfiles: {
        Row: Perfil;
        Insert: Omit<Perfil, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Perfil, 'id' | 'created_at' | 'updated_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      estado_jugador: EstadoJugador;
      serie: Serie;
      fase_competicion: FaseCompeticion;
      estado_partido: EstadoPartido;
      estado_planilla: EstadoPlanilla;
      tipo_incidencia: TipoIncidencia;
      tipo_tarjeta: TipoTarjeta;
      tipo_uniforme: TipoUniforme;
      rol_usuario: RolUsuario;
      estado_control_economico: EstadoControlEconomico;
      estado_competicion: EstadoCompeticion;
      estado_certificacion_var: EstadoCertificacionVAR;
      estado_pago_multa: EstadoPagoMulta;
    };
  };
}

// -----------------------------------------------------------------------------
// Tipos utilitarios para facilitar el uso con Supabase Client
// -----------------------------------------------------------------------------

/** Extrae el tipo Row de una tabla dada */
export type TablaRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Extrae el tipo Insert de una tabla dada */
export type TablaInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Extrae el tipo Update de una tabla dada */
export type TablaUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
