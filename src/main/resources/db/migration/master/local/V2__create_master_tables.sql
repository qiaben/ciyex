-- Flyway migration: create master schema tables in public schema for PostgreSQL
-- Keeps columns compatible with JPA entities (User, Org, UserOrgRole)
BEGIN;

-- Orgs
CREATE TABLE IF NOT EXISTS public.orgs (
  id BIGSERIAL PRIMARY KEY,
  address VARCHAR(255),
  city VARCHAR(255),
  country VARCHAR(255),
  org_name VARCHAR(255) NOT NULL,
  postal_code VARCHAR(255),
  state VARCHAR(255),
  CONSTRAINT uk_org_name UNIQUE (org_name)
);

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  middle_name VARCHAR(255),
  date_of_birth DATE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(255),
  profile_image VARCHAR(255),
  street VARCHAR(255),
  street2 VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  postal_code VARCHAR(255),
  country VARCHAR(255),
  security_question VARCHAR(255),
  security_answer VARCHAR(255)
);

-- User-Org Roles
CREATE TABLE IF NOT EXISTS public.user_org_roles (
  id BIGSERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  org_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_uor_org FOREIGN KEY (org_id) REFERENCES public.orgs(id),
  CONSTRAINT fk_uor_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);

COMMIT;
