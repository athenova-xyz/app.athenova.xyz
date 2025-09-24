import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(256, 'Title is too long'),
  description: z.string().trim().min(1, 'Description is required').max(10000, 'Description is too long')
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
