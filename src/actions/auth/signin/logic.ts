import 'server-only';

import { prisma } from '@/lib/prisma';
import { Result, success, failure } from '@/lib/result';
import bcryptjs from 'bcryptjs';
import { SigninInput } from './schema';
import { getSession } from '@/lib/session';

type UserWithoutPassword = {
  id: string;
  email: string | null;
  role: string;
  displayName?: string | null;
};

export async function signin(input: SigninInput): Promise<Result<UserWithoutPassword>> {
  const { email, password } = input;

  const normalisedEmail = email.trim().toLowerCase();

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalisedEmail },
    select: {
      id: true,
      email: true,
      displayName: true,
      passwordHash: true,
      role: true
    }
  });

  if (!user) {
    console.error('Signin error: User not found');
    return failure('Invalid credentials');
  }

  if (!user.passwordHash) {
    console.error('Signin error: No password set for user');
    return failure('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await bcryptjs.compare(password, user.passwordHash);
  if (!isValidPassword) {
    console.error('Signin error: Invalid password');
    return failure('Invalid credentials');
  }

  const { passwordHash: _password, ...userWithoutPassword } = user;

  // Set session
  try {
    const session = await getSession();
    session.user = { id: userWithoutPassword.id };
    await session.save();
  } catch (error) {
    console.error('Signin error: Failed to set or save session:', error);
    return failure('An unexpected error occurred. Please try again.');
  }

  return success(userWithoutPassword);
}

/*
 * Testing Notes:
 *
 * To test with invalid credentials:
 *   - Provide an email that does not exist in the database.
 *   - Provide a valid email but an incorrect password.
 *   - In both cases, the expected outcome is a 'failure' result with the message 'Invalid credentials'.
 *     The console should log a more specific error (e.g., 'User not found' or 'Invalid password').
 *
 * To test with successful sign-in:
 *   - Provide a valid email and the correct password for an existing user.
 *   - The expected outcome is a 'success' result containing the user's information (without passwordHash).
 *   - A session should be successfully created and saved.
 */