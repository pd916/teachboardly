import { z } from "zod";

export const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(18, "Password can't exceed 100 characters"),
});
