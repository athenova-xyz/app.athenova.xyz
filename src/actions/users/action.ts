'use server';
import { actionClient } from '@/lib/action';
import { getOrUpdateCurrentUser } from './logic';

export const usersAction = actionClient.metadata({ actionName: 'users.getOrUpdate' }).action(async () => {
  try {
    const res = await getOrUpdateCurrentUser();
    if (!res) throw new Error('Authentication required', { cause: { internal: true } });
    return res;
  } catch (err) {
    const error = err as Error;
    const cause = error.cause as { internal: boolean } | undefined;

    if (cause?.internal && error.message === 'Authentication required') {
      throw new Error(error.message);
    }

    console.error('usersAction failed:', error);
    throw new Error('Something went wrong');
  }
});
