'use server';

import { authActionClient } from '@/lib/action';
import { createCourse } from './logic';
import { createCourseSchema } from './schema';

export const createCourseAction = authActionClient
  .inputSchema(createCourseSchema)
  .metadata({ actionName: 'createCourse' })
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx.session.user.id;

    try {
      const result = await createCourse(parsedInput, userId);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error, { cause: { internal: true } });
    } catch (err) {
      const error = err as Error;
      const cause = error.cause as { internal: boolean } | undefined;

      if (cause?.internal) {
        throw new Error(error.message);
      }

      console.error('Create course error:', error, { userId });
      throw new Error('Something went wrong');
    }
  });
