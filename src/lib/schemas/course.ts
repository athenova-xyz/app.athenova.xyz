import { z } from "zod";

export const CourseSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(256, "Title must be 256 characters or less"),
    description: z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(10000, "Description must be 10,000 characters or less"),
});

export type CourseInput = z.infer<typeof CourseSchema>;
