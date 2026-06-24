-- ============================================================
--  MediHub Care Platform — PostgreSQL Schema
--  Run this file in pgAdmin or psql to create all tables
--  Command: psql -U postgres -d medihub -f schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 1. STAFF TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id   VARCHAR(20)  UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department    VARCHAR(100),
  phone         VARCHAR(20),
  role          VARCHAR(10)  NOT NULL DEFAULT 'staff' CHECK (role = 'staff'),
  status        VARCHAR(10)  NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 2. DOCTORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     VARCHAR(20)  UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(150) UNIQUE NOT NULL,
  google_sub      VARCHAR(255) UNIQUE,        -- Google OAuth subject ID
  specialty       VARCHAR(100),
  department      VARCHAR(100),
  phone           VARCHAR(20),
  qualification   VARCHAR(200),
  schedule        VARCHAR(150),
  role            VARCHAR(10)  NOT NULL DEFAULT 'doctor' CHECK (role = 'doctor'),
  status          VARCHAR(10)  NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  join_date       DATE         DEFAULT CURRENT_DATE,
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. PATIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id         VARCHAR(20) UNIQUE NOT NULL,  -- PT001, PT002 etc
  name                VARCHAR(100) NOT NULL,
  date_of_birth       DATE,
  age                 INTEGER,
  gender              VARCHAR(10)  CHECK (gender IN ('Male','Female','Other')),
  blood_group         VARCHAR(5),
  nic                 VARCHAR(20)  UNIQUE,
  phone               VARCHAR(20),
  email               VARCHAR(150),
  address             TEXT,
  emergency_name      VARCHAR(100),
  emergency_contact   VARCHAR(20),
  status              VARCHAR(10)  NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  registered_by       UUID         REFERENCES staff(id) ON DELETE SET NULL,
  registered_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Auto-generate hospital_id (PT001, PT002...)
CREATE SEQUENCE IF NOT EXISTS patient_seq START 1;

CREATE OR REPLACE FUNCTION generate_hospital_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hospital_id IS NULL THEN
    NEW.hospital_id := 'PT' || LPAD(nextval('patient_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_hospital_id ON patients;
CREATE TRIGGER set_hospital_id
  BEFORE INSERT ON patients
  FOR EACH ROW EXECUTE FUNCTION generate_hospital_id();


-- ============================================================
-- 4. PATIENT STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_status_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  old_status    VARCHAR(10),
  new_status    VARCHAR(10) NOT NULL,
  reason        VARCHAR(200),
  notes         TEXT,
  changed_by    UUID        REFERENCES doctors(id) ON DELETE SET NULL,
  changed_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. DOCTOR-PATIENT ASSIGNMENT
--    Many doctors can have the same patient
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_patients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id   UUID      NOT NULL REFERENCES doctors(id)  ON DELETE CASCADE,
  patient_id  UUID      NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  signed_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, patient_id)   -- prevent duplicate assignments
);


-- ============================================================
-- 6. MEDICAL HISTORY
--    One per patient (booking visit form)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_history (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            UUID  UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date            DATE,
  primary_complaint     TEXT,
  history_of_complaint  TEXT,
  pmh                   TEXT,   -- Past Medical History
  psh                   TEXT,   -- Past Surgical History
  ah                    TEXT,   -- Allergy History
  dh                    TEXT,   -- Drug History
  fh                    TEXT,   -- Family History
  sh                    TEXT,   -- Social History
  probable_diagnosis    TEXT,
  data_collected        TEXT,
  investigations_ordered TEXT,
  investigation_results  TEXT,
  instructions_given    TEXT,
  management_follow_up  BOOLEAN DEFAULT FALSE,
  management_referral   BOOLEAN DEFAULT FALSE,
  management_advice     BOOLEAN DEFAULT FALSE,
  referral_details      TEXT,
  saved_by              UUID    REFERENCES doctors(id) ON DELETE SET NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 7. APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID         NOT NULL REFERENCES patients(id)  ON DELETE CASCADE,
  doctor_id     UUID         NOT NULL REFERENCES doctors(id)   ON DELETE CASCADE,
  date          DATE         NOT NULL,
  time          TIME         NOT NULL,
  type          VARCHAR(50)  NOT NULL DEFAULT 'Consultation'
                  CHECK (type IN ('Consultation','Follow-up','Review','Emergency','Procedure','Lab Visit')),
  duration      INTEGER      DEFAULT 30,  -- minutes
  details       TEXT,
  status        VARCHAR(20)  NOT NULL DEFAULT 'Confirmed'
                  CHECK (status IN ('Confirmed','Pending','Cancelled','Completed')),
  created_by    UUID         REFERENCES staff(id)   ON DELETE SET NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 8. PATIENT LOGS (Visit entries by doctor)
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  UUID      NOT NULL REFERENCES patients(id)  ON DELETE CASCADE,
  doctor_id   UUID      NOT NULL REFERENCES doctors(id)   ON DELETE CASCADE,
  log_date    DATE      NOT NULL DEFAULT CURRENT_DATE,
  -- Examination
  general_examination   TEXT,
  cardiovascular        TEXT,
  respiratory           TEXT,
  nervous               TEXT,
  locomotor             TEXT,
  gastrointestinal      TEXT,
  additional_exam       TEXT,
  -- Assessment
  diagnosis             TEXT,
  plan                  TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 9. DRUG CHART (belongs to a patient log)
-- ============================================================
CREATE TABLE IF NOT EXISTS drug_chart (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id            UUID         NOT NULL REFERENCES patient_logs(id) ON DELETE CASCADE,
  patient_id        UUID         NOT NULL REFERENCES patients(id)     ON DELETE CASCADE,
  drug_name         VARCHAR(150) NOT NULL,
  dose              VARCHAR(50),
  frequency         VARCHAR(100),
  duration          VARCHAR(100),
  meal_instruction  VARCHAR(100),
  notes             TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 10. INVESTIGATIONS (belongs to a patient log)
-- ============================================================
CREATE TABLE IF NOT EXISTS investigations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id           UUID         NOT NULL REFERENCES patient_logs(id) ON DELETE CASCADE,
  patient_id       UUID         NOT NULL REFERENCES patients(id)     ON DELETE CASCADE,
  investigation_type VARCHAR(150) NOT NULL,
  date_ordered     DATE,
  results          TEXT,
  reference_range  VARCHAR(100),
  status           VARCHAR(20)  DEFAULT 'Normal'
                     CHECK (status IN ('Normal','Abnormal','Pending','Critical')),
  notes            TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 11. PRESCRIPTIONS
--     Created from drug chart entries for patient mobile app
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id  UUID      NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  log_id      UUID      REFERENCES patient_logs(id)      ON DELETE SET NULL,
  added_by    UUID      REFERENCES staff(id)             ON DELETE SET NULL,
  presc_date  DATE      NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescription_drugs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id  UUID         NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  drug_name        VARCHAR(150) NOT NULL,
  dose             VARCHAR(50),
  frequency        VARCHAR(100),
  duration         VARCHAR(100),
  meal_instruction VARCHAR(100),
  notes            TEXT
);


-- ============================================================
-- 12. ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id   UUID         NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  alert_type   VARCHAR(50)  NOT NULL,
  message      TEXT         NOT NULL,
  severity     VARCHAR(20)  NOT NULL DEFAULT 'info'
                 CHECK (severity IN ('info','warning','danger')),
  is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 13. SYMPTOM LOGS (reported by patient via mobile app)
-- ============================================================
CREATE TABLE IF NOT EXISTS symptom_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id     UUID         NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  symptoms       TEXT[]       NOT NULL,   -- array of symptom strings
  severity       VARCHAR(20)  NOT NULL DEFAULT 'Mild'
                   CHECK (severity IN ('Mild','Moderate','Severe')),
  notes          TEXT,
  reported_via   VARCHAR(20)  DEFAULT 'App',
  reported_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES — for faster queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id    ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patients_status         ON patients(status);
CREATE INDEX IF NOT EXISTS idx_doctor_patients_doctor  ON doctor_patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patients_patient ON doctor_patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date       ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor     ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient    ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_logs_patient    ON patient_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_logs_doctor     ON patient_logs(doctor_id);
CREATE INDEX IF NOT EXISTS idx_drug_chart_log          ON drug_chart(log_id);
CREATE INDEX IF NOT EXISTS idx_investigations_log      ON investigations(log_id);
CREATE INDEX IF NOT EXISTS idx_alerts_patient          ON alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read             ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_patient    ON symptom_logs(patient_id);


-- ============================================================
-- AUTO UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['staff','doctors','patients','appointments','patient_logs','medical_history']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON %I;
      CREATE TRIGGER trg_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END;
$$;


-- ============================================================
-- SEED DATA — default staff accounts
-- Passwords are bcrypt hashed: Staff@1234
-- ============================================================
INSERT INTO staff (employee_id, name, email, password_hash, department, role)
VALUES
  ('ST001', 'Sarah Johnson',     'admin@medihub.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administration', 'staff'),
  ('ST002', 'Michael Chen',      'reception@medihub.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Reception',      'staff'),
  ('ST003', 'Pubuduni Mayanthi', 'staff@medihub.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'General Medicine','staff')
ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- DONE
-- ============================================================
SELECT 'MediHub schema created successfully!' AS result;
