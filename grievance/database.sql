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

CREATE TABLE grievance_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grievance_subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES grievance_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    escalation_days INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);




CREATE TABLE grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    indos_number TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    cdc_number TEXT,
    dob DATE,
    category_id INTEGER REFERENCES grievance_categories(id),
    subcategory_id INTEGER REFERENCES grievance_subcategories(id),
    subject TEXT,
    description TEXT, -- This will store the Tiptap HTML content
    status TEXT DEFAULT 'SUBMITTED',
    priority TEXT DEFAULT 'Medium',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grievance_files (
    id SERIAL PRIMARY KEY,
    grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL, -- Path to the file on your local server disk
    file_name TEXT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.temp_otps (
    email TEXT PRIMARY KEY,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + interval '10 minutes')
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



-- UPDATED

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


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

CREATE TABLE grievance_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grievance_subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES grievance_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    escalation_days INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grievances (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	reference_number TEXT UNIQUE NOT NULL,
	user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
	indos_number TEXT NOT NULL,
	first_name TEXT,
	last_name TEXT,
	cdc_number TEXT,
	dob DATE,
	category_id INTEGER REFERENCES grievance_categories(id),
	subcategory_id INTEGER REFERENCES grievance_subcategories(id),
	subject TEXT,
	description TEXT,
	status TEXT DEFAULT 'SUBMITTED',
	priority TEXT DEFAULT 'MEDIUM',
	due_date TIMESTAMPTZ,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grievance_files (
	id SERIAL PRIMARY KEY,
	grievacne_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
	file_path TEXT NOT NULL,
	file_name TEXT NOT NULL,
	file_type TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.temp_otps (
	email TEXT PRIMARY KEY,
	expires_at TIMESTAMPTZ DEFAULT (NOW() + interval '10 minutes')
);



INSERT INTO grievance_categories (id, name) VALUES 
  (1, 'INDoS Application'),
  (2, 'Seafarer Profile'),
  (3, 'Maritime Time Institutes'),
  (4, 'CDC & Cook'),
  (5, 'BSID'),
  (6, 'Placement for Onboard Training (prior joining Ship)'),
  (7, 'Employment (after joining Ship)'),
  (8, 'Compensation for Death and Disablity. Missing Seafarer'),
  (9, 'Piracy, Hijacking and Detention of Seafarer'),
  (10, 'Assessment, Examination and Certification'),
  (11, 'Provident Fund - SPFO'),
  (12, 'Welfare Schemes - SWFS'),
  (13, 'Others');

-- 3. Insert All Subcategories

-- Category 1: INDoS Application
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (1, 'Unable to generate Reference Number for INDoS'),
  (1, 'Application could not be submitted by MTI'),
  (1, 'Any other Issue');

-- Category 2: Seafarer Profile
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (2, 'Change in Photograph and Signature'),
  (2, 'Change / Correction in name'),
  (2, 'Change / Correction in address'),
  (2, 'Change / Correction in Passport number'),
  (2, 'Change / updating of training courses'),
  (2, 'Correction / updating of sea service entry'),
  (2, 'Deletion of wrong entries/duplicate entries'),
  (2, 'Change / Correction in COC & COP data'),
  (2, 'Any other Issue');

-- Category 3: Maritime Time Institutes
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (3, 'Admission to Training courses'),
  (3, 'Fee payment / excess fee / Cash payment / refund related'),
  (3, 'Conduct of training courses including practical exercise'),
  (3, 'Eligibility Criteria'),
  (3, 'Lack of infrastructure'),
  (3, 'Lack of faculty & instructors'),
  (3, 'Hostel facilities'),
  (3, 'Placement related'),
  (3, 'Ragging/ Sexual harassment / other discipline related'),
  (3, 'Internal assessment'),
  (3, 'Conduct of Exit examination & arrangements'),
  (3, 'Course could not be completed as per the schedule'),
  (3, 'Repeat attempt in Exit examination'),
  (3, 'Certificate for the training courses not issued'),
  (3, 'Correction in course certificate'),
  (3, 'Photo and signature not clear in the certificate'),
  (3, 'Digital signature could not be seen/verified in the certificate'),
  (3, 'Issuance of duplicate course certificate'),
  (3, 'Certificate issued/generated without attending/completing the training and exit examination'),
  (3, 'Fake course certificate'),
  (3, 'Any other Issue');

-- Category 4: CDC & Cook
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (4, 'Eligible but could not apply for CDC'),
  (4, 'Fee payment related'),
  (4, 'Old CDC data not available in Master Checker'),
  (4, 'Delay in issuance/renewal/replacement of CDC'),
  (4, 'Unable to apply for renewal/replacement/duplicate CDC'),
  (4, 'Surrendering/cancellation of CDC pending'),
  (4, 'Delay in verification of certificates (SSLC/HSC board)'),
  (4, 'Rejection of application'),
  (4, 'CDC data error in Master Checker'),
  (4, 'Wrong entries in CDC booklet'),
  (4, 'CDC application approved. Dispatch details not updated.'),
  (4, 'CDC returned by post man, Door lock.'),
  (4, 'Any other Issue');

-- Category 5: BSID
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (5, 'Have CDC but could not apply for SID card'),
  (5, 'Fee payment related'),
  (5, 'Old SID data not available in Master Checker'),
  (5, 'Delay in issuance of SID card'),
  (5, 'Unable to apply SID card'),
  (5, 'Correction in SID application'),
  (5, 'Could not capture bio-metric data'),
  (5, 'Wrong photo and signature in SID card'),
  (5, 'SID card not received at home. Dispatch details not updated'),
  (5, 'SID card returned to SM office. Door locked.'),
  (5, 'Rejection of application'),
  (5, 'SID data error in checker'),
  (5, 'Any other Issue');

-- Category 6: Placement for Onboard Training
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (6, 'Institute did not help in placement for onboard training.'),
  (6, 'Institute/company demands money for onboard training.'),
  (6, 'Selected for onboard training. But company did not provide ship even after six months.'),
  (6, 'Could not commence onboard training even after one year.'),
  (6, 'Paid money for onboard training. But could not join ship till date.'),
  (6, 'Ship not suitable for onboard training'),
  (6, 'Company sent me on arrested/scarp ships for onboard training.'),
  (6, 'Harassment and bad treatment during onboard training.'),
  (6, 'Lack of food/facilities during onboard training.'),
  (6, 'Could not complete the SSTP during onboard training.'),
  (6, 'TAR book not provided by the company for onboard training.'),
  (6, 'Company Training Officer not available.'),
  (6, 'Any other Issue');

-- Category 7: Employment (after joining Ship)
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (7, 'Wages not paid at monthly intervals'),
  (7, 'Wages not paid as per the employment agreement'),
  (7, 'Working and living conditions are very poor'),
  (7, 'TDS not deposited and TDS certificate not given'),
  (7, 'Ship unseaworthy and not safe for sailing'),
  (7, 'Sign off delayed even after completion of contract'),
  (7, 'Sign on details not updated in Master Checker'),
  (7, 'Sea service details wrongly entered in Master Checker.'),
  (7, 'Paid money through agents. But signed off from ship without completing the contract.'),
  (7, 'Contract signed for one ship but sent on another ship'),
  (7, 'Paid money for employment'),
  (7, 'Ship abandoned by the owner/manager'),
  (7, 'Ship arrested in commercial dispute / Laid up'),
  (7, 'Wages not paid fully at the time of sign off'),
  (7, 'Rest hours not provided'),
  (7, 'Shore leave not provided'),
  (7, 'Medical treatment not provided'),
  (7, 'Repatriation to home town'),
  (7, 'Hospitalization ashore in case of injury or accident'),
  (7, 'Loss of personal belongings'),
  (7, 'Sign off request in emergency'),
  (7, 'Any other Issue');

-- Category 8: Compensation
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (8, 'Death compensation not paid as per the agreement'),
  (8, 'Disability compensation not paid as per the agreement'),
  (8, 'Delay in payment of compensation'),
  (8, 'Presumed death certificate in case of Missing persons'),
  (8, 'Lost overboard'),
  (8, 'Person missing from ship'),
  (8, 'Repatriation of mortal remains'),
  (8, 'Loss of personal belongings'),
  (8, 'Any other Issue');

-- Category 9: Piracy
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (9, 'Release of Seafarer detained in foreign countries'),
  (9, 'Lack of communication with seafarer'),
  (9, 'Status of seafarers after the casualty'),
  (9, 'Investigation into Injury/death due to accident/casualty'),
  (9, 'Delay in remittance of wages of seafarers detained'),
  (9, 'Repatriation of seafarer stranded abroad'),
  (9, 'Any other Issue');

-- Category 10: Assessment & Exams
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (10, 'Assessment of eligibility expired'),
  (10, 'Could not submit application for assessment of eligibility'),
  (10, 'Assessment rejected'),
  (10, 'Error in Assessment'),
  (10, 'Assessment application made for wrong grade'),
  (10, 'Delay in assessment of eligibility'),
  (10, 'Unable to book seats for written examination'),
  (10, 'Seats not available for written examination'),
  (10, 'Unable to book seats for oral examination'),
  (10, 'Wrong booking – request to reject the application'),
  (10, 'Fee payment related'),
  (10, 'Transfer of application'),
  (10, 'Postponement of oral examination'),
  (10, 'Delay in declaration of results'),
  (10, 'Result updated wrongly'),
  (10, 'EXN45 form not received'),
  (10, 'Delay in sea service verification'),
  (10, 'Exam schedule not available'),
  (10, 'Could not proceed with seat booking for examination'),
  (10, 'Delay in re-evaluation of papers'),
  (10, 'Mistakes in question papers/out of syllabus'),
  (10, 'Conduct of oral examination'),
  (10, 'Delay in processing the application'),
  (10, 'Delay in issuing COP'),
  (10, 'Application approved. But dispatch details not updated'),
  (10, 'COC/COP not delivered. Door locked.'),
  (10, 'Certificate details wrongly updated in Master Checker'),
  (10, 'Correction in COC/COP details in Master Checker'),
  (10, 'Any other Issue');

-- Category 11: Provident Fund (SPFO)
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (11, 'PF Related Issue');

-- Category 12: Welfare Schemes (SWFS)
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (12, 'Walfare scheme related issues'),
  (12, 'Gratuity related issues');

INSERT INTO grievance_subcategories (category_id, name) values
  (13, ' ');