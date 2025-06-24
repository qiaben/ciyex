import { z } from "zod";

export const ratingSchema = z.object({
  patient_id: z.string(),
  staff_id: z.string(),
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters long")
    .max(500, "Review must not exceed 500 characters"),
});

export type RatingFormValues = z.infer<typeof ratingSchema>; 