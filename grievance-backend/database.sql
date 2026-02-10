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

-- category and subcategoery
 
INSERT INTO grievance_categories (category_id, name) VALUES  
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
  

INSERT INTO grievance_subcategories (category_id, name) VALUES  
  (1, 'Unable to generate Reference Number for INDoS'),
  (1, 'Application could not be submitted by MTI'),
  (1, 'Any other Issue'),
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
  (4, 'Any other Issue'),
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
  (6, 'Any other Issue'),
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


INSERT INTO grievance_subcategories (category_id, name) VALUES  
  (8, 'Death compensation not paid as per the agreement'),
  (8, 'Disability compensation not paid as per the agreement'),
  (8, 'Delay in payment of compensation'),
  (8, 'Presumed death certificate in case of Missing persons'),
  (8, 'Lost overboard'),
  (8, 'Person missing from ship'),
  (8, 'Repatriation of mortal remains'),
  (8, 'Loss of personal belongings'),
  (8, 'Any other Issue'),
  (9, 'Release of Seafarer detained in foreign countries'),
  (9, 'Lack of communication with seafarer'),
  (9, 'Status of seafarers after the casualty'),
  (9, 'Investigation into Injury/death due to accident/casualty'),
  (9, 'Delay in remittance of wages of seafarers detained'),
  (9, 'Repatriation of seafarer stranded abroad'),
  (9, 'Any other Issue'),
  (11, 'PF Related Issue'),
  (12, 'Walfare scheme related issues'),
  (12, 'Gratuity related issues'),
  (13, 'General Inquiry');