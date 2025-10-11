import 'server-only';

import { prisma } from '@/lib/prisma';
import { Result, success, failure } from '@/lib/result';
import { getSession } from '@/lib/session';
import bcryptjs from 'bcryptjs';
import { SignupInput } from './schema';

interface User {
  id: string;
  displayName?: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
}

export async function signup(input: SignupInput): Promise<Result<User>> {
  const { name, email, password } = input;

  if (!email) {
    console.error('Signup error: Email is missing');
    return failure('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`Signup error: Invalid email format for email: ${email}`);
    return failure('Invalid email format');
  }

  const normalisedEmail = email.toLowerCase().trim();

  // Ensure password present
  if (!password) {
    return failure('Password is required');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalisedEmail }
  });

  if (existingUser) {
    console.error(`Signup error: User with email ${normalisedEmail} already exists`);
    return failure('A user with this email already exists');
  }

  // Hash password and create user
  const hashedPassword = await bcryptjs.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      displayName: name,
      email: normalisedEmail,
      passwordHash: hashedPassword,
      walletAddress: null
    },
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  const session = await getSession();
  session.user = { id: user.id };
  await session.save();

  return success(user as User);
}

/*
 * Test Notes / Steps to Reproduce:
 *
 * 1. Missing Email:
 *    Call `signup` with `email: null` or `email: undefined`.
 *    Expected: Returns failure with message "Email is required".
 *
 * 2. Invalid Email Format:
 *    Call `signup` with `email: "invalid-email"` or `email: "test@.com"`.
 *    Expected: Returns failure with message "Invalid email format".
 *
 * 3. Existing User Email:
 *    Register a user with a specific email (e.g., "test@example.com").
 *    Attempt to register another user with the same email.
 *    Expected: Returns failure with message "A user with this email already exists".
 *
 * 4. Valid Signup:
 *    Call `signup` with a valid, unique email and password.
 *    Expected: Returns success with user data.
 *
 * 5. Email Normalization:
 *    Call `signup` with `email: "  Test@Example.com  "`.
 *    Expected: User created with email "test@example.com" (trimmed and lowercased).
 */