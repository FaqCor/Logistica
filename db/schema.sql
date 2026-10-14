-- =====================================================================
-- ESQUEMA LOGÍSTICA - Neon (PostgreSQL)
-- Módulos: flota, choferes, clientes, pedidos, checklist, cobros,
--          viáticos, fallas, mantenimientos, costos por patente
-- =====================================================================

-- ---------- TIPOS ENUM ----------
DO $$ BEGIN
    CREATE TYPE estado_pedido AS ENUM ('pendiente', 'entregado', 'no_entregado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_ruta AS ENUM ('planificada', 'en_curso', 'finalizada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE medio_pago AS ENUM ('efectivo', 'transferencia', 'cheque', 'otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_viatico AS ENUM ('hotel', 'comida', 'peaje', 'combustible', 'estacionamiento', 'otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_mantenimiento AS ENUM ('preventivo', 'correctivo');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_mantenim AS ENUM ('programado', 'realizado', 'cancelado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE severidad_falla AS ENUM ('baja', 'media', 'alta', 'critica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_falla AS ENUM ('abierta', 'en_revision', 'resuelta');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('chofer', 'logistica', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---------- USUARIOS (login) ----------
CREATE TABLE IF NOT EXISTS usuarios (
    id              BIGSERIAL PRIMARY KEY,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    rol             rol_usuario NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- FLOTA ----------
CREATE TABLE IF NOT EXISTS vehiculos (
    patente             TEXT PRIMARY KEY CHECK (patente = upper(patente)),
    marca               TEXT,
    modelo              TEXT,
    anio                SMALLINT,
    tipo                TEXT,                 -- camión, utilitario, camioneta...
    capacidad_kg        NUMERIC(10,2),
    capacidad_m3        NUMERIC(10,2),
    combustible         TEXT,
    km_actual           INTEGER NOT NULL DEFAULT 0,
    vto_vtv             DATE,
    vto_seguro          DATE,
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    notas               TEXT
);

-- ---------- CHOFERES ----------
CREATE TABLE IF NOT EXISTS choferes (
    id               BIGSERIAL PRIMARY KEY,
    usuario_id       BIGINT UNIQUE REFERENCES usuarios(id),
    nombre           TEXT NOT NULL,
    apellido         TEXT NOT NULL,
    dni              TEXT UNIQUE,
    telefono_wsp     TEXT NOT NULL,          -- formato internacional: 5491155551234
    licencia_nro     TEXT,
    licencia_vto     DATE,
    activo           BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------- CLIENTES ----------
CREATE TABLE IF NOT EXISTS clientes (
    id           BIGSERIAL PRIMARY KEY,
    razon_social TEXT NOT NULL,
    cuit         TEXT UNIQUE,
    telefono     TEXT,
    email        TEXT,
    activo       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS direcciones_cliente (
    id            BIGSERIAL PRIMARY KEY,
    cliente_id    BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    alias         TEXT,                    -- "Depósito central", "Sucursal Norte"
    direccion     TEXT NOT NULL,
    localidad     TEXT,
    provincia     TEXT,
    latitud       NUMERIC(9,6),
    longitud      NUMERIC(9,6),
    horario_ent   TEXT,
    contacto      TEXT,
    principal     BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_dir_cliente ON direcciones_cliente(cliente_id);

-- ---------- RUTAS (jornada de un chofer con un vehículo) ----------
CREATE TABLE IF NOT EXISTS rutas (
    id                BIGSERIAL PRIMARY KEY,
    fecha             DATE NOT NULL,
    chofer_id         BIGINT NOT NULL REFERENCES choferes(id),
    patente           TEXT   NOT NULL REFERENCES vehiculos(patente),
    estado            estado_ruta NOT NULL DEFAULT 'planificada',
    km_inicio         INTEGER,
    km_fin            INTEGER,
    ruta_optimizada   JSONB,                   -- orden de paradas devuelto por optimizador
    url_mapa          TEXT,
    enviada_wsp_en    TIMESTAMPTZ,
    creada_por        BIGINT REFERENCES usuarios(id),
    creada_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (km_fin IS NULL OR km_inicio IS NULL OR km_fin >= km_inicio)
);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha_chofer ON rutas(fecha, chofer_id);
CREATE INDEX IF NOT EXISTS idx_rutas_patente      ON rutas(patente);

-- ---------- CHECKLIST OBLIGATORIO ----------
CREATE TABLE IF NOT EXISTS checklist_items (          -- catálogo editable por logística
    id            SERIAL PRIMARY KEY,
    descripcion   TEXT NOT NULL,          -- "Luces", "Neumáticos", "Frenos", "Nivel de aceite"
    orden         SMALLINT NOT NULL DEFAULT 0,
    obligatorio   BOOLEAN NOT NULL DEFAULT TRUE,
    activo        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS checklists (                -- uno por ruta
    id              BIGSERIAL PRIMARY KEY,
    ruta_id         BIGINT UNIQUE NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    km_registrado   INTEGER NOT NULL,
    observaciones   TEXT,
    completado      BOOLEAN NOT NULL DEFAULT FALSE,
    completado_en   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS checklist_respuestas (
    id             BIGSERIAL PRIMARY KEY,
    checklist_id   BIGINT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    item_id        INTEGER NOT NULL REFERENCES checklist_items(id),
    ok             BOOLEAN NOT NULL,
    comentario     TEXT,
    foto_url       TEXT,
    UNIQUE (checklist_id, item_id),
    CHECK (ok OR comentario IS NOT NULL)   -- si algo está mal, explicar
);

-- ---------- PEDIDOS ----------
CREATE TABLE IF NOT EXISTS pedidos (
    id                  BIGSERIAL PRIMARY KEY,
    nro_pedido          TEXT UNIQUE NOT NULL,
    cliente_id          BIGINT NOT NULL REFERENCES clientes(id),
    direccion_id        BIGINT NOT NULL REFERENCES direcciones_cliente(id),
    ruta_id             BIGINT REFERENCES rutas(id),
    orden_en_ruta       SMALLINT,
    descripcion         TEXT,
    bultos              INTEGER,
    peso_kg             NUMERIC(10,2),
    monto_a_cobrar      NUMERIC(14,2) NOT NULL DEFAULT 0,
    estado              estado_pedido NOT NULL DEFAULT 'pendiente',
    motivo_no_entrega   TEXT,
    fecha_programada    DATE NOT NULL,
    entregado_en        TIMESTAMPTZ,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT motivo_obligatorio
        CHECK (estado <> 'no_entregado' OR length(btrim(coalesce(motivo_no_entrega,''))) > 0)
);
CREATE INDEX IF NOT EXISTS idx_pedidos_ruta   ON pedidos(ruta_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha  ON pedidos(fecha_programada, estado);

-- Seguimiento detallado (historial de cada cambio)
CREATE TABLE IF NOT EXISTS pedido_eventos (
    id          BIGSERIAL PRIMARY KEY,
    pedido_id   BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    estado      estado_pedido NOT NULL,
    detalle     TEXT,
    latitud     NUMERIC(9,6),
    longitud    NUMERIC(9,6),
    usuario_id  BIGINT REFERENCES usuarios(id),
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eventos_pedido ON pedido_eventos(pedido_id, creado_en);

-- BLOQUEO: el chofer no puede operar pedidos sin checklist completo
CREATE OR REPLACE FUNCTION exigir_checklist() RETURNS trigger AS $$
BEGIN
    IF NEW.estado IS DISTINCT FROM OLD.estado AND NEW.ruta_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM checklists
                       WHERE ruta_id = NEW.ruta_id AND completado) THEN
            RAISE EXCEPTION 'Debe completar el checklist del vehículo antes de operar pedidos';
        END IF;
    END IF;
    RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exigir_checklist ON pedidos;
CREATE TRIGGER trg_exigir_checklist
    BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION exigir_checklist();

-- ---------- COBROS (con pagos mixtos) ----------
CREATE TABLE IF NOT EXISTS cobros (
    id                BIGSERIAL PRIMARY KEY,
    pedido_id         BIGINT UNIQUE NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    cliente_id        BIGINT NOT NULL REFERENCES clientes(id),
    chofer_id         BIGINT NOT NULL REFERENCES choferes(id),
    patente           TEXT   NOT NULL REFERENCES vehiculos(patente),
    cobro_realizado   BOOLEAN NOT NULL,          -- respuesta a "¿Cobró?"
    total_cobrado     NUMERIC(14,2) NOT NULL DEFAULT 0,
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cobro_pagos (
    id          BIGSERIAL PRIMARY KEY,
    cobro_id    BIGINT NOT NULL REFERENCES cobros(id) ON DELETE CASCADE,
    orden       SMALLINT NOT NULL CHECK (orden IN (1,2)),  -- 2.º medio es opcional
    medio       medio_pago NOT NULL,
    monto       NUMERIC(14,2) NOT NULL CHECK (monto > 0),
    referencia  TEXT,                                      -- nº transferencia / nº cheque / detalle "otros"
    banco       TEXT,
    fecha_cheque DATE,
    UNIQUE (cobro_id, orden)
);

-- Mantiene cobros.total_cobrado = suma de pagos
CREATE OR REPLACE FUNCTION recalcular_total_cobro() RETURNS trigger AS $$
DECLARE v_id BIGINT := COALESCE(NEW.cobro_id, OLD.cobro_id);
BEGIN
    UPDATE cobros SET total_cobrado =
        COALESCE((SELECT SUM(monto) FROM cobro_pagos WHERE cobro_id = v_id), 0)
    WHERE id = v_id;
    RETURN NULL;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_total_cobro ON cobro_pagos;
CREATE TRIGGER trg_total_cobro
    AFTER INSERT OR UPDATE OR DELETE ON cobro_pagos
    FOR EACH ROW EXECUTE FUNCTION recalcular_total_cobro();

-- ---------- VIÁTICOS / GASTOS POR PATENTE ----------
CREATE TABLE IF NOT EXISTS viaticos (
    id                BIGSERIAL PRIMARY KEY,
    ruta_id           BIGINT REFERENCES rutas(id),
    chofer_id         BIGINT NOT NULL REFERENCES choferes(id),
    patente           TEXT   NOT NULL REFERENCES vehiculos(patente),
    tipo              tipo_viatico NOT NULL,
    monto             NUMERIC(14,2) NOT NULL CHECK (monto > 0),
    descripcion       TEXT,
    comprobante_url   TEXT,
    fecha             DATE NOT NULL DEFAULT CURRENT_DATE,
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_viaticos_patente ON viaticos(patente, fecha);

CREATE TABLE IF NOT EXISTS gastos_vehiculo (          -- gastos no-viático: patente, seguro, repuestos, etc.
    id                 BIGSERIAL PRIMARY KEY,
    patente            TEXT NOT NULL REFERENCES vehiculos(patente),
    concepto           TEXT NOT NULL,
    monto              NUMERIC(14,2) NOT NULL CHECK (monto > 0),
    fecha              DATE NOT NULL DEFAULT CURRENT_DATE,
    mantenimiento_id   BIGINT,                           -- FK agregada abajo
    comprobante_url    TEXT
);
CREATE INDEX IF NOT EXISTS idx_gastos_patente ON gastos_vehiculo(patente, fecha);

-- ---------- INCIDENCIAS ----------
CREATE TABLE IF NOT EXISTS fallas (                    -- reporte en tiempo real al panel
    id            BIGSERIAL PRIMARY KEY,
    ruta_id       BIGINT REFERENCES rutas(id),
    chofer_id     BIGINT NOT NULL REFERENCES choferes(id),
    patente       TEXT   NOT NULL REFERENCES vehiculos(patente),
    descripcion   TEXT NOT NULL,
    severidad     severidad_falla NOT NULL DEFAULT 'media',
    estado        estado_falla NOT NULL DEFAULT 'abierta',
    latitud       NUMERIC(9,6),
    longitud      NUMERIC(9,6),
    foto_url      TEXT,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
    resuelto_en   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_fallas_abiertas ON fallas(estado, creado_en DESC);

CREATE TABLE IF NOT EXISTS observaciones (            -- pestaña "inconvenientes en ruta" (pinchadura, etc.)
    id          BIGSERIAL PRIMARY KEY,
    ruta_id     BIGINT NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    chofer_id   BIGINT NOT NULL REFERENCES choferes(id),
    patente     TEXT   NOT NULL REFERENCES vehiculos(patente),
    texto       TEXT NOT NULL,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- MANTENIMIENTOS ----------
CREATE TABLE IF NOT EXISTS mantenimientos (
    id                 BIGSERIAL PRIMARY KEY,
    patente            TEXT NOT NULL REFERENCES vehiculos(patente),
    tipo               tipo_mantenimiento NOT NULL,
    estado             estado_mantenim NOT NULL DEFAULT 'programado',
    descripcion        TEXT NOT NULL,
    fecha_programada   DATE,
    km_programado      INTEGER,
    fecha_realizada    DATE,
    km_realizado       INTEGER,
    taller             TEXT,
    costo              NUMERIC(14,2),
    falla_id           BIGINT REFERENCES fallas(id),
    creado_en          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mant_patente ON mantenimientos(patente, estado);

DO $$ BEGIN
    ALTER TABLE gastos_vehiculo
        ADD CONSTRAINT fk_gasto_mant FOREIGN KEY (mantenimiento_id) REFERENCES mantenimientos(id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---------- ACTUALIZAR KM DEL VEHÍCULO ----------
CREATE OR REPLACE FUNCTION actualizar_km_vehiculo() RETURNS trigger AS $$
BEGIN
    IF NEW.km_fin IS NOT NULL THEN
        UPDATE vehiculos SET km_actual = GREATEST(km_actual, NEW.km_fin)
         WHERE patente = NEW.patente;
    END IF;
    RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_km_vehiculo ON rutas;
CREATE TRIGGER trg_km_vehiculo
    AFTER INSERT OR UPDATE OF km_fin ON rutas
    FOR EACH ROW EXECUTE FUNCTION actualizar_km_vehiculo();

-- =====================================================================
-- VISTAS PARA GOOGLE SHEETS
-- =====================================================================

-- Pestaña "Costos": ordenada por patente, luego fecha
CREATE OR REPLACE VIEW v_costos_por_patente AS
SELECT patente, fecha, 'Viático - ' || tipo::text AS concepto, monto, descripcion AS detalle
  FROM viaticos
UNION ALL
SELECT patente, fecha, 'Gasto - ' || concepto, monto, NULL
  FROM gastos_vehiculo
UNION ALL
SELECT patente, fecha_realizada, 'Mantenimiento - ' || tipo::text, costo, descripcion
  FROM mantenimientos
 WHERE estado = 'realizado' AND costo IS NOT NULL
ORDER BY patente, fecha;

-- Resumen mensual por patente (reporte de vehículos)
CREATE OR REPLACE VIEW v_resumen_patente_mes AS
SELECT patente,
       date_trunc('month', fecha)::date AS mes,
       SUM(monto) AS costo_total
  FROM v_costos_por_patente
 GROUP BY patente, date_trunc('month', fecha)
 ORDER BY patente, mes;

-- Pestaña "Cobros": una fila por pago (soporta mixtos)
CREATE OR REPLACE VIEW v_cobros_detalle AS
SELECT c.creado_en::date AS fecha, c.patente, cl.razon_social AS cliente,
       p.nro_pedido, cp.orden, cp.medio, cp.monto, cp.referencia
  FROM cobros c
  JOIN pedidos p   ON p.id = c.pedido_id
  JOIN clientes cl ON cl.id = c.cliente_id
  LEFT JOIN cobro_pagos cp ON cp.cobro_id = c.id
 ORDER BY c.creado_en, p.nro_pedido, cp.orden;

-- Pestaña "Pedidos" del día
CREATE OR REPLACE VIEW v_pedidos_dia AS
SELECT p.fecha_programada, r.patente, ch.apellido || ', ' || ch.nombre AS chofer,
       p.nro_pedido, cl.razon_social AS cliente, d.direccion,
       p.estado, p.motivo_no_entrega, p.monto_a_cobrar
  FROM pedidos p
  JOIN clientes cl ON cl.id = p.cliente_id
  JOIN direcciones_cliente d ON d.id = p.direccion_id
  LEFT JOIN rutas r ON r.id = p.ruta_id
  LEFT JOIN choferes ch ON ch.id = r.chofer_id
 ORDER BY p.fecha_programada, r.patente, p.orden_en_ruta;