'use server';

import { authActionClient } from '@/lib/action';
import { createCourse } from './logic';
import { createCourseSchema } from './schema';

export const createCourseAction = authActionClient
    .inputSchema(createCourseSchema)
    .metadata({ actionName: 'createCourse' })
    .action(async ({ parsedInput, ctx }) => {
        const userId = ctx.session.user?.id;
        if (!userId) {
            throw new Error('Not Authorised');
        }

        const result = await createCourse(parsedInput, userId);

        if (result.success) {
            return result.data;
        }

        throw new Error(result.error, { cause: { internal: true } });
    });
