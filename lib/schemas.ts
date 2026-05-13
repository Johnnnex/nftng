import { z } from "zod";

export const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
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

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  x_handle: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
