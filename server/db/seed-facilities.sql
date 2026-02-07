-- Fake facilities: most with address, some without.
-- Table: facilities (id, name, address, createdAt, updatedAt)
-- Run against your MySQL DB (e.g. mysql -u user -p dbname < server/db/seed-facilities.sql)

INSERT INTO facilities (name, address, createdAt, updatedAt) VALUES
('DC Vault Training Center', '{"line1":"2100 East Capitol St NE","line2":null,"city":"Washington","state":"DC","country":"US","zip":"20002"}', NOW(), NOW()),
('Prince George''s Sports & Learning Complex', '{"line1":"8001 Sheriff Rd","line2":null,"city":"Landover","state":"MD","country":"US","zip":"20785"}', NOW(), NOW()),
('Virginia Beach Sports Center', '{"line1":"1045 19th St","line2":null,"city":"Virginia Beach","state":"VA","country":"US","zip":"23451"}', NOW(), NOW()),
('Penn State Multi-Sport Facility', '{"line1":"1 University Dr","line2":null,"city":"State College","state":"PA","country":"US","zip":"16801"}', NOW(), NOW()),
('Ocean Breeze Athletic Complex', '{"line1":"625 Capodanno Blvd","line2":null,"city":"Staten Island","state":"NY","country":"US","zip":"10305"}', NOW(), NOW()),
('Randall''s Island Track & Field', '{"line1":"1 Randall''s Island","line2":null,"city":"New York","state":"NY","country":"US","zip":"10035"}', NOW(), NOW()),
('Armory Track & Field Center', '{"line1":"216 Fort Washington Ave","line2":null,"city":"New York","state":"NY","country":"US","zip":"10032"}', NOW(), NOW()),
('JDL Fast Track', '{"line1":"2500 Empire Dr","line2":null,"city":"Winston-Salem","state":"NC","country":"US","zip":"27103"}', NOW(), NOW()),
('Gill Athletics Indoor Track', '{"line1":"1706 N Main St","line2":null,"city":"Champaign","state":"IL","country":"US","zip":"61820"}', NOW(), NOW()),
('Demirjian Indoor Track', '{"line1":"2330 E 56th St","line2":null,"city":"Chicago","state":"IL","country":"US","zip":"60637"}', NOW(), NOW()),
('University of Arkansas Randal Tyson Center', '{"line1":"1598 S Razorback Rd","line2":null,"city":"Fayetteville","state":"AR","country":"US","zip":"72701"}', NOW(), NOW()),
('Albuquerque Convention Center', '{"line1":"401 2nd St NW","line2":null,"city":"Albuquerque","state":"NM","country":"US","zip":"87102"}', NOW(), NOW()),
('Nampa Jacksons Track', '{"line1":"16103 Idaho Center Blvd","line2":null,"city":"Nampa","state":"ID","country":"US","zip":"83687"}', NOW(), NOW()),
('Local High School Gym', NULL, NOW(), NOW()),
('Community Rec Center', NULL, NOW(), NOW()),
('Unnamed Outdoor Pit', NULL, NOW(), NOW()),
('Practice Venue TBD', NULL, NOW(), NOW());
