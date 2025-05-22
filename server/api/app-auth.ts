// This file will handle custom username/password authentication for 'app_users'
import bcrypt from 'bcryptjs'; // Use bcryptjs for client-side compatibility if needed, otherwise bcrypt
import jwt from 'jsonwebtoken';
import pool from '~/server/database/db'; // Adjust path if necessary

// IMPORTANT: This JWT_SECRET should be a strong, randomly generated string
// stored securely in your environment variables (e.g., .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_please_change_me';

export default defineEventHandler(async (event) => {
  // Get the full request URL path
  const fullPath = event.node.req.url;

  // Extract the relevant part of the path for routing within this handler
  // For example, if fullPath is '/api/app-auth/register', we want 'register'
  const routeSegment = fullPath?.split('/').pop();

  const { firstName, lastName, username, password } = await readBody(event);

  // --- Common Input Validation ---
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required.',
    });
  }

  if (routeSegment === 'register') {
    // --- APP_USER REGISTRATION ---
    if (!firstName || !lastName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'First name and last name are required for username registration.',
      });
    }

    try {
      // Check if username already exists
      const userExists = await pool.query('SELECT id FROM app_users WHERE username = $1', [username]);
      if (userExists.rows.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Username already registered.',
        });
      }

      // Hash the password
      const saltRounds = 10; // Recommended salt rounds for bcrypt
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert into app_users table
      // IMPORTANT: Ensure your 'app_users' table has 'first_name' and 'last_name' columns
      const result = await pool.query(
        `INSERT INTO app_users (first_name, last_name, username, encrypted_password, created_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, first_name, last_name`,
        [firstName, lastName, username, hashedPassword],
      );

      return { user: result.rows[0], type: 'app_user', message: 'Username registration successful!' };
    } catch (err: any) {
      console.error('Server-side username registration error:', err);
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: err.statusMessage || err.message || 'Internal server error during username registration.',
      });
    }
  } else if (routeSegment === 'login') {
    // --- APP_USER LOGIN ---
    try {
      const result = await pool.query('SELECT id, username, encrypted_password FROM app_users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid credentials.',
        });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.encrypted_password);
      if (!validPassword) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid credentials.',
        });
      }

      // Generate JWT for custom app_user session
      const token = jwt.sign(
        { app_user_id: user.id, username: user.username, user_type: 'app_user' },
        JWT_SECRET,
        { expiresIn: '7d' }, // Token expires in 7 days
      );

      return { token, user: { id: user.id, username: user.username }, type: 'app_user', message: 'Username login successful!' };
    } catch (err: any) {
      console.error('Server-side username login error:', err);
      throw createError({
        statusCode: err.statusCode || 500,
        statusMessage: err.statusMessage || err.message || 'Internal server error during username login.',
      });
    }
  } else {
    // Handle other methods or invalid paths to this route
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed or Invalid Path.',
    });
  }
});
