-- ============================================
-- SIGC-LigaPro EC - Script de Migración SQL
-- Base de Datos: Supabase (PostgreSQL)
-- ============================================
-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase
-- Las contraseñas son manejadas por Supabase Auth (bcrypt, factor 10+)
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TIPOS ENUMERADOS
-- ============================================

CREATE TYPE estado_control_economico AS ENUM ('APROBADO', 'RECHAZADO', 'SUSPENDIDO', 'EN_REVISION');
CREATE TYPE serie_tipo AS ENUM ('A', 'B');
CREATE TYPE fase_competicion AS ENUM ('FASE_UNO', 'FASE_DOS', 'FASE_FINAL', 'CLASIFICACION');
CREATE TYPE estado_competicion AS ENUM ('PLANIFICADA', 'EN_CURSO', 'FINALIZADA', 'SUSPENDIDA');
CREATE TYPE estado_partido AS ENUM ('PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'SUSPENDIDO', 'NO_PRESENTACION', 'REPROGRAMADO');
CREATE TYPE estado_planilla AS ENUM ('BORRADOR', 'ENVIADA', 'BLOQUEADA');
CREATE TYPE tipo_incidencia AS ENUM ('GOL', 'TARJETA_AMARILLA', 'TARJETA_ROJA', 'SUSTITUCION', 'LESION', 'PENAL', 'AUTOGOL');
CREATE TYPE tipo_tarjeta AS ENUM ('AMARILLA', 'ROJA');
CREATE TYPE tipo_cesped AS ENUM ('NATURAL', 'SINTETICO', 'HIBRIDO');
CREATE TYPE tipo_uniforme AS ENUM ('PRINCIPAL', 'ALTERNO');
CREATE TYPE estado_pago AS ENUM ('PENDIENTE', 'COBRADO', 'EN_PROCESO', 'ANULADO');
CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'DELEGADO_CLUB', 'COMISARIO', 'ARBITRO', 'CONTROL_ECONOMICO');
CREATE TYPE tipo_staff AS ENUM ('DIRECTOR_TECNICO', 'ASISTENTE_TECNICO', 'PREPARADOR_FISICO', 'MEDICO', 'KINESIOLOGO', 'AUXILIAR', 'UTILERO', 'OTRO');
CREATE TYPE posicion_jugador AS ENUM ('PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO');
CREATE TYPE estado_jugador AS ENUM ('ACTIVO', 'SUSPENDIDO', 'LESIONADO', 'TRANSFERIDO', 'RETIRADO');

-- ============================================
-- TABLA: estadios
-- ============================================
CREATE TABLE estadios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  direccion TEXT,
  capacidad INTEGER DEFAULT 0,
  tipo_cesped tipo_cesped NOT NULL DEFAULT 'NATURAL',
  certificado_fifa_url TEXT,
  certificado_vigencia DATE,
  is_habilitado BOOLEAN DEFAULT TRUE,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: clubes
-- ============================================
CREATE TABLE clubes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  nombre_corto VARCHAR(50),
  abreviatura VARCHAR(5) NOT NULL,
  escudo_url TEXT,
  estadio_id UUID REFERENCES estadios(id),
  ciudad VARCHAR(100),
  fundacion DATE,
  is_filial BOOLEAN DEFAULT FALSE,
  club_matriz_id UUID REFERENCES clubes(id),
  estado_control_economico estado_control_economico DEFAULT 'EN_REVISION',
  serie serie_tipo DEFAULT 'A',
  descendido_deportivamente BOOLEAN DEFAULT FALSE,
  ascendido_serie_a BOOLEAN DEFAULT FALSE,
  descendido_segunda_categoria BOOLEAN DEFAULT FALSE,
  color_principal VARCHAR(7),
  color_secundario VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: jugadores
-- ============================================
CREATE TABLE jugadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubes(id) ON DELETE SET NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  cedula VARCHAR(20) UNIQUE,
  pasaporte VARCHAR(30),
  fecha_nacimiento DATE NOT NULL,
  nacionalidad VARCHAR(50) DEFAULT 'Ecuatoriana',
  posicion posicion_jugador NOT NULL,
  dorsal INTEGER CHECK (dorsal >= 1 AND dorsal <= 99),
  estado estado_jugador DEFAULT 'ACTIVO',
  is_habilitado BOOLEAN DEFAULT FALSE,
  foto_url TEXT,
  apodo VARCHAR(50),
  apodo_aprobacion_pdf_url TEXT,
  tarjetas_amarillas_acumuladas INTEGER DEFAULT 0,
  peso_kg DECIMAL(5, 2),
  altura_cm DECIMAL(5, 2),
  pie_dominante VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restricción: dorsales no pueden comenzar con 0 (ej: "01", "07")
-- Esto se maneja a nivel de aplicación ya que dorsal es INTEGER

-- ============================================
-- TABLA: staff
-- ============================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubes(id) ON DELETE SET NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  cedula VARCHAR(20) UNIQUE,
  tipo_staff tipo_staff NOT NULL,
  is_habilitado BOOLEAN DEFAULT FALSE,
  is_director_tecnico BOOLEAN DEFAULT FALSE,
  is_medico BOOLEAN DEFAULT FALSE,
  licencia_url TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: competiciones
-- ============================================
CREATE TABLE competiciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  serie serie_tipo NOT NULL,
  temporada INTEGER NOT NULL,
  fase_actual fase_competicion DEFAULT 'FASE_UNO',
  estado estado_competicion DEFAULT 'PLANIFICADA',
  fecha_inicio DATE,
  fecha_fin DATE,
  num_equipos INTEGER NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: partidos
-- ============================================
CREATE TABLE partidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competicion_id UUID REFERENCES competiciones(id) ON DELETE CASCADE,
  fase fase_competicion NOT NULL,
  jornada INTEGER NOT NULL,
  fecha_hora TIMESTAMPTZ NOT NULL,
  club_local_id UUID REFERENCES clubes(id) NOT NULL,
  club_visitante_id UUID REFERENCES clubes(id) NOT NULL,
  estadio_id UUID REFERENCES estadios(id),
  goles_local INTEGER DEFAULT 0,
  goles_visitante INTEGER DEFAULT 0,
  estado estado_partido DEFAULT 'PROGRAMADO',
  es_horario_unificado BOOLEAN DEFAULT FALSE,
  planilla_bloqueada BOOLEAN DEFAULT FALSE,
  minuto_suspension INTEGER,
  motivo_suspension TEXT,
  arbitro_principal VARCHAR(200),
  arbitro_asistente_1 VARCHAR(200),
  arbitro_asistente_2 VARCHAR(200),
  cuarto_arbitro VARCHAR(200),
  comisario_juego VARCHAR(200),
  oficial_var VARCHAR(200),
  parada_hidratacion_requerida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT partidos_diferentes CHECK (club_local_id != club_visitante_id)
);

-- ============================================
-- TABLA: tabla_posiciones
-- ============================================
CREATE TABLE tabla_posiciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competicion_id UUID REFERENCES competiciones(id) ON DELETE CASCADE,
  fase fase_competicion NOT NULL,
  club_id UUID REFERENCES clubes(id) NOT NULL,
  puntos INTEGER DEFAULT 0,
  partidos_jugados INTEGER DEFAULT 0,
  ganados INTEGER DEFAULT 0,
  empatados INTEGER DEFAULT 0,
  perdidos INTEGER DEFAULT 0,
  goles_favor INTEGER DEFAULT 0,
  goles_contra INTEGER DEFAULT 0,
  saldo_goles INTEGER DEFAULT 0,
  goles_visitante INTEGER DEFAULT 0,
  posicion INTEGER DEFAULT 0,
  clasificado_fase_final BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competicion_id, fase, club_id)
);

-- ============================================
-- TABLA: planillas
-- ============================================
CREATE TABLE planillas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubes(id) NOT NULL,
  estado estado_planilla DEFAULT 'BORRADOR',
  fecha_envio TIMESTAMPTZ,
  bloqueada_en TIMESTAMPTZ,
  firmada_dt BOOLEAN DEFAULT FALSE,
  firmada_medico BOOLEAN DEFAULT FALSE,
  firma_dt_nombre VARCHAR(200),
  firma_medico_nombre VARCHAR(200),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: planilla_jugadores
-- ============================================
CREATE TABLE planilla_jugadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planilla_id UUID REFERENCES planillas(id) ON DELETE CASCADE,
  jugador_id UUID REFERENCES jugadores(id) NOT NULL,
  es_titular BOOLEAN DEFAULT FALSE,
  dorsal_partido INTEGER CHECK (dorsal_partido >= 1 AND dorsal_partido <= 99),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: planilla_staff
-- ============================================
CREATE TABLE planilla_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planilla_id UUID REFERENCES planillas(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: incidencias
-- ============================================
CREATE TABLE incidencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  tipo tipo_incidencia NOT NULL,
  minuto INTEGER NOT NULL CHECK (minuto >= 0 AND minuto <= 150),
  jugador_id UUID REFERENCES jugadores(id),
  club_id UUID REFERENCES clubes(id) NOT NULL,
  descripcion TEXT,
  jugador_entra_id UUID REFERENCES jugadores(id),
  periodo VARCHAR(20) DEFAULT 'PRIMER_TIEMPO',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: tarjetas (vista simplificada de incidencias disciplinarias)
-- ============================================
CREATE TABLE tarjetas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id UUID REFERENCES jugadores(id) NOT NULL,
  club_id UUID REFERENCES clubes(id) NOT NULL,
  tipo tipo_tarjeta NOT NULL,
  minuto INTEGER NOT NULL,
  fase_competicion fase_competicion NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: suspensiones
-- ============================================
CREATE TABLE suspensiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jugador_id UUID REFERENCES jugadores(id) ON DELETE CASCADE,
  motivo TEXT NOT NULL,
  tipo_tarjeta_origen tipo_tarjeta,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  partidos_restantes INTEGER DEFAULT 1,
  activa BOOLEAN DEFAULT TRUE,
  partido_origen_id UUID REFERENCES partidos(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: multas
-- ============================================
CREATE TABLE multas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubes(id) ON DELETE CASCADE,
  partido_id UUID REFERENCES partidos(id),
  concepto TEXT NOT NULL,
  monto_usd DECIMAL(10, 2) NOT NULL,
  estado_pago estado_pago DEFAULT 'PENDIENTE',
  fecha_generacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_cobro TIMESTAMPTZ,
  es_reincidencia BOOLEAN DEFAULT FALSE,
  contador_reincidencia INTEGER DEFAULT 0,
  serie serie_tipo NOT NULL,
  deducido_audiovisuales BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: uniformes
-- ============================================
CREATE TABLE uniformes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubes(id) ON DELETE CASCADE,
  temporada INTEGER NOT NULL,
  tipo tipo_uniforme NOT NULL,
  color_principal VARCHAR(7) NOT NULL,
  color_secundario VARCHAR(7),
  color_pantalon VARCHAR(7),
  color_medias VARCHAR(7),
  imagen_url TEXT,
  is_aprobado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: checklist_estadio
-- ============================================
CREATE TABLE checklist_estadio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  estadio_id UUID REFERENCES estadios(id) NOT NULL,
  comisario_id UUID,
  altura_cesped_mm DECIMAL(5, 1),
  estado_marcacion VARCHAR(50),
  estado_riego VARCHAR(50),
  estado_drenaje VARCHAR(50),
  iluminacion_ok BOOLEAN DEFAULT FALSE,
  camerinos_ok BOOLEAN DEFAULT FALSE,
  zona_calentamiento_ok BOOLEAN DEFAULT FALSE,
  ambulancia_ok BOOLEAN DEFAULT FALSE,
  seguridad_ok BOOLEAN DEFAULT FALSE,
  pasabolas_registrados INTEGER DEFAULT 0,
  balones_oficiales INTEGER DEFAULT 12,
  observaciones TEXT,
  firma_comisario BOOLEAN DEFAULT FALSE,
  firma_delegado_local BOOLEAN DEFAULT FALSE,
  firma_delegado_visitante BOOLEAN DEFAULT FALSE,
  fecha_inspeccion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: pasabolas
-- ============================================
CREATE TABLE pasabolas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubes(id) NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  cedula VARCHAR(20) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  edad_calculada INTEGER,
  posicion_asignada VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: certificacion_var
-- ============================================
CREATE TABLE certificacion_var (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estadio_id UUID REFERENCES estadios(id) ON DELETE CASCADE,
  velocidad_internet_mbps DECIMAL(10, 2),
  voltaje_electrico INTEGER DEFAULT 220,
  altura_andamios_m DECIMAL(5, 2),
  altura_camara_linea_gol_m DECIMAL(5, 2),
  firma_arbitraje BOOLEAN DEFAULT FALSE,
  firma_arbitraje_nombre VARCHAR(200),
  firma_arbitraje_fecha TIMESTAMPTZ,
  firma_escenarios BOOLEAN DEFAULT FALSE,
  firma_escenarios_nombre VARCHAR(200),
  firma_escenarios_fecha TIMESTAMPTZ,
  firma_derechos_tv BOOLEAN DEFAULT FALSE,
  firma_derechos_tv_nombre VARCHAR(200),
  firma_derechos_tv_fecha TIMESTAMPTZ,
  firma_proveedor_var BOOLEAN DEFAULT FALSE,
  firma_proveedor_var_nombre VARCHAR(200),
  firma_proveedor_var_fecha TIMESTAMPTZ,
  estado VARCHAR(50) DEFAULT 'PENDIENTE',
  fecha_certificacion TIMESTAMPTZ,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: jornadas_fifa
-- ============================================
CREATE TABLE jornadas_fifa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  temporada INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: perfiles (vinculado a auth.users de Supabase)
-- ============================================
CREATE TABLE perfiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nombre_completo VARCHAR(200) NOT NULL,
  rol rol_usuario NOT NULL DEFAULT 'DELEGADO_CLUB',
  club_id UUID REFERENCES clubes(id),
  is_active BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  telefono VARCHAR(20),
  cargo VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: audit_logs (INMUTABLE - solo INSERT)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES auth.users(id),
  accion VARCHAR(100) NOT NULL,
  tabla_afectada VARCHAR(100) NOT NULL,
  registro_id UUID,
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevenir UPDATE y DELETE en audit_logs
CREATE OR REPLACE FUNCTION proteger_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Los registros de auditoría son inmutables. No se permite UPDATE ni DELETE.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_proteger_audit_logs_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION proteger_audit_logs();

CREATE TRIGGER trigger_proteger_audit_logs_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION proteger_audit_logs();

-- ============================================
-- FUNCIONES: Cálculo automático de saldo de goles
-- ============================================
CREATE OR REPLACE FUNCTION calcular_saldo_goles()
RETURNS TRIGGER AS $$
BEGIN
  NEW.saldo_goles := NEW.goles_favor - NEW.goles_contra;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_saldo_goles
BEFORE INSERT OR UPDATE ON tabla_posiciones
FOR EACH ROW
EXECUTE FUNCTION calcular_saldo_goles();

-- ============================================
-- FUNCIONES: Calcular edad de pasabolas
-- ============================================
CREATE OR REPLACE FUNCTION calcular_edad_pasabola()
RETURNS TRIGGER AS $$
BEGIN
  NEW.edad_calculada := EXTRACT(YEAR FROM AGE(CURRENT_DATE, NEW.fecha_nacimiento));
  
  IF NEW.edad_calculada < 14 OR NEW.edad_calculada > 17 THEN
    RAISE EXCEPTION 'La edad del pasabola debe estar entre 14 y 17 años. Edad calculada: %', NEW.edad_calculada;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_edad_pasabola
BEFORE INSERT OR UPDATE ON pasabolas
FOR EACH ROW
EXECUTE FUNCTION calcular_edad_pasabola();

-- ============================================
-- FUNCIONES: Updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at a todas las tablas relevantes
DO $$
DECLARE
  tabla TEXT;
BEGIN
  FOR tabla IN SELECT unnest(ARRAY[
    'clubes', 'jugadores', 'staff', 'competiciones', 'partidos',
    'tabla_posiciones', 'planillas', 'suspensiones', 'multas',
    'uniformes', 'checklist_estadio', 'certificacion_var',
    'perfiles', 'estadios'
  ]) LOOP
    EXECUTE format(
      'CREATE TRIGGER trigger_updated_at_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at()',
      tabla, tabla
    );
  END LOOP;
END;
$$;

-- ============================================
-- FUNCIÓN: Suspensión automática por 5 amarillas
-- ============================================
CREATE OR REPLACE FUNCTION verificar_acumulacion_amarillas()
RETURNS TRIGGER AS $$
DECLARE
  total_amarillas INTEGER;
BEGIN
  IF NEW.tipo = 'AMARILLA' THEN
    SELECT COUNT(*) INTO total_amarillas
    FROM tarjetas
    WHERE jugador_id = NEW.jugador_id
      AND tipo = 'AMARILLA'
      AND fase_competicion = NEW.fase_competicion;
    
    -- Sumar la tarjeta actual
    total_amarillas := total_amarillas + 1;
    
    -- Actualizar acumuladas en el jugador
    UPDATE jugadores
    SET tarjetas_amarillas_acumuladas = total_amarillas
    WHERE id = NEW.jugador_id;
    
    -- Suspender automáticamente si llega a 5
    IF total_amarillas >= 5 THEN
      UPDATE jugadores
      SET estado = 'SUSPENDIDO'
      WHERE id = NEW.jugador_id;
      
      INSERT INTO suspensiones (jugador_id, motivo, tipo_tarjeta_origen, fecha_inicio, partidos_restantes, activa, partido_origen_id)
      VALUES (NEW.jugador_id, 'Acumulación de 5 tarjetas amarillas', 'AMARILLA', CURRENT_DATE, 1, TRUE, NEW.partido_id);
    END IF;
  END IF;
  
  -- Suspensión inmediata por roja
  IF NEW.tipo = 'ROJA' THEN
    UPDATE jugadores
    SET estado = 'SUSPENDIDO'
    WHERE id = NEW.jugador_id;
    
    INSERT INTO suspensiones (jugador_id, motivo, tipo_tarjeta_origen, fecha_inicio, partidos_restantes, activa, partido_origen_id)
    VALUES (NEW.jugador_id, 'Tarjeta roja directa', 'ROJA', CURRENT_DATE, 1, TRUE, NEW.partido_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_amarillas
AFTER INSERT ON tarjetas
FOR EACH ROW
EXECUTE FUNCTION verificar_acumulacion_amarillas();

-- ============================================
-- FUNCIÓN: Cálculo automático de multas por tarjetas
-- ============================================
CREATE OR REPLACE FUNCTION calcular_multa_tarjeta()
RETURNS TRIGGER AS $$
DECLARE
  serie_club serie_tipo;
  monto_multa DECIMAL(10, 2);
BEGIN
  -- Obtener la serie del club
  SELECT serie INTO serie_club FROM clubes WHERE id = NEW.club_id;
  
  IF NEW.tipo = 'AMARILLA' THEN
    monto_multa := CASE WHEN serie_club = 'A' THEN 20.00 ELSE 10.00 END;
  ELSE -- ROJA
    monto_multa := CASE WHEN serie_club = 'A' THEN 100.00 ELSE 50.00 END;
  END IF;
  
  INSERT INTO multas (club_id, partido_id, concepto, monto_usd, serie)
  VALUES (
    NEW.club_id,
    NEW.partido_id,
    'Multa por tarjeta ' || LOWER(NEW.tipo::TEXT) || ' - Jugador ID: ' || NEW.jugador_id,
    monto_multa,
    serie_club
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_multa_tarjeta
AFTER INSERT ON tarjetas
FOR EACH ROW
EXECUTE FUNCTION calcular_multa_tarjeta();

-- ============================================
-- ÍNDICES para rendimiento
-- ============================================
CREATE INDEX idx_jugadores_club ON jugadores(club_id);
CREATE INDEX idx_jugadores_estado ON jugadores(estado);
CREATE INDEX idx_partidos_competicion ON partidos(competicion_id);
CREATE INDEX idx_partidos_fecha ON partidos(fecha_hora);
CREATE INDEX idx_partidos_estado ON partidos(estado);
CREATE INDEX idx_tabla_posiciones_competicion_fase ON tabla_posiciones(competicion_id, fase);
CREATE INDEX idx_tarjetas_jugador ON tarjetas(jugador_id);
CREATE INDEX idx_tarjetas_partido ON tarjetas(partido_id);
CREATE INDEX idx_multas_club ON multas(club_id);
CREATE INDEX idx_multas_estado ON multas(estado_pago);
CREATE INDEX idx_planillas_partido ON planillas(partido_id);
CREATE INDEX idx_incidencias_partido ON incidencias(partido_id);
CREATE INDEX idx_perfiles_user ON perfiles(user_id);
CREATE INDEX idx_audit_logs_usuario ON audit_logs(usuario_id);
CREATE INDEX idx_audit_logs_tabla ON audit_logs(tabla_afectada);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clubes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE competiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabla_posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE planillas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planilla_jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE planilla_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarjetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspensiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE multas ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniformes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estadios ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_estadio ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificacion_var ENABLE ROW LEVEL SECURITY;
ALTER TABLE pasabolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornadas_fifa ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para datos de competición
CREATE POLICY "Lectura pública de clubes" ON clubes FOR SELECT USING (true);
CREATE POLICY "Lectura pública de jugadores" ON jugadores FOR SELECT USING (true);
CREATE POLICY "Lectura pública de staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Lectura pública de competiciones" ON competiciones FOR SELECT USING (true);
CREATE POLICY "Lectura pública de partidos" ON partidos FOR SELECT USING (true);
CREATE POLICY "Lectura pública de tabla_posiciones" ON tabla_posiciones FOR SELECT USING (true);
CREATE POLICY "Lectura pública de estadios" ON estadios FOR SELECT USING (true);
CREATE POLICY "Lectura pública de planillas" ON planillas FOR SELECT USING (true);
CREATE POLICY "Lectura pública de planilla_jugadores" ON planilla_jugadores FOR SELECT USING (true);
CREATE POLICY "Lectura pública de planilla_staff" ON planilla_staff FOR SELECT USING (true);
CREATE POLICY "Lectura pública de incidencias" ON incidencias FOR SELECT USING (true);
CREATE POLICY "Lectura pública de tarjetas" ON tarjetas FOR SELECT USING (true);
CREATE POLICY "Lectura pública de suspensiones" ON suspensiones FOR SELECT USING (true);
CREATE POLICY "Lectura pública de multas" ON multas FOR SELECT USING (true);
CREATE POLICY "Lectura pública de uniformes" ON uniformes FOR SELECT USING (true);
CREATE POLICY "Lectura pública de checklist_estadio" ON checklist_estadio FOR SELECT USING (true);
CREATE POLICY "Lectura pública de certificacion_var" ON certificacion_var FOR SELECT USING (true);
CREATE POLICY "Lectura pública de pasabolas" ON pasabolas FOR SELECT USING (true);
CREATE POLICY "Lectura pública de jornadas_fifa" ON jornadas_fifa FOR SELECT USING (true);

-- Políticas de perfil
CREATE POLICY "Lectura pública de perfiles" ON perfiles FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden actualizar su perfil" ON perfiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar su perfil" ON perfiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de audit_logs (solo lectura para usuarios autenticados)
CREATE POLICY "Solo lectura autenticada de audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inserción de audit_logs autenticada" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas de escritura para usuarios autenticados
CREATE POLICY "Escritura autenticada clubes" ON clubes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada jugadores" ON jugadores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada staff" ON staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada competiciones" ON competiciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada partidos" ON partidos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada tabla_posiciones" ON tabla_posiciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada planillas" ON planillas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada planilla_jugadores" ON planilla_jugadores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada planilla_staff" ON planilla_staff FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada incidencias" ON incidencias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada tarjetas" ON tarjetas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada suspensiones" ON suspensiones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada multas" ON multas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada uniformes" ON uniformes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada estadios" ON estadios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada checklist_estadio" ON checklist_estadio FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada certificacion_var" ON certificacion_var FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada pasabolas" ON pasabolas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escritura autenticada jornadas_fifa" ON jornadas_fifa FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCIÓN: Crear perfil automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION crear_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (user_id, nombre_completo, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    'DELEGADO_CLUB'::public.rol_usuario
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_crear_perfil
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION crear_perfil_usuario();

-- ============================================
-- DATOS SEMILLA: Estadios del Ecuador
-- ============================================
INSERT INTO estadios (nombre, ciudad, capacidad, tipo_cesped) VALUES
  ('Estadio Monumental Banco Pichincha', 'Guayaquil', 57267, 'NATURAL'),
  ('Estadio Rodrigo Paz Delgado', 'Quito', 41575, 'NATURAL'),
  ('Estadio George Capwell', 'Guayaquil', 40000, 'NATURAL'),
  ('Estadio Olímpico Atahualpa', 'Quito', 35724, 'NATURAL'),
  ('Estadio Rumiñahui', 'Sangolquí', 22000, 'NATURAL'),
  ('Estadio Gonzalo Pozo Ripalda', 'Quito', 25000, 'NATURAL'),
  ('Estadio Alejandro Serrano Aguilar', 'Cuenca', 25000, 'NATURAL'),
  ('Estadio Bellavista', 'Ambato', 18000, 'NATURAL'),
  ('Estadio Jocay', 'Manta', 18000, 'NATURAL'),
  ('Estadio Chucho Benítez', 'Guayaquil', 22000, 'NATURAL'),
  ('Estadio de Liga de Portoviejo', 'Portoviejo', 15000, 'NATURAL'),
  ('Estadio Los Chirijos', 'Milagro', 12000, 'NATURAL'),
  ('Estadio Municipal de Cumbayá', 'Cumbayá', 4000, 'SINTETICO'),
  ('Estadio Reina del Cisne', 'Loja', 15000, 'NATURAL'),
  ('Estadio La Cocha', 'Latacunga', 14000, 'NATURAL'),
  ('Estadio Nueve de Mayo', 'Machala', 22000, 'NATURAL');

-- ============================================
-- DATOS SEMILLA: Clubes Serie A
-- ============================================
INSERT INTO clubes (nombre, nombre_corto, abreviatura, ciudad, serie, estado_control_economico, color_principal, color_secundario, estadio_id) VALUES
  ('Barcelona Sporting Club', 'Barcelona SC', 'BSC', 'Guayaquil', 'A', 'APROBADO', '#FFD700', '#000000',
    (SELECT id FROM estadios WHERE nombre LIKE '%Monumental%')),
  ('Liga Deportiva Universitaria', 'LDU Quito', 'LDU', 'Quito', 'A', 'APROBADO', '#FFFFFF', '#0000FF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Rodrigo Paz%')),
  ('Club Sport Emelec', 'Emelec', 'CSE', 'Guayaquil', 'A', 'APROBADO', '#0000FF', '#808080',
    (SELECT id FROM estadios WHERE nombre LIKE '%George Capwell%')),
  ('Independiente del Valle', 'IDV', 'IDV', 'Sangolquí', 'A', 'APROBADO', '#FF0000', '#000000',
    (SELECT id FROM estadios WHERE nombre LIKE '%Rumiñahui%')),
  ('Deportivo Cuenca', 'Dep. Cuenca', 'DCU', 'Cuenca', 'A', 'APROBADO', '#FF0000', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Alejandro Serrano%')),
  ('Sociedad Deportiva Aucas', 'Aucas', 'SDA', 'Quito', 'A', 'APROBADO', '#FF8C00', '#000000',
    (SELECT id FROM estadios WHERE nombre LIKE '%Gonzalo Pozo%')),
  ('Club Deportivo El Nacional', 'El Nacional', 'CDN', 'Quito', 'A', 'EN_REVISION', '#FF0000', '#0000FF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Atahualpa%')),
  ('Mushuc Runa SC', 'Mushuc Runa', 'MRS', 'Ambato', 'A', 'APROBADO', '#008000', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Bellavista%')),
  ('Delfín SC', 'Delfín', 'DFC', 'Manta', 'A', 'APROBADO', '#0000FF', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Jocay%')),
  ('Club Técnico Universitario', 'Técnico U.', 'CTU', 'Ambato', 'A', 'APROBADO', '#FF0000', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Bellavista%')),
  ('Orense SC', 'Orense', 'OSC', 'Machala', 'A', 'APROBADO', '#FFD700', '#000000',
    (SELECT id FROM estadios WHERE nombre LIKE '%Nueve de Mayo%')),
  ('Guayaquil City FC', 'GC City', 'GCF', 'Guayaquil', 'A', 'APROBADO', '#00CED1', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Chucho%')),
  ('Cumbayá FC', 'Cumbayá', 'CFC', 'Cumbayá', 'A', 'APROBADO', '#800080', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Cumbayá%')),
  ('Libertad FC', 'Libertad', 'LFC', 'Loja', 'A', 'APROBADO', '#0000FF', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Reina del Cisne%')),
  ('CD Universidad Católica', 'U. Católica', 'UCE', 'Quito', 'A', 'APROBADO', '#0000FF', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Atahualpa%')),
  ('Club Deportivo Macará', 'Macará', 'CDM', 'Ambato', 'A', 'APROBADO', '#0000FF', '#FFFFFF',
    (SELECT id FROM estadios WHERE nombre LIKE '%Bellavista%'));

-- ============================================
-- DATOS SEMILLA: Competición Serie A 2026
-- ============================================
INSERT INTO competiciones (nombre, serie, temporada, fase_actual, estado, num_equipos, fecha_inicio, fecha_fin)
VALUES ('Campeonato Nacional Serie A 2026', 'A', 2026, 'FASE_UNO', 'EN_CURSO', 16, '2026-02-15', '2026-12-15');

INSERT INTO competiciones (nombre, serie, temporada, fase_actual, estado, num_equipos, fecha_inicio, fecha_fin)
VALUES ('Campeonato Nacional Serie B 2026', 'B', 2026, 'CLASIFICACION', 'EN_CURSO', 10, '2026-03-01', '2026-11-30');

-- ============================================
-- DATOS SEMILLA: Tabla de posiciones Serie A Fase 1 (ejemplo)
-- ============================================
DO $$
DECLARE
  comp_id UUID;
  clubs RECORD;
  posicion_counter INTEGER := 0;
  datos_tabla JSONB := '[
    {"abr": "IDV", "pts": 35, "pj": 15, "g": 10, "e": 5, "p": 0, "gf": 28, "gc": 10},
    {"abr": "BSC", "pts": 33, "pj": 15, "g": 10, "e": 3, "p": 2, "gf": 30, "gc": 15},
    {"abr": "LDU", "pts": 30, "pj": 15, "g": 9, "e": 3, "p": 3, "gf": 25, "gc": 12},
    {"abr": "CSE", "pts": 27, "pj": 15, "g": 8, "e": 3, "p": 4, "gf": 22, "gc": 16},
    {"abr": "DCU", "pts": 25, "pj": 15, "g": 7, "e": 4, "p": 4, "gf": 20, "gc": 15},
    {"abr": "SDA", "pts": 23, "pj": 15, "g": 6, "e": 5, "p": 4, "gf": 18, "gc": 14},
    {"abr": "CDN", "pts": 21, "pj": 15, "g": 6, "e": 3, "p": 6, "gf": 16, "gc": 18},
    {"abr": "MRS", "pts": 20, "pj": 15, "g": 5, "e": 5, "p": 5, "gf": 15, "gc": 15},
    {"abr": "DFC", "pts": 18, "pj": 15, "g": 5, "e": 3, "p": 7, "gf": 14, "gc": 19},
    {"abr": "CTU", "pts": 17, "pj": 15, "g": 4, "e": 5, "p": 6, "gf": 13, "gc": 17},
    {"abr": "OSC", "pts": 15, "pj": 15, "g": 4, "e": 3, "p": 8, "gf": 12, "gc": 20},
    {"abr": "GCF", "pts": 14, "pj": 15, "g": 3, "e": 5, "p": 7, "gf": 11, "gc": 18},
    {"abr": "CFC", "pts": 12, "pj": 15, "g": 3, "e": 3, "p": 9, "gf": 10, "gc": 22},
    {"abr": "LFC", "pts": 10, "pj": 15, "g": 2, "e": 4, "p": 9, "gf": 9, "gc": 24},
    {"abr": "UCE", "pts": 8, "pj": 15, "g": 2, "e": 2, "p": 11, "gf": 8, "gc": 26},
    {"abr": "CDM", "pts": 5, "pj": 15, "g": 1, "e": 2, "p": 12, "gf": 6, "gc": 28}
  ]';
  dato JSONB;
  club_uuid UUID;
BEGIN
  SELECT id INTO comp_id FROM competiciones WHERE serie = 'A' AND temporada = 2026;
  
  FOR dato IN SELECT * FROM jsonb_array_elements(datos_tabla) LOOP
    posicion_counter := posicion_counter + 1;
    SELECT id INTO club_uuid FROM clubes WHERE abreviatura = dato->>'abr';
    
    IF club_uuid IS NOT NULL THEN
      INSERT INTO tabla_posiciones (
        competicion_id, fase, club_id, puntos, partidos_jugados,
        ganados, empatados, perdidos, goles_favor, goles_contra,
        goles_visitante, posicion
      ) VALUES (
        comp_id, 'FASE_UNO', club_uuid,
        (dato->>'pts')::INTEGER,
        (dato->>'pj')::INTEGER,
        (dato->>'g')::INTEGER,
        (dato->>'e')::INTEGER,
        (dato->>'p')::INTEGER,
        (dato->>'gf')::INTEGER,
        (dato->>'gc')::INTEGER,
        FLOOR(RANDOM() * (dato->>'gf')::INTEGER),
        posicion_counter
      );
    END IF;
  END LOOP;
END;
$$;

-- ============================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- ============================================
-- Ejecutar este script completo en el SQL Editor de Supabase.
-- Las tablas, funciones, triggers, índices y datos semilla
-- serán creados automáticamente.
-- ============================================
