import { z } from "zod";
import { ObjectId } from "mongodb";

export const UserRoleSchema = z.enum(["buyer", "seller", "admin", "customer"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string().optional(),
  email: z
    .string({ message: "Email address is required" })
    .email("Please provide a valid email address (e.g., user@example.com)")
    .toLowerCase()
    .trim(),
  name: z.string().min(2, "Scholar name must be at least 2 characters").trim().optional(),
  passwordHash: z.string().min(1, "Password hash is required"),
  role: UserRoleSchema.default("buyer"),
  sellerName: z.string().min(2, "Bookstore or dealership name must be at least 2 characters").trim().optional(),
  sellerBio: z.string().trim().optional(),
  specialtyEra: z.string().trim().optional(),
  isApprovedSeller: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type IUser = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  email: z
    .string({ message: "Email address is required" })
    .email("Please provide a valid email address (e.g., user@example.com)")
    .toLowerCase()
    .trim(),
  name: z.string().min(2, "Scholar name must be at least 2 characters").trim().optional(),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
    .regex(/[0-9]/, "Password must contain at least one numerical digit (0-9)"),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const LoginUserSchema = z.object({
  email: z
    .string({ message: "Email address is required" })
    .email("Please provide a valid email address (e.g., user@example.com)")
    .toLowerCase()
    .trim(),
  password: z.string({ message: "Password is required" }).min(1, "Password is required to authenticate"),
});

export type LoginUserInput = z.infer<typeof LoginUserSchema>;

export const SellerOnboardingSchema = z.object({
  sellerName: z
    .string({ message: "Bookstore or dealership name is required" })
    .min(2, "Bookstore or dealership name must be at least 2 characters")
    .trim(),
  sellerBio: z
    .string()
    .min(10, "Archival statement and dealer bio must be at least 10 characters")
    .trim()
    .optional(),
  specialtyEra: z.string().trim().optional(),
});

export type SellerOnboardingInput = z.infer<typeof SellerOnboardingSchema>;

export const SafeUserSchema = UserSchema.omit({ passwordHash: true });
export type ISafeUser = z.infer<typeof SafeUserSchema>;
