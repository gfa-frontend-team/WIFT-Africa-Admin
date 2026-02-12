import { z } from "zod";
import { EventType, LocationType, EventStatus } from "@/types";

export const eventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must be less than 5000 characters"),
    type: z.nativeEnum(EventType),
    chapterId: z.string().optional(), // Empty string = Global event
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),
    timezone: z.string().min(1, "Timezone is required"),
    location: z
      .object({
        type: z.nativeEnum(LocationType),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        virtualUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
        virtualPlatform: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        if (
          data.type === LocationType.PHYSICAL ||
          data.type === LocationType.HYBRID
        ) {
          if (!data.address)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Address is required for physical/hybrid events",
              path: ["address"],
            });
          if (!data.city)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "City is required",
              path: ["city"],
            });
          if (!data.country)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Country is required",
              path: ["country"],
            });
        }
        if (
          data.type === LocationType.VIRTUAL ||
          data.type === LocationType.HYBRID
        ) {
          if (!data.virtualUrl)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Virtual URL is required for virtual/hybrid events",
              path: ["virtualUrl"],
            });
        }
      }),
    // capacity: z.number().int().positive('Capacity must be positive').optional().nullable(),
    capacity: z.preprocess((val) => {
      // Handle empty string, null, undefined, or NaN
      if (
        val === "" ||
        val === null ||
        val === undefined ||
        (typeof val === "number" && isNaN(val))
      ) {
        return undefined;
      }
      return Number(val);
    }, z.number().int().positive("Capacity must be positive").optional()),
    coverImage: z
      .string()
      .url("Invalid image URL")
      .optional()
      .or(z.literal("")),
    tags: z.array(z.string()),
    status: z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type EventFormValues = z.infer<typeof eventSchema>;
