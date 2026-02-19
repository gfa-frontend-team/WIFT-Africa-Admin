"use client";

// import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Admin, AdminRole } from "@/types";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useChapters } from "@/lib/hooks/queries/useChapters";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { getCountryIsoCode } from "@/lib/utils/countryMapping";
import Image from "next/image";

// Schema
const staffSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    role: z.nativeEnum(AdminRole),
    chapterId: z.string().optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional()
      .or(z.literal("")),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If role is CHAPTER_ADMIN or CHAPTER_STAFF, chapterId is required
      if (
        [AdminRole.CHAPTER_ADMIN, AdminRole.CHAPTER_STAFF].includes(data.role)
      ) {
        return !!data.chapterId;
      }
      return true;
    },
    {
      message: "Chapter is required for this role",
      path: ["chapterId"],
    },
  );

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffFormProps {
  initialData?: Admin;
  onSubmit: (data: StaffFormValues) => Promise<void>;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
}

export function StaffForm({
  initialData,
  onSubmit,
  isSubmitting,
  mode,
  onCancel,
}: StaffFormProps) {
  const { isSuperAdmin, isChapterAdmin, userChapterId } = usePermissions();

  // For Super Admins, fetch all chapters to populate the dropdown
  const { data: chaptersResponse } = useChapters(
    { limit: 100, isActive: true },
    { enabled: isSuperAdmin },
  );
  const chapters = chaptersResponse?.data || [];

  const defaultValues: Partial<StaffFormValues> = {
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    role:
      initialData?.role ||
      (isChapterAdmin ? AdminRole.CHAPTER_STAFF : AdminRole.HQ_STAFF),
    // If Editing or Chapter Admin creating, pre-fill chapter
    chapterId:
      initialData?.chapterId || (isChapterAdmin ? (userChapterId ?? "") : ""),
    password: "",
    isActive: initialData?.isActive ?? true,
  };

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = form;

  const selectedRole = watch("role");
  const isChapterRole = [
    AdminRole.CHAPTER_ADMIN,
    AdminRole.CHAPTER_STAFF,
  ].includes(selectedRole);

  const handleFormSubmit = async (data: StaffFormValues) => {
    // If Chapter Admin, force chapterId and role restrictions
    if (isChapterAdmin) {
      data.chapterId = userChapterId ?? undefined;
      data.role = AdminRole.CHAPTER_STAFF; // Can only create staff
    }
    // Remove empty password to allow auto-generation or keeping existing
    if (!data.password) delete data.password;

    await onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 bg-card p-6 rounded-lg shadow-sm border border-border"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register("firstName")}
          error={errors.firstName?.message}
          placeholder="Jane"
          className="bg-background" // Ensures input matches the theme
        />
        <Input
          label="Last Name"
          {...register("lastName")}
          error={errors.lastName?.message}
          placeholder="Doe"
          className="bg-background"
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        {...register("email")}
        error={errors.email?.message}
        placeholder="jane@wiftafrica.org"
        disabled={mode === "edit"}
        className="bg-background disabled:opacity-60"
      />

      <Input
        label={
          mode === "create" ? "Password (Optional)" : "New Password (Optional)"
        }
        type="password"
        {...register("password")}
        error={errors.password?.message}
        placeholder={
          mode === "create"
            ? "Leave blank to auto-generate"
            : "Leave blank to keep current"
        }
        className="bg-background"
      />

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground/80">Role</label>
        <NativeSelect
          {...register("role")}
          disabled={isChapterAdmin || mode === "edit"}
          className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed text-foreground"
        >
          {isSuperAdmin && (
            <>
              <option value={AdminRole.SUPER_ADMIN}>Super Admin</option>
              <option value={AdminRole.HQ_STAFF}>HQ Staff</option>
              <option value={AdminRole.CHAPTER_ADMIN}>Chapter Admin</option>
            </>
          )}
          <option value={AdminRole.CHAPTER_STAFF}>Chapter Staff</option>
        </NativeSelect>
        {errors.role && (
          <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
        )}
      </div>

      {/* Chapter Selection */}
      {isChapterRole && isSuperAdmin && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Chapter
          </label>
          {/* <NativeSelect
        {...register("chapterId")}
        className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:ring-2 focus:ring-ring text-foreground"
      >
        <option value="">Select a Chapter</option>
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </NativeSelect> */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => console.log(data))}>
              <FormField
                control={control} // 'control' comes from useForm()
                name="chapterId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:ring-2 focus:ring-ring text-foreground h-11">
                          <SelectValue placeholder="Select a Chapter" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {chapters.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const flagCode = getCountryIsoCode(
                                  c?.code,
                                  c?.name,
                                );

                                if (flagCode === "AFRICA") {
                                  return (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-lg shrink-0">
                                      🌍
                                    </div>
                                  );
                                }

                                return (
                                  <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full border border-border/50">
                                    <Image
                                      src={`https://flagsapi.com/${flagCode}/flat/64.png`}
                                      alt={`${c?.name} flag`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.src =
                                          "https://flagsapi.com/ZZ/flat/64.png"; // Fallback to unknown flag
                                      }}
                                      fill
                                      sizes="32px"
                                    />
                                  </div>
                                );
                              })()}
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </form>
          </Form>
          {errors.chapterId && (
            <p className="text-sm text-destructive mt-1">
              {errors.chapterId.message}
            </p>
          )}
        </div>
      )}

      {mode === "edit" && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring"
            {...register("isActive")}
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-foreground/90 select-none cursor-pointer"
          >
            Active Account
          </label>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-4 py-2"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Staff" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
