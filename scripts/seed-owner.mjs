import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const email = process.env.OWNER_EMAIL;
const password = process.env.OWNER_PASSWORD;

if (!email || !password) {
  console.error('OWNER_EMAIL and OWNER_PASSWORD must be set in env.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await bcrypt.hash(password, 12);

const existing = await sql`SELECT id FROM users WHERE email = ${email}` as { id: string }[];

if (existing.length > 0) {
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE email = ${email}`;
  console.log(`Updated password for existing owner: ${email}`);
} else {
  await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
  `;
  console.log(`Seeded new owner: ${email}`);
}
