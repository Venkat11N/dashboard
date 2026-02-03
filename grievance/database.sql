CREATE TABLE master_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

CREATE TABLE master_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES master_countries(id),
  name text NOT NULL
);

CREATE TABLE master_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

CREATE TABLE master_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

CREATE TABLE m_griev_category (
  grc_pk SERIAL PRIMARY KEY,
  grc_id VARCHAR(10) UNIQUE NOT NULL,
  grc_desc VARCHAR(100) NOT NULL,
  grc_status VARCHAR(1) DEFAULT 'Y'
);

CREATE TABLE m_griev_sub_category (
  grsc_pk SERIAL PRIMARY KEY,
  grsc_id VARCHAR(10) NOT NULL,
  grsc_desc VARCHAR(100),
  grsc_level VARCHAR(10),
  grsc_grc_pk INT REFERENCES m_griev_category(grc_pk) ON DELETE CASCADE
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  indos_number text UNIQUE,
  cdc_number text UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  email text NOT NULL,
  mobile text NOT NULL,
  rank_id uuid REFERENCES master_ranks(id),
  dept_id uuid REFERENCES master_states(id),
  state_id uuid REFERENCES master_countries(id),
  country_id uuid REFERENCES master_countries(id),
  created_at timestamptz DEFAULT now() 
);


CREATE TABLE m_escalation_matrix (
  escm_pk SERIAL PRIMARY KEY,
  escm_cgry_id INT REFERENCES m_griev_category(grc_pk),
  escm_sub_cgry_id INT REFERENCES m_griev_sub_category(grsc_pk),
  escm_sop_days INT NOT NULL,
  escm_escalate_to uuid REFERENCES auth.users(id), 
  escm_status VARCHAR(1) DEFAULT 'Y'
);

