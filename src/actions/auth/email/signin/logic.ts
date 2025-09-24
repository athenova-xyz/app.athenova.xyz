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

  // Verify password
  const isValidPassword = await bcryptjs.compare(password, user.passwordHash ?? '');
  if (!isValidPassword) {
    console.error('Signin error: Invalid password');
    return failure('Invalid credentials');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _password, ...userWithoutPassword } = user;

  // Set session
  const session = await getSession();
  session.user = { id: userWithoutPassword.id };
  await session.save();

  return success(userWithoutPassword as UserWithoutPassword);
}
