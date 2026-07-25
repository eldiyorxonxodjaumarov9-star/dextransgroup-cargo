import { z } from "zod";

export const cargoItemSchema = z
  .object({
    name: z.string().min(2, "Tovar nomi kamida 2 ta belgidan iborat bo‘lsin"),
    trackNumber: z.string().min(3, "Trek raqami majburiy"),
    entryType: z.enum(["MANUAL", "PDF"]).default("MANUAL"),
    imageUrl: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) =>
          !value ||
          value.startsWith("https://") ||
          value.startsWith("http://") ||
          value.startsWith("data:image/"),
        { message: "Rasm URL noto‘g‘ri" }
      ),
    description: z.string().optional(),
    price: z.string().optional(),
    category: z.enum(["NEW", "IN_TRANSIT", "ARRIVED"]),
    status: z.enum([
      "CHINA_WAREHOUSE",
      "DEPARTED",
      "AT_BORDER",
      "ARRIVED_TASHKENT",
    ]),
    date: z.string().min(1, "Sana majburiy"),
    etaDate: z.string().optional().or(z.literal("")),
    telegramUrl: z.string().url("Telegram havolasi noto‘g‘ri").optional().or(z.literal("")),
    locationUrl: z.string().url("Lokatsiya havolasi noto‘g‘ri").optional().or(z.literal("")),
    chinaAddress: z.string().optional(),
    notes: z.string().optional(),
    warehouseId: z.string().optional().or(z.literal("")),
    operatorId: z.string().optional().or(z.literal("")),
    pdfUrl: z.string().optional().or(z.literal("")),
    pdfFileName: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.entryType === "PDF" && (!data.pdfUrl || data.pdfUrl.trim().length < 3)) {
      ctx.addIssue({
        code: "custom",
        message: "PDF fayl yuklash majburiy",
        path: ["pdfUrl"],
      });
    }
  });

export const warehouseSchema = z
  .object({
    name: z.string().min(2, "Ombor nomi majburiy"),
    region: z.enum(["CHINA", "TASHKENT"]),
    entryType: z.enum(["MANUAL", "PDF"]).default("MANUAL"),
    city: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    telegramUrl: z.string().url("Telegram havolasi noto‘g‘ri").optional().or(z.literal("")),
    locationUrl: z.string().url("Lokatsiya havolasi noto‘g‘ri").optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    province: z.string().optional().or(z.literal("")),
    district: z.string().optional().or(z.literal("")),
    receiver: z.string().optional().or(z.literal("")),
    phone2: z.string().optional().or(z.literal("")),
    workingHours: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    latitude: z.union([z.number(), z.string(), z.null()]).optional(),
    longitude: z.union([z.number(), z.string(), z.null()]).optional(),
    pdfUrl: z.string().optional().or(z.literal("")),
    pdfFileName: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.entryType === "PDF") {
      if (!data.pdfUrl || data.pdfUrl.trim().length < 3) {
        ctx.addIssue({
          code: "custom",
          message: "PDF fayl yuklash majburiy",
          path: ["pdfUrl"],
        });
      }
      return;
    }

    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Shahar majburiy",
        path: ["city"],
      });
    }
    if (!data.address || data.address.trim().length < 5) {
      ctx.addIssue({
        code: "custom",
        message: "To‘liq manzil majburiy",
        path: ["address"],
      });
    }
    if (!data.phone || data.phone.trim().length < 7) {
      ctx.addIssue({
        code: "custom",
        message: "Telefon raqami majburiy",
        path: ["phone"],
      });
    }
  });

export const operatorSchema = z.object({
  name: z.string().min(2, "Ism majburiy"),
  phone: z.string().min(7, "Telefon raqami majburiy"),
  telegram: z.string().optional(),
  isActive: z.boolean(),
  warehouseId: z.string().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Login majburiy"),
  password: z.string().min(1, "Parol majburiy"),
});
