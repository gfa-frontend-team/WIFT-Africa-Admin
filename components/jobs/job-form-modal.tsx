import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { CreateJobData, Job, UpdateJobData, AdminRole } from "@/types";
import { Briefcase, DollarSign, Loader2, MapPin } from "lucide-react";
import { useCreateJob, useUpdateJob } from "@/lib/hooks/queries/useJobs";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/stores/authStore";
import { ChapterSelect } from "@/components/shared/ChapterSelect";

// Zod schema
const jobSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "description requires 10 char")
    .refine((val) => (val.trim().split(/\s+/).filter(Boolean).length) <= 500, {
      message: "Description cannot exceed 500 words",
    }),
  role: z.string().min(2, "Role is required"),
  location: z.string().min(2, "Location is required"),
  isRemote: z.boolean(),
  employmentType: z.enum([
    "full-time",
    "part-time",
    "contract",
    "internship",
    "volunteer",
  ]),
  companyName: z.string().min(2, "Company name is required"),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  applicationLink: z.string().optional().or(z.literal("")),
  chapterId: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  job?: Job | null; // If present, edit mode
  isSuperAdmin: boolean;
}

export function JobFormModal({
  isOpen,
  onClose,
  onSuccess,
  job,
  isSuperAdmin,
}: JobFormModalProps) {
  const { mutateAsync: createJob, isPending: isCreating } = useCreateJob();
  const { mutateAsync: updateJob, isPending: isUpdating } = useUpdateJob();
  const { toast } = useToast();
  const { admin } = useAuthStore();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      isRemote: false,
      currency: "NGN",
      employmentType: "full-time",
      chapterId:
        admin?.role === AdminRole.CHAPTER_ADMIN ? admin.chapterId || "" : "",
    },
  });

  const descriptionText = watch("description") || "";
  const descriptionWords = descriptionText.trim() === "" ? 0 : descriptionText.trim().split(/\s+/).length;

  useEffect(() => {
    if (isOpen) {
      if (job) {
        // Edit mode prepopulation
        setValue("title", job.title);
        setValue("description", job.description);
        setValue("role", job.role);
        setValue("location", job.location);
        setValue("isRemote", job.isRemote);
        setValue("employmentType", job.employmentType);
        setValue("companyName", job.companyName);
        if (job.salaryRange) {
          setValue("salaryMin", job.salaryRange.min.toString());
          setValue("salaryMax", job.salaryRange.max.toString());
          setValue("currency", job.salaryRange.currency);
        }
        setValue("applicationLink", job.applicationLink || "");
        setValue("chapterId", job.chapterId || "");
      } else {
        reset({
          title: "",
          description: "",
          role: "",
          location: "",
          isRemote: false,
          employmentType: "full-time",
          companyName: "",
          salaryMin: "",
          salaryMax: "",
          currency: "NGN",
          applicationLink: "",
          chapterId:
            admin?.role === AdminRole.CHAPTER_ADMIN
              ? admin.chapterId || ""
              : "",
        });
      }
    }
  }, [isOpen, job, setValue, reset, admin]);

  const onSubmit = async (data: JobFormData) => {
    try {
      const payload: CreateJobData = {
        title: data.title,
        description: data.description,
        role: data.role,
        location: data.location,
        isRemote: data.isRemote,
        employmentType: data.employmentType,
        companyName: data.companyName,
        applicationLink: data.applicationLink || undefined,
        chapterId: data.chapterId || undefined,
        salaryRange:
          data.salaryMin && data.salaryMax
            ? {
              min: Number(data.salaryMin),
              max: Number(data.salaryMax),
              currency: data.currency,
            }
            : undefined,
      };

      if (job) {
        await updateJob({ id: job.id, data: payload as UpdateJobData });
      } else {
        await createJob(payload);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save job:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to save job details",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground p-0 border border-border shadow-xl transition-colors">
        {/* HEADER */}
        <div className="bg-primary/10 backdrop-blur p-6 border-b border-border">
          <DialogHeader>
            <DialogTitle>
              {job ? "Edit Job Posting" : "Post a New Job"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-1">
              Provide the details for the position. Your posting will be visible
              to all members.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-8 bg-background transition-colors"
        >
          {/* SECTION 1 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Briefcase className="w-3 h-3" />
              General Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  Job Title
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="bg-background border-border focus-visible:ring-ring transition-colors"
                />
                {errors.title && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-semibold">
                  Company Name
                </Label>
                <Input
                  id="companyName"
                  {...register("companyName")}
                  placeholder="e.g. Acme Corp"
                  className="bg-background border-border focus-visible:ring-ring transition-colors"
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description
                </Label>
                <span className={`text-xs ${descriptionWords > 500 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                  {descriptionWords}/500 words
                </span>
              </div>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="What does this role entail?"
                className="h-32 bg-background border-border resize-none focus-visible:ring-ring transition-colors"
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              Logistics & Type
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold">
                  Role / Category
                </Label>
                <Input
                  id="role"
                  {...register("role")}
                  placeholder="e.g. Engineering"
                  className="bg-background border-border focus-visible:ring-ring transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="employmentType"
                  className="text-sm font-semibold"
                >
                  Employment Type
                </Label>
                <select
                  id="employmentType"
                  {...register("employmentType")}
                  className="w-full h-10 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold">
                  Location
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="e.g. Lagos, Nigeria"
                  className="bg-background border-border focus-visible:ring-ring transition-colors"
                />
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-md bg-muted/40 border border-border">
                <input
                  type="checkbox"
                  id="isRemote"
                  {...register("isRemote")}
                  className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-ring"
                />
                <Label
                  htmlFor="isRemote"
                  className="text-sm font-medium cursor-pointer"
                >
                  This is a Remote Position
                </Label>
              </div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              Compensation & Reach
            </h4>

            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Currency (NGN)"
                {...register("currency")}
                className="bg-background border-border focus-visible:ring-ring transition-colors"
              />
              <Input
                type="number"
                placeholder="Min Salary"
                {...register("salaryMin")}
                className="bg-background border-border focus-visible:ring-ring transition-colors"
              />
              <Input
                type="number"
                placeholder="Max Salary"
                {...register("salaryMax")}
                className="bg-background border-border focus-visible:ring-ring transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                External Application Link
              </Label>
              <Input
                {...register("applicationLink")}
                placeholder="https://company.com/careers/apply"
                className="bg-background border-border focus-visible:ring-ring transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to accept applications via platform
              </p>
            </div>

            {isSuperAdmin && (
              <div className="space-y-2 pt-2">
                <Label className="text-sm font-semibold">
                  Assign to Chapter
                </Label>
                <Controller
                  name="chapterId"
                  control={control}
                  render={({ field }) => (
                    <ChapterSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* FOOTER */}
          <DialogFooter className="pt-6 mt-4 border-t border-border flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="px-8 shadow-md shadow-primary/20"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {job ? "Save Changes" : "Publish Job Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
