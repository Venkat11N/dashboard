CREATE DATABASE maritime_portal;
USE maritime_portal;

CREATE TABLE portal_roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_key VARCHAR(50) UNIQUE NOT NULL,
  role_label VARCHAR(100) NOT NULL
);

CREATE TABLE account_holders (
  account_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  official_email VARCHAR(150) UNIQUE NOT NULL,
  contact_no VARCHAR(20),
  role_id INT,
  FOREIGN KEY (role_id) REFERENCES portal_roles(role_id)
);

CREATE TABLE account_security (
  security_id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT,
  pass_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (account_id) REFERENCES account_holders(account_id) ON DELETE CASCADE
);

CREATE TABLE temp_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  otp_code VARCHAR(10),
  expires_at DATETIME
);

CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT,
  token TEXT,
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account_holders(account_id) ON DELETE CASCADE
);

CREATE TABLE grievance_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE grievance_subcategories (
  subcategory_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  priority VARCHAR(50) DEFAULT 'Medium',
  escalation_days INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES grievance_categories(category_id) ON DELETE CASCADE
);

CREATE TABLE grievances (
  grievance_id INT AUTO_INCREMENT PRIMARY KEY,
  reference_number VARCHAR(50) UNIQUE NOT NULL,
  account_id INT,
  subject VARCHAR(255),
  description TEXT,
  status ENUM('SUBMITTED','IN_PROGRESS','RESOLVED','REJECTED') DEFAULT 'SUBMITTED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account_holders(account_id)
);

CREATE TABLE grievance_files (
  file_id INT AUTO_INCREMENT PRIMARY KEY,
  grievance_id INT,
  file_path VARCHAR(255),
  file_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id) ON DELETE CASCADE
);

INSERT INTO grievance_categories (name) VALUES  
('INDoS Application'),
('Seafarer Profile'),
('Maritime Time Institutes'),
('CDC & Cook'),
('BSID'),
('Placement for Onboard Training (prior joining Ship)'),
('Employment (after joining Ship)'),
('Compensation for Death and Disability. Missing Seafarer'),
('Piracy, Hijacking and Detention of Seafarer'),
('Assessment, Examination and Certification'),
('Provident Fund - SPFO'),
('Welfare Schemes - SWFS'),
('Others');
  
SET SQL_SAFE_UPDATES = 0;
DELETE FROM grievance_subcategories;
DELETE FROM grievance_categories;
SET SQL_SAFE_UPDATES = 1;
  
  INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (1, 'Unable to generate Reference Number for INDoS'),
  (1, 'Application could not be submitted by MTI'),
  (1, 'Any other Issue');
  
  
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
  (4, 'Any other Issue');
  
  
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
  
  
  INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (9, 'Release of Seafarer detained in foreign countries'),
  (9, 'Lack of communication with seafarer'),
  (9, 'Status of seafarers after the casualty'),
  (9, 'Investigation into Injury/death due to accident/casualty'),
  (9, 'Delay in remittance of wages of seafarers detained'),
  (9, 'Repatriation of seafarer stranded abroad'),
  (9, 'Any other Issue');
  
  
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


INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (11, 'PF Related Issue');

-- Category 12
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (12, 'Welfare scheme related issues'),
  (12, 'Gratuity related issues');

-- Category 13
INSERT INTO grievance_subcategories (category_id, name) VALUES 
  (13, 'General Inquiry');

SELECT category_id, name FROM grievance_categories;


INSERT INTO grievance_categories (name) VALUES 
('INDoS Application'),
('Seafarer Profile'),
('Maritime Time Institutes'),
('CDC & Cook'),
('BSID'),
('Placement for Onboard Training (prior joining Ship)'),
('Employment (after joining Ship)'),
('Compensation for Death and Disability. Missing Seafarer'),
('Piracy, Hijacking and Detention of Seafarer'),
('Assessment, Examination and Certification'),
('Provident Fund - SPFO'),
('Welfare Schemes - SWFS'),
('Others');

SET SQL_SAFE_UPDATES = 0;
DELETE FROM grievance_subcategories;
DELETE FROM grievance_categories;

ALTER TABLE grievance_categories AUTO_INCREMENT = 1;
ALTER TABLE grievance_subcategories AUTO_INCREMENT = 1;

INSERT INTO grievance_categories (name) VALUES 
('INDoS Application'),
('Seafarer Profile'),
('Maritime Time Institutes'),
('CDC & Cook'),
('BSID'),
('Placement for Onboard Training (prior joining Ship)'),
('Employment (after joining Ship)'),
('Compensation for Death and Disability. Missing Seafarer'),
('Piracy, Hijacking and Detention of Seafarer'),
('Assessment, Examination and Certification'),
('Provident Fund - SPFO'),
('Welfare Schemes - SWFS'),
('Others');



INSERT INTO portal_roles (role_key, role_label)
VALUES 
('ADMIN', 'Administrator'),
('USER', 'Normal User');


INSERT INTO account_holders (full_name, official_email, contact_no, role_id)
VALUES ('Admin User', 'admin@maritime.gov', '9999999999', 1);

INSERT INTO account_holders (full_name, official_email, contact_no, role_id)
VALUES ('Test User', 'vnaiduari@gmail.com', '8888888888', 2);

INSERT INTO account_security (account_id, pass_hash)
VALUES 
(1, '$2b$10$qc8ua2ruPhXG2vsh29Jcu.rtHmNbce/aD/fhzYHVdqy9aPg6BFwLe'),
(2, '$2b$10$qc8ua2ruPhXG2vsh29Jcu.rtHmNbce/aD/fhzYHVdqy9aPg6BFwLe');

SELECT otp_code, expires_at 
FROM temp_otps 
WHERE email = 'admin@maritime.gov';