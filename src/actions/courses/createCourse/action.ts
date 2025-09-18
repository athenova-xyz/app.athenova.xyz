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

        try {
            const createdCourseResult = await createCourse(parsedInput, userId);
            if (createdCourseResult.success) {
                return createdCourseResult.data;
            }

            throw new Error(createdCourseResult.error);
        } catch (error) {
            console.error('Course creation error:', error, { userId });
            throw new Error('Something went wrong', { cause: error });
        }
    });
