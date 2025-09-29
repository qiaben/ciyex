INSERT INTO public.orgs (address, city, country, org_name, postal_code, state, status) VALUES
                                                                                   ('123 Main St', 'Denver', 'USA', 'Qiaben Health', '80202', 'CO', 'ACTIVE'),
                                                                                   ('456 Elm St', 'Austin', 'USA', 'MediPlus', '73301', 'TX', 'ACTIVE'),
                                                                                   ('789 Oak St', 'Seattle', 'USA', 'CareWell', '98101', 'WA', 'ACTIVE');

-- Password: Password@123
INSERT INTO public.users (id, city, country, date_of_birth, email, first_name, last_name, middle_name, password, phone_number, postal_code, profile_image, security_answer, security_question, state, street, street2) VALUES (3, 'Seattle', 'USA', '1978-03-09', 'carol@example.com', 'Carol', 'Williams', 'A', '$2a$10$ahU0XEA0CXaNasoPiqjNXeoDi.YrFqyMo5RESPpzpCL5hvMe71dm2', '206-555-0122', '98101', 'carol.png', 'Green', 'What is your favorite color?', 'WA', '300 Maple Rd', null);
INSERT INTO public.users (id, city, country, date_of_birth, email, first_name, last_name, middle_name, password, phone_number, postal_code, profile_image, security_answer, security_question, state, street, street2) VALUES (2, 'Austin', 'USA', '1990-11-22', 'bob@example.com', 'Bob', 'Smith', null, '$2a$10$ahU0XEA0CXaNasoPiqjNXeoDi.YrFqyMo5RESPpzpCL5hvMe71dm2', '512-555-0111', '73301', 'bob.png', 'Rover', 'What is your pet''s name?', 'TX', '200 Pine St', 'Apt 4B');
INSERT INTO public.users (id, city, country, date_of_birth, email, first_name, last_name, middle_name, password, phone_number, postal_code, profile_image, security_answer, security_question, state, street, street2) VALUES (1, 'Denver', 'USA', '1985-07-15', 'alice@example.com', 'Alice', 'Johnson', 'M', '$2a$10$ahU0XEA0CXaNasoPiqjNXeoDi.YrFqyMo5RESPpzpCL5hvMe71dm2', '303-555-0100', '80202', 'alice.png', 'Blue', 'What is your favorite color?', 'CO', '100 Cherry Ln', null);

INSERT INTO public.user_org_roles (role, org_id, user_id) VALUES
                                                              ('SUPER_ADMIN', 1, 1),
                                                              ('PROVIDER', 1, 2),
                                                              ('PATIENT', 1, 3),
                                                              ('BILLER', 2, 2),
                                                              ('NURSE', 3, 1),
                                                              ('RECEPTIONIST', 3, 3);

