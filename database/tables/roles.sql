-- Roles Table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name TEXT NOT NULL CHECK (role_name IN ('PARENT', 'TEACHER', 'STUDENT'))
);