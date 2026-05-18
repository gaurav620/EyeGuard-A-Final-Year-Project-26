const { Client } = require('pg');

const client = new Client({
  host: '13.228.184.177',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_oihWucE6Ifv2',
  ssl: {
    rejectUnauthorized: false,
    servername: 'ep-billowing-queen-a1uddhps-pooler.ap-southeast-1.aws.neon.tech',
  },
  connectionTimeoutMillis: 30000,
});

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  age INTEGER,
  gender TEXT,
  screen_time_hours REAL,
  eye_condition TEXT DEFAULT 'none',
  device_type TEXT,
  is_research_participant BOOLEAN DEFAULT false,
  consent_given BOOLEAN DEFAULT false,
  participant_code TEXT UNIQUE,
  contribution_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  avg_ear REAL,
  total_blinks INTEGER DEFAULT 0,
  avg_fatigue_score REAL,
  peak_fatigue_score REAL,
  device_type TEXT,
  browser TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  timestamp TIMESTAMPTZ DEFAULT now(),
  ear REAL,
  blink_rate REAL,
  eye_closure_duration REAL,
  gaze_variance REAL,
  fatigue_score REAL,
  fatigue_level TEXT DEFAULT 'normal',
  is_blinking BOOLEAN DEFAULT false,
  left_ear REAL,
  right_ear REAL,
  gaze_x REAL,
  gaze_y REAL
);

CREATE TABLE IF NOT EXISTS model_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT,
  accuracy REAL,
  precision_val REAL,
  recall REAL,
  f1_score REAL,
  dataset_size INTEGER,
  evaluated_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS participant_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

async function main() {
  try {
    console.log('Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('Connected! Creating tables...');
    await client.query(sql);
    console.log('All tables created successfully!');
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('Tables:', res.rows.map(r => r.tablename).join(', '));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
