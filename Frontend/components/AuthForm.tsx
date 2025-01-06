import { z } from 'zod';

export const authFormSchema = (type: string) => {
  const baseSchema = {
    email: z.string().email("Invalid email address").nonempty("Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  };

  if (type === 'sign-up') {
    return z.object({
      ...baseSchema,
      firstName: z.string().nonempty("First name is required"),
      lastName: z.string().nonempty("Last name is required"),
    });
  } else if (type === 'sign-in') {
    return z.object({
      ...baseSchema,
    });
  }

  return z.object(baseSchema); // Default case (should not happen)
};
