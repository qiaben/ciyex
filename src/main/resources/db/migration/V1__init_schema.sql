-- V1__init_schema.sql

-- 1. Create 'orgs' table
CREATE TABLE IF NOT EXISTS orgs (
                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    address VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    org_name VARCHAR(255) NOT NULL,
    postal_code VARCHAR(255),
    state VARCHAR(255),
    CONSTRAINT UK_org_name UNIQUE (org_name)
    );

-- 2. Create 'facilities' table
CREATE TABLE IF NOT EXISTS facilities (
                                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                          facility_name VARCHAR(255) NOT NULL,
    org_id BIGINT NOT NULL,
    CONSTRAINT FK_facility_org FOREIGN KEY (org_id) REFERENCES orgs(id)
    );

-- 3. Create 'users' table
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     city VARCHAR(255),
    country VARCHAR(255),
    date_of_birth DATE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255),
    postal_code VARCHAR(255),
    profile_image VARCHAR(255),
    security_answer VARCHAR(255),
    security_question VARCHAR(255),
    state VARCHAR(255),
    street VARCHAR(255),
    CONSTRAINT UK_user_email UNIQUE (email)
    );

-- 4. Create 'user_facility_roles' table
CREATE TABLE IF NOT EXISTS user_facility_roles (
                                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                   role ENUM('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT', 'RECEPTIONIST', 'SUPER_ADMIN') NOT NULL,
    facility_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT FK_userfacility_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_userfacility_facility FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );
