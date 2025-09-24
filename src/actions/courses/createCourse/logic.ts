import 'server-only';

import { prisma } from '@/lib/prisma';
import { Result, success } from '@/lib/result';
import { CreateCourseInput } from './schema';
import type { Course } from '@prisma/client';

export async function createCourse(input: CreateCourseInput, userId: string): Promise<Result<Course>> {
  const course = await prisma.course.create({
    data: {
      title: input.title,
      description: input.description,
      authorId: userId
    }
  });

  return success(course);
}
