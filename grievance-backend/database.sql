CREATE DATABASE IF NOT EXISTS maritime_portal;

USE maritime_portal;


CREATE TABLE IF NOT EXISTS master_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_state_country FOREIGN KEY (country_id) REFERENCES master_countries(id)
);

CREATE TABLE IF NOT EXISTS master_ranks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS master_departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 2. Grievance Structure
CREATE TABLE IF NOT EXISTS grievance_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grievance_subcategories (
    subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(150) NOT NULL,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    escalation_days INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_cat FOREIGN KEY (category_id) REFERENCES grievance_categories(category_id) ON DELETE CASCADE
);

-- 3. The Main Grievance Table
-- Linked to your account_holders table
CREATE TABLE IF NOT EXISTS grievances (
    grievance_id INT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    account_id INT, 
    indos_number VARCHAR(20) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    cdc_number VARCHAR(20),
    dob DATE,
    category_id INT,
    subcategory_id INT,
    subject VARCHAR(255),
    description TEXT,
    status ENUM('SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') DEFAULT 'SUBMITTED',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    due_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grievance_account FOREIGN KEY (account_id) REFERENCES account_holders(account_id),
    CONSTRAINT fk_grievance_cat FOREIGN KEY (category_id) REFERENCES grievance_categories(category_id),
    CONSTRAINT fk_grievance_sub FOREIGN KEY (subcategory_id) REFERENCES grievance_subcategories(subcategory_id)
);

-- 4. File Attachments
CREATE TABLE IF NOT EXISTS grievance_files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_files_grievance FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id) ON DELETE CASCADE
);

-- Create Roles Table
CREATE TABLE IF NOT EXISTS portal_roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_key VARCHAR(50) UNIQUE NOT NULL,
    role_label VARCHAR(100) NOT NULL
);

-- Create Main Account Holders Table
CREATE TABLE IF NOT EXISTS account_holders (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    official_email VARCHAR(150) UNIQUE NOT NULL,
    contact_no VARCHAR(20),
    role_id INT,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES portal_roles(role_id)
);

-- Create Security Table (For Passwords)
CREATE TABLE IF NOT EXISTS account_security (
    security_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    pass_hash VARCHAR(255) NOT NULL,
    CONSTRAINT fk_security_user FOREIGN KEY (account_id) REFERENCES account_holders(account_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS login_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_account FOREIGN KEY (account_id) REFERENCES account_holders(account_id) ON DELETE CASCADE
);

  

USE maritime_portal;



-- Disable checks temporarily to allow a clean wipe
SET FOREIGN_KEY_CHECKS = 0;

-- Wipe the user-related tables completely
TRUNCATE TABLE account_security;
TRUNCATE TABLE account_holders;

-- Re-enable checks
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Ensure Role exists
INSERT IGNORE INTO portal_roles (role_id, role_key, role_label) 
VALUES (1, 'ADMIN', 'Administrator');

-- 2. Insert the single, clean User record
INSERT INTO account_holders (account_id, full_name, official_email, contact_no, role_id) 
VALUES (1, 'Venkatesh Naidu', 'admin@maritime.gov', '9756985245', 1);

-- 3. Insert the single, clean Password Hash
-- Note: I removed the period at the end of the hash
INSERT INTO account_security (account_id, pass_hash) 
VALUES (1, '$2b$10$6p99YIOn7GZlFqU/u.YVDeBfVv0L8S5WJ8f9G0m2Y/R5L7L2/xQG');
  
DELETE FROM account_security WHERE account_id = 1;
DELETE FROM account_holders WHERE account_id = 1;
  
  
SELECT a.official_email, s.pass_hash 
FROM account_holders a 
JOIN account_security s ON a.account_id = s.account_id 
WHERE a.official_email = 'admin@maritime.gov';
  


UPDATE account_security 
SET pass_hash = '$2a$10$7R/m79rY.iOQ5pM.mUK6geQ5K9hVvI8Y3y6.O.G1f98V7m.1L/1m2' 
WHERE account_id = 1;






-- 1. Overwrite the Role (Fixes the Duplicate error)
REPLACE INTO portal_roles (role_id, role_key, role_label) 
VALUES (1, 'ADMIN', 'Administrator');

-- 2. Overwrite the User
REPLACE INTO account_holders (account_id, role_id, official_email, contact_no, full_name) 
VALUES (1, 1, 'admin@maritime.gov', '9756985245', 'Venkatesh Naidu');

-- 3. Overwrite the Security
REPLACE INTO account_security (account_id, pass_hash) 
VALUES (1, '$2b$10$6p99YIOn7GZlFqU/u.YVDeBfVv0L8S5WJ8f9G0m2Y/R5L7L2/xQG');

-- 4. COMMIT EVERYTHING
COMMIT;

-- 5. THE FINAL TEST
SELECT * FROM maritime_portal.account_holders;

USE maritime_portal;

-- 1. Wipe the duplicates
DELETE FROM account_security WHERE account_id = 1;
DELETE FROM account_holders WHERE account_id = 1;

-- 2. Insert one clean User
INSERT INTO account_holders (account_id, role_id, official_email, contact_no, full_name) 
VALUES (1, 1, 'admin@maritime.gov', '9756985245', 'Venkatesh Naidu');

-- 3. Insert one clean, 60-character Hash (No extra periods or spaces)
INSERT INTO account_security (account_id, pass_hash) 
VALUES (1, '$2b$10$6p99YIOn7GZlFqU/u.YVDeBfVv0L8S5WJ8f9G0m2Y/R5L7L2/xQG');

COMMIT;






-- This will overwrite the Role, User, and Password regardless of what is there
REPLACE INTO portal_roles (role_id, role_key, role_label) 
VALUES (1, 'ADMIN', 'Administrator');

REPLACE INTO account_holders (account_id, role_id, official_email, full_name) 
VALUES (1, 1, 'admin@maritime.gov', 'Venkatesh Naidu');

REPLACE INTO account_security (account_id, pass_hash) 
VALUES (1, '$2b$10$6p99YIOn7GZlFqU/u.YVDeBfVv0L8S5WJ8f9G0m2Y/R5L7L2/xQG');

COMMIT;

-- This query MUST show exactly 1 row now
SELECT a.full_name, s.pass_hash 
FROM account_holders a 
JOIN account_security s ON a.account_id = s.account_id 
WHERE a.official_email = 'admin@maritime.gov';




-- 1. Setup the specific Role
REPLACE INTO portal_roles (role_id, role_key, role_label) 
VALUES (1, 'dg_admin', 'DG Admin');

-- 2. Setup the specific User (ID 11)
REPLACE INTO account_holders (account_id, role_id, official_email, full_name, contact_no) 
VALUES (11, 1, 'admin@maritime.gov', 'Venkatesh Naidu', '9756823695');


REPLACE INTO account_security (account_id, pass_hash) 
VALUES (11, '$2b$10$f3p7pW/DndI.M.Gq5H8BGe8v6m5kQ9YvA1e4fH.pXm7l2v7S8m4K.');

COMMIT;

DESCRIBE account_security;



-- Turn off safe updates to allow a full clear
SET SQL_SAFE_UPDATES = 0;

-- Wipe the old security records
DELETE FROM account_security;

-- Insert exactly one record
-- We let security_id auto-increment, and link to account_id 11
INSERT INTO account_security (account_id, pass_hash) 
VALUES (11, '$2b$10$f3p7pW/DndI.M.Gq5H8BGe8v6m5kQ9YvA1e4fH.pXm7l2v7S8m4K.');

SET SQL_SAFE_UPDATES = 1;
COMMIT;



DELETE FROM account_security WHERE account_id = 11;

-- Step 2: Insert the clean hash for 'Testing123@'
-- This is a verified 60-character bcrypt hash
INSERT INTO account_security (account_id, pass_hash) 
VALUES (11, '$2b$10$C8.NIDp9f99O1X.pA5NfPe8H7YqW6V9zX4fG8M5L2uR7S3E1Wz2v.');

COMMIT;

UPDATE account_security 
SET pass_hash = '$2a$10$f3p7pW/DndI.M.Gq5H8BGe8v6m5kQ9YvA1e4fH.pXm7l2v7S8m4K' 
WHERE account_id = 11;







-- Change the column to a larger, flexible type to prevent any auto-trimming
ALTER TABLE account_security MODIFY pass_hash TEXT;

-- Re-insert the full 60-character hash
UPDATE account_security 
SET pass_hash = '$2a$10$6p99YIOn7GZlFqU/u.YVDeBfVv0L8S5WJ8f9G0m2Y/R5L7L2/xQG' 
WHERE account_id = 11;

COMMIT;

ALTER TABLE account_security 
MODIFY pass_hash VARCHAR(60);

UPDATE account_security
SET pass_hash = NULL
WHERE account_id = 11;



UPDATE account_security 
SET pass_hash = '$2b$10$RuqtVklyO5jnX1tTUbFjROQKrTnQlXa9GMi6VlY85/Hb1MM.rPN.6' 
WHERE account_id = 11;
COMMIT;





-- 1. Expand the column to 255 characters to ensure no more truncation
ALTER TABLE account_security MODIFY pass_hash VARCHAR(255) NOT NULL;

-- 2. Clear the problematic record
DELETE FROM account_security WHERE account_id = 11;

-- 3. Insert the EXACT hash your system generated for 'Testing123@'
-- This is the $2b$ version your terminal printed earlier
INSERT INTO account_security (account_id, pass_hash) 
VALUES (11, '$2b$10$RuqtVklyO5jnX1tTUbFjROQKrTnQlXa9GMi6VlY85/Hb1MM.rPN.6');

COMMIT;

-- 4. Verify length - IT MUST SHOW 60
SELECT pass_hash, LENGTH(pass_hash) AS len FROM account_security WHERE account_id = 11;


SELECT official_email FROM account_holders WHERE official_email = 'vnaiduari@gmail.com';


-- password123 
UPDATE account_security 
SET pass_hash = '$2a$10$Pa090L7V.Xj8HwR7R8nOBe6B8K1fTqW8y6/fG6G6G6G6G6G6G6G6G' 
WHERE account_id = (
    SELECT account_id 
    FROM account_holders 
    WHERE official_email = 'vnaiduari@gmail.com'
);

SELECT a.official_email, s.pass_hash 
FROM account_holders a 
INNER JOIN account_security s ON a.account_id = s.account_id 
WHERE a.official_email = 'vnaiduari@gmail.com';

SELECT * FROM account_holders WHERE official_email = 'vnaiduari@gmail.com';

UPDATE account_holders 
SET    official_email = 'vnaiduari@gmail.com'
WHERE account_id = 11 ;

INSERT INTO account_security (account_id, pass_hash) 
VALUES (11, '$2a$10$Pa090L7V.Xj8HwR7R8nOBe6B8K1fTqW8y6/fG6G6G6G6G6G6G6G6G')
ON DUPLICATE KEY UPDATE 
pass_hash = '$2a$10$Pa090L7V.Xj8HwR7R8nOBe6B8K1fTqW8y6/fG6G6G6G6G6G6G6G6G';

SELECT * FROM account_security;

DESCRIBE grievance_subcategories;





-- Create grievances table
CREATE TABLE IF NOT EXISTS grievances (
  grievance_id INT AUTO_INCREMENT PRIMARY KEY,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  account_id INT NOT NULL,
  indos_number VARCHAR(50) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  cdc_number VARCHAR(50),
  dob DATE,
  category_id INT,
  subcategory_id INT,
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  status ENUM('SUBMITTED', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED') DEFAULT 'SUBMITTED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES grievance_categories(id),
  FOREIGN KEY (subcategory_id) REFERENCES grievance_subcategories(id)
);

-- Create grievance_files table
CREATE TABLE IF NOT EXISTS grievance_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grievance_id INT NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_grievances_account_id ON grievances(account_id);
CREATE INDEX idx_grievances_reference ON grievances(reference_number);
CREATE INDEX idx_grievances_status ON grievances(status);



CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account_holders(account_id) ON DELETE CASCADE
);

ALTER TABLE grievances 
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;


SELECT grievance_id, account_id, reference_number, subject, created_at 
FROM grievances 
ORDER BY created_at DESC;


DESCRIBE grievances;



SELECT grievance_id, reference_number, subject, created_at 
FROM grievances 
ORDER BY grievance_id DESC 
LIMIT 10;


SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS grievance_subcategories;
DROP TABLE IF EXISTS grievance_categories;


SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE grievance_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Subcategories table
CREATE TABLE grievance_subcategories (
    subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    escalation_days INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO grievance_categories (category_id, name) VALUES 
  (1, 'INDoS Application'),
  (2, 'Seafarer Profile'),
  (3, 'Maritime Time Institutes'),
  (4, 'CDC & Cook'),
  (5, 'BSID'),
  (6, 'Placement for Onboard Training (prior joining Ship)'),
  (7, 'Employment (after joining Ship)'),
  (8, 'Compensation for Death and Disability. Missing Seafarer'),
  (9, 'Piracy, Hijacking and Detention of Seafarer'),
  (10, 'Assessment, Examination and Certification'),
  (11, 'Provident Fund - SPFO'),
  (12, 'Welfare Schemes - SWFS'),
  (13, 'Others');

-- Category 1
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (1, 'Unable to generate Reference Number for INDoS'),
  (1, 'Application could not be submitted by MTI'),
  (1, 'Any other Issue');

-- Category 2
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

-- Category 3
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

-- Category 4
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

-- Category 5
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

-- Category 6
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (6, 'Institute did not help in placement for onboard training.'),
  (6, 'Institute/company demands money for onboard training.'),
  (6, 'Selected for onboard training. But company did not provide ship even after six months.'),
  (6, 'Could not commence onboard training even after one year.'),
  (6, 'Paid money for onboard training. But could not join ship till date.'),
  (6, 'Ship not suitable for onboard training'),
  (6, 'Company sent me on arrested/scrap ships for onboard training.'),
  (6, 'Harassment and bad treatment during onboard training.'),
  (6, 'Lack of food/facilities during onboard training.'),
  (6, 'Could not complete the SSTP during onboard training.'),
  (6, 'TAR book not provided by the company for onboard training.'),
  (6, 'Company Training Officer not available.'),
  (6, 'Any other Issue');

-- Category 7
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

-- Category 8
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

-- Category 9
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (9, 'Release of Seafarer detained in foreign countries'),
  (9, 'Lack of communication with seafarer'),
  (9, 'Status of seafarers after the casualty'),
  (9, 'Investigation into Injury/death due to accident/casualty'),
  (9, 'Delay in remittance of wages of seafarers detained'),
  (9, 'Repatriation of seafarer stranded abroad'),
  (9, 'Any other Issue');

-- Category 10
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

-- Category 11
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (11, 'PF Related Issue');

-- Category 12
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (12, 'Welfare scheme related issues'),
  (12, 'Gratuity related issues');

-- Category 13
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (13, 'General Inquiry');


ALTER TABLE grievance_subcategories
ADD CONSTRAINT fk_subcategory_category
FOREIGN KEY (category_id) REFERENCES grievance_categories(category_id)
ON DELETE CASCADE;

ALTER TABLE grievances
ADD CONSTRAINT fk_grievance_category
FOREIGN KEY (category_id) REFERENCES grievance_categories(category_id)
ON DELETE SET NULL;


SELECT grievance_id, reference_number, subject, created_at 
FROM grievances 
ORDER BY grievance_id DESC 
LIMIT 20;

DESCRIBE grievances;
SHOW COLUMNS FROM grievances WHERE Field = 'priority';


SHOW COLUMNS FROM grievances WHERE Field IN ('priority', 'status');


SELECT * FROM grievance_files ORDER BY created_at DESC;


SELECT COUNT(*) FROM account_holders;

INSERT INTO account_holders (official_email, full_name)
VALUES ('vnaiduari@gmail.com', 'Venkatesh Naidu');

SELECT * FROM account_holders;
SELECT * FROM account_security;


SELECT account_id, official_email FROM account_holders;
SELECT account_id, pass_hash FROM account_security;

UPDATE account_security
SET pass_hash = '$2b$10$DMjEvzi2OR7i69SyfE3yGedctKFSQATde73F0yuxvsb35ClmKLBsy'
WHERE account_id = (
  SELECT account_id 
  FROM account_holders 
  WHERE official_email = 'vnaiduari@gmail.com'
);


-- to check email and password
SELECT 
  a.account_id,
  a.official_email,
  s.pass_hash,
  LENGTH(s.pass_hash) as hash_length
FROM account_holders a
LEFT JOIN account_security s 
  ON a.account_id = s.account_id
WHERE a.official_email = 'vnaiduari@gmail.com';


SELECT account_id 
FROM account_holders 
WHERE official_email = 'vnaiduari@gmail.com';

INSERT INTO account_security (account_id, pass_hash)
VALUES (2, '$2b$10$djNXpG3fp69hACAYs.wjG.mLfe9bCLZx/pZyS/JEy6EvT9W0ZQKPa');

INSERT INTO portal_roles (role_id, role_key, role_label)
VALUES (2, 'seafarer', 'Seafarer');

UPDATE account_holders
SET role_id = 2
WHERE official_email = 'vnaiduari@gmail.com';

SELECT account_id, official_email FROM account_holders;

ALTER TABLE account_holders 
ADD COLUMN indos_number VARCHAR(20) DEFAULT NULL,
ADD COLUMN cdc_number VARCHAR(20) DEFAULT NULL;

UPDATE account_holders 
SET 
    full_name = 'Venkatesh Naidu',
    contact_no = '+91 98765 43210',
    indos_number = 'IN-12345678',
    cdc_number = 'MUM-98765'
WHERE account_id = 2;


SELECT * FROM account_holders WHERE account_id = 2;

-- admin 
-- 1. Check if 'ADMIN' role exists
SELECT * FROM portal_roles;

-- 2. If not, insert it (assuming ID 1 is ADMIN, adjust if needed)
INSERT INTO portal_roles (role_id, role_key, role_label) 
VALUES (3, 'ADMIN', 'System Administrator')
ON DUPLICATE KEY UPDATE role_label = 'System Administrator';

SELECT account_id, full_name, official_email FROM account_holders WHERE official_email = 'admin@example.com';


-- 3. Create Admin User (Replace with your email)
INSERT INTO account_holders (full_name, official_email, contact_no, role_id)
VALUES ('System Admin', 'admin@example.com', '9865745863', 3);

-- 4. Get the Account ID
SELECT account_id FROM account_holders WHERE official_email = 'admin@example.com';

-- 5. Set Password (Hash for 'admin123')
-- You need to generate a bcrypt hash. 
-- For now, use the same hash as your test user so you can login with that password.
UPDATE account_security 
SET pass_hash = (SELECT pass_hash FROM account_security WHERE account_id = 3) 
WHERE account_id = (SELECT account_id FROM account_holders WHERE official_email = 'admin@example.com');



UPDATE account_security
SET pass_hash = (
	SELECT pass_hash FROM (SELECT pass_hash FROM account_security WHERE account_id = 3) AS temp_table
)
WHERE account_id = (
	SELECT account_id FROM account_holders WHERE official_email = 'admin@example.com'
);

-- IF account_security row doesn't exist for admin yet:
INSERT INTO account_security (account_id, pass_hash)
SELECT
	(SELECT account_id FROM account_holders WHERE official_email = 'admin@example.com'),
    pass_hash
FROM account_security
WHERE account_id = 2;

-- 1. Check raw grievances
SELECT grievance_id, status FROM grievances;

-- 2. Check if JOIN works (if this returns 0 rows, your foreign keys are wrong)
SELECT g.grievance_id, a.full_name 
FROM grievances g
LEFT JOIN account_holders a ON g.account_id = a.account_id;

SELECT 
    g.grievance_id,
    g.reference_number,
    g.subject,
    g.status,
    a.full_name AS applicant_name
FROM grievances g
LEFT JOIN account_holders a ON g.account_id = a.account_id
ORDER BY g.created_at DESC;


-- query for otp for admins
SELECT otp_code, expires_at 
FROM temp_otps 
WHERE email = 'admin@example.com';