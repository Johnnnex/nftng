import { z } from "zod";

export const registerSchema = z.object({
  alias: z.string().min(1, "Web3 alias is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  gender: z.string().min(1, "Please select your gender"),
  country: z.string().min(1, "Please select your country"),
  city: z.string().min(1, "City is required"),
  twitter_handle: z.string().optional(),
  what_describes_you: z.string().min(1, "Please select an option"),
  topics_of_interest: z.array(z.string()).min(1, "Please select at least one topic"),
  looking_forward_to: z.string().optional(),
  first_time_attendee: z.string().min(1, "Please select an option"),
  how_did_you_hear: z.string().optional(),
  agree_to_terms: z.boolean().refine((v) => v === true, {
    message: "Please agree to the terms to continue",
  }),
  events: z.array(z.string()).min(1, "Please select at least one event"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
