-- ============================================================
-- SENTINELA RURAL IA — Schema + RLS
-- Executar no Supabase SQL Editor
-- ============================================================

-- ENUM: roles
CREATE TYPE user_role AS ENUM ('master', 'admin', 'operator', 'client');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'blocked');
CREATE TYPE property_type AS ENUM ('residencial', 'comercial', 'rural');
CREATE TYPE camera_type AS ENUM ('rtsp', 'ip', 'gateway');
CREATE TYPE camera_status AS ENUM ('online', 'offline', 'error', 'unknown');
CREATE TYPE alert_status AS ENUM ('novo', 'em_analise', 'resolvido', 'ignorado');
CREATE TYPE alert_level AS ENUM ('baixo', 'medio', 'alto', 'critico');
CREATE TYPE sensitivity_level AS ENUM ('baixa', 'media', 'alta');

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'client',
  status user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPRIEDADES
-- ============================================================
CREATE TABLE propriedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo property_type NOT NULL DEFAULT 'rural',
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  endereco TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CAMERAS
-- ============================================================
CREATE TABLE cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propriedade_id UUID NOT NULL REFERENCES propriedades(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo camera_type NOT NULL DEFAULT 'rtsp',
  rtsp_url TEXT,
  usuario TEXT,
  senha TEXT,
  status camera_status NOT NULL DEFAULT 'unknown',
  ultimo_teste TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALERTAS
-- ============================================================
CREATE TABLE alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  nivel alert_level NOT NULL DEFAULT 'baixo',
  imagem_url TEXT,
  status alert_status NOT NULL DEFAULT 'novo',
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONFIGURACOES DE ALERTA
-- ============================================================
CREATE TABLE configuracoes_alerta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  alerta_pessoa BOOLEAN NOT NULL DEFAULT TRUE,
  alerta_veiculo BOOLEAN NOT NULL DEFAULT TRUE,
  alerta_moto BOOLEAN NOT NULL DEFAULT TRUE,
  alerta_caminhao BOOLEAN NOT NULL DEFAULT FALSE,
  alerta_animal BOOLEAN NOT NULL DEFAULT FALSE,
  sensibilidade sensitivity_level NOT NULL DEFAULT 'media',
  horario_inicio TIME NOT NULL DEFAULT '00:00',
  horario_fim TIME NOT NULL DEFAULT '23:59',
  canal_email BOOLEAN NOT NULL DEFAULT TRUE,
  canal_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_propriedades_cliente_id ON propriedades(cliente_id);
CREATE INDEX idx_cameras_propriedade_id ON cameras(propriedade_id);
CREATE INDEX idx_alertas_camera_id ON alertas(camera_id);
CREATE INDEX idx_alertas_status ON alertas(status);
CREATE INDEX idx_alertas_created_at ON alertas(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE propriedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_alerta ENABLE ROW LEVEL SECURITY;

-- Helper function: retorna role do usuário autenticado
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: retorna id do profile do usuário autenticado
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS: PROFILES
-- ============================================================
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (
    auth_user_id = auth.uid()
    OR get_my_role() IN ('master', 'admin', 'operator')
  );

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (
    auth_user_id = auth.uid()
    OR get_my_role() = 'master'
  );

CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  USING (get_my_role() = 'master');

-- ============================================================
-- RLS: PROPRIEDADES
-- ============================================================
CREATE POLICY "propriedades_select" ON propriedades FOR SELECT
  USING (
    cliente_id = get_my_profile_id()
    OR get_my_role() IN ('master', 'admin', 'operator')
  );

CREATE POLICY "propriedades_insert" ON propriedades FOR INSERT
  WITH CHECK (
    cliente_id = get_my_profile_id()
    OR get_my_role() IN ('master', 'admin')
  );

CREATE POLICY "propriedades_update" ON propriedades FOR UPDATE
  USING (
    cliente_id = get_my_profile_id()
    OR get_my_role() IN ('master', 'admin')
  );

CREATE POLICY "propriedades_delete" ON propriedades FOR DELETE
  USING (
    cliente_id = get_my_profile_id()
    OR get_my_role() IN ('master', 'admin')
  );

-- ============================================================
-- RLS: CAMERAS
-- ============================================================
CREATE POLICY "cameras_select" ON cameras FOR SELECT
  USING (
    get_my_role() IN ('master', 'admin', 'operator')
    OR EXISTS (
      SELECT 1 FROM propriedades p
      WHERE p.id = cameras.propriedade_id
        AND p.cliente_id = get_my_profile_id()
    )
  );

CREATE POLICY "cameras_insert" ON cameras FOR INSERT
  WITH CHECK (
    get_my_role() IN ('master', 'admin')
    OR EXISTS (
      SELECT 1 FROM propriedades p
      WHERE p.id = cameras.propriedade_id
        AND p.cliente_id = get_my_profile_id()
    )
  );

CREATE POLICY "cameras_update" ON cameras FOR UPDATE
  USING (
    get_my_role() IN ('master', 'admin')
    OR EXISTS (
      SELECT 1 FROM propriedades p
      WHERE p.id = cameras.propriedade_id
        AND p.cliente_id = get_my_profile_id()
    )
  );

CREATE POLICY "cameras_delete" ON cameras FOR DELETE
  USING (
    get_my_role() IN ('master', 'admin')
    OR EXISTS (
      SELECT 1 FROM propriedades p
      WHERE p.id = cameras.propriedade_id
        AND p.cliente_id = get_my_profile_id()
    )
  );

-- ============================================================
-- RLS: ALERTAS
-- ============================================================
CREATE POLICY "alertas_select" ON alertas FOR SELECT
  USING (
    get_my_role() IN ('master', 'admin', 'operator')
    OR EXISTS (
      SELECT 1 FROM cameras c
      JOIN propriedades p ON p.id = c.propriedade_id
      WHERE c.id = alertas.camera_id
        AND p.cliente_id = get_my_profile_id()
    )
  );

CREATE POLICY "alertas_insert" ON alertas FOR INSERT
  WITH CHECK (get_my_role() IN ('master', 'admin', 'operator'));

CREATE POLICY "alertas_update" ON alertas FOR UPDATE
  USING (get_my_role() IN ('master', 'admin', 'operator'));

CREATE POLICY "alertas_delete" ON alertas FOR DELETE
  USING (get_my_role() IN ('master', 'admin'));

-- ============================================================
-- RLS: CONFIGURACOES_ALERTA
-- ============================================================
CREATE POLICY "config_alerta_select" ON configuracoes_alerta FOR SELECT
  USING (
    cliente_id = get_my_profile_id()
    OR get_my_role() IN ('master', 'admin')
  );

CREATE POLICY "config_alerta_insert" ON configuracoes_alerta FOR INSERT
  WITH CHECK (cliente_id = get_my_profile_id());

CREATE POLICY "config_alerta_update" ON configuracoes_alerta FOR UPDATE
  USING (
    cliente_id = get_my_profile_id()
    OR get_my_role() IN ('master', 'admin')
  );

-- ============================================================
-- STORAGE: bucket para imagens de alertas
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('alertas', 'alertas', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "alertas_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'alertas' AND auth.role() = 'authenticated');

CREATE POLICY "alertas_storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'alertas' AND auth.role() = 'authenticated');

-- ============================================================
-- TRIGGER: primeiro usuário vira MASTER automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION handle_first_user_master()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM profiles) = 0 THEN
    NEW.role := 'master';
    NEW.status := 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER first_user_master
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_first_user_master();

-- ============================================================
-- TRIGGER: cria configuracao_alerta padrão ao aprovar cliente
-- ============================================================
CREATE OR REPLACE FUNCTION create_default_alert_config()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.role = 'client' THEN
    INSERT INTO configuracoes_alerta (cliente_id)
    VALUES (NEW.id)
    ON CONFLICT (cliente_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_alert_config
  AFTER INSERT OR UPDATE OF status ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_alert_config();
