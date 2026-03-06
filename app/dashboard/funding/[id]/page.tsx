/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";

import {
  Loader2,
  ArrowLeft,
  Award,
  X,
  Users,
  TrendingUp,
  Calendar,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Mail,
  FileText,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { apiClient } from "@/lib/api/client";
import { useDebounce } from "@/lib/hooks/useDebounce";
import Papa from "papaparse"; // Add this import

export default function FundingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fundingId = params?.id as string;

  const [awardAmount, setAwardAmount] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const queryClient = useQueryClient();

  // ✅ Get funding opportunity details
  const { data: fundingData, isLoading: isFundingLoading } = useQuery({
    queryKey: ["funding-detail", fundingId],
    queryFn: () => apiClient.get(`/funding-opportunities/${fundingId}`),
  });

  
  // ✅ Get applications for this funding
  const { data: applicationsData, isLoading: isAppsLoading } = useQuery({
    queryKey: [
      "funding-applications",
      fundingId,
      statusFilter,
      debouncedSearch,
    ],
    queryFn: () =>
      apiClient.get(`/funding-opportunities/${fundingId}/applications`, {
        params: {
          status: statusFilter === "ALL" ? undefined : statusFilter,
          search: debouncedSearch || undefined,
        },
      }),
    });
    
    console.log("applicationsData Data:", applicationsData); // Debugging log
  // ✅ Award grant mutation
  const awardMutation = useMutation({
    mutationFn: (data: { applicationId: string; awardAmount: number }) =>
      apiClient.patch(
        `/funding-opportunities/applications/${data.applicationId}/award`,
        {
          awardAmount: data.awardAmount,
        },
      ),
    onSuccess: () => {
      toast.success("Grant awarded successfully!");
      queryClient.invalidateQueries({ queryKey: ["funding-applications"] });
      setShowAwardDialog(false);
      setAwardAmount("");
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to award grant");
    },
  });

  // ✅ Reject application mutation
  const rejectMutation = useMutation({
    mutationFn: (data: { applicationId: string; rejectionReason: string }) =>
      apiClient.patch(
        `/funding-opportunities/applications/${data.applicationId}/reject`,
        {
          rejectionReason: data.rejectionReason,
        },
      ),
    onSuccess: () => {
      toast.success("Application rejected");
      queryClient.invalidateQueries({ queryKey: ["funding-applications"] });
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to reject application",
      );
    },
  });

  // ✅ Shortlist mutation
  const shortlistMutation = useMutation({
    mutationFn: (applicationId: string) =>
      apiClient.patch(
        `/funding-opportunities/applications/${applicationId}/shortlist`,
      ),
    onSuccess: () => {
      toast.success("Application shortlisted");
      queryClient.invalidateQueries({ queryKey: ["funding-applications"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to shortlist application",
      );
    },
  });

  // ✅ Export to CSV function
  const exportToCSV = () => {
    if (!applications.length) {
      toast.error("No applications to export");
      return;
    }

    // Prepare data for CSV
    const csvData = applications.map((app: any) => ({
      "Applicant Name": app.applicantName,
      "Applicant Email": app.applicantEmail,
      Status: app.status,
      "Application Date": format(new Date(app.createdAt), "MMM d, yyyy"),
      Statement: app.statement,
      "Award Amount": app.awardAmount ? `$${app.awardAmount.toLocaleString()}` : "",
      "Proposal link": app?.proposalUrl || "N/A",
    }));

    // Convert to CSV using Papa Parse
    const csv = Papa.unparse(csvData);
    
    // Create and download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${funding.name}_applications_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Applications exported successfully");
  };

  const funding = fundingData?.data;
  const applications = applicationsData?.data || [];

  if (isFundingLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!funding) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Funding opportunity not found
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  const isExternal = funding.applicationType === "Redirect";
  console.log(isExternal, "isExternal", funding.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "awarded":
        return "bg-green-100 text-green-700 dark:bg-green-900/30";
      case "shortlisted":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "awarded":
        return <CheckCircle className="w-4 h-4" />;
      case "shortlisted":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ HEADER */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{funding.name}</h1>
            <Badge variant="outline">{funding.fundingType}</Badge>
            <Badge
              variant={funding.status === "Open" ? "default" : "secondary"}
            >
              {funding.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{funding.description}</p>
        </div>
      </div>

      {/* ✅ INFO CARDS */}
      <div
        className={`grid sm:grid-cols-2 ${isExternal ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4`}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Applications
              </span>
            </div>
            <p className="text-2xl font-bold">{applications.length}</p>
          </CardContent>
        </Card>

        {funding.applicationType === "Redirect" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Link Clicks
                </span>
              </div>
              <p className="text-2xl font-bold">{funding.clicks || 0}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Deadline</span>
            </div>
            <p className="text-sm font-semibold">
              {format(new Date(funding.deadline), "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Region</span>
            </div>
            <p className="text-sm font-semibold">{funding.region}</p>
          </CardContent>
        </Card>
      </div>

      {/* ✅ TABS */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({applications.length || "-"})
          </TabsTrigger>
        </TabsList>

        {/* ✅ DETAILS TAB */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Funding Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <p className="font-medium">{funding.fundingType}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Application Type
                </Label>
                <p className="font-medium">{funding.applicationType}</p>
              </div>

              {funding.applicationType === "Redirect" &&
                funding.applicationLink && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Application Link:{" "}
                    </Label>
                    <a
                      href={funding.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline break-all"
                    >
                      {funding.applicationLink}
                    </a>
                  </div>
                )}

              <div>
                <Label className="text-xs text-muted-foreground">
                  Target Roles
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {funding.targetRoles?.map((role: string) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                  {funding.customRoles?.map((role: string, idx: number) => (
                    <Badge
                      key={`custom-${idx}`}
                      variant="outline"
                      className="text-xs"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              {funding.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                    {funding.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ APPLICATIONS TAB */}
        <TabsContent value="applications" className="space-y-4">
          {/* ✅ FILTERS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="ALL">All Status</option>
              <option value="received">Received</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="awarded">Awarded</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* ✅ Export CSV Button */}
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="gap-2"
              disabled={applications.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* ✅ APPLICATIONS LIST */}
          {isAppsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No applications found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <Card
                  key={app._id}
                  className="hover:shadow-sm transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">

                          <h4 className="font-semibold">{app.applicantName}</h4>
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1 capitalize text-xs">
                              {app.status}
                            </span>
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground flex gap-1 items-center">
                          <Mail className="w-4 h-4" />
                          <span>

                          {app.applicantEmail}
                          </span>
                        </p>

                        <p className="text-sm text-foreground/80  flex items-center gap-1">
                          <FileText className="w-4 h-4 " />
                        
                        <span className="truncate line-clamp-2">

                          {app.statement}
                        </span>
                        </p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {/* an icon needs to be here for all applications feed */}
                          <CalendarCheck className="w-4 h-4 " />
                          <span>
                            Applied:{" "}
                            {format(new Date(app.createdAt), "MMM d, yyyy")}
                          </span>
                          {app.awardAmount && (
                            <span className="font-semibold text-green-600">
                              Award: ${app.awardAmount.toLocaleString()}
                            </span>
                          )}

                          {
                            app.proposalUrl && (
                              <a
                                href={app.proposalUrl}  
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Proposal
                              </a>
                            )
                          }
                        </div>
                      </div>

                      {/* ✅ ACTIONS */}
                      {/* ✅ ACTIONS */}
                      {app.status === "received" && (
                        <div className="flex gap-2 shrink-0">
                          {/* ✅ Award Button with Dialog */}
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowAwardDialog(true);
                              }}
                            >
                              <Award className="w-4 h-4" /> Award
                            </Button>

                            {showAwardDialog &&
                              selectedApplication?._id === app._id && (
                                <Dialog
                                  open={showAwardDialog}
                                  onOpenChange={setShowAwardDialog}
                                >
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Award Grant</DialogTitle>
                                      <DialogDescription>
                                        Awarding to{" "}
                                        {selectedApplication?.applicantName}
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="amount">
                                          Award Amount ($)
                                        </Label>
                                        <Input
                                          id="amount"
                                          type="number"
                                          value={awardAmount}
                                          onChange={(e) =>
                                            setAwardAmount(e.target.value)
                                          }
                                          placeholder="Enter amount"
                                        />
                                      </div>
                                    </div>

                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setShowAwardDialog(false);
                                          setAwardAmount("");
                                          setSelectedApplication(null);
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          if (!awardAmount) {
                                            toast.error(
                                              "Please enter an amount",
                                            );
                                            return;
                                          }
                                          //check if awardamount is a number and greater than 0
                                          const amount =
                                            parseFloat(awardAmount);
                                          if (isNaN(amount) || amount <= 0) {
                                            toast.error(
                                              "Please enter a valid amount",
                                            );
                                            return;
                                          }
                                          awardMutation.mutate({
                                            applicationId:
                                              selectedApplication._id,
                                            awardAmount:
                                              parseFloat(amount.toFixed(2)),
                                          });
                                        }}
                                        disabled={awardMutation.isPending}
                                      >
                                        {awardMutation.isPending
                                          ? "Awarding..."
                                          : "Award"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                          </>

                          {/* Shortlist Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => shortlistMutation.mutate(app._id)}
                            disabled={shortlistMutation.isPending}
                          >
                            {shortlistMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Shortlist"
                            )}
                          </Button>

                          {/* Reject Dropdown */}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowRejectDialog(true);
                            }}
                            className="text-destructive"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ✅ REJECT DIALOG */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application</AlertDialogTitle>
            <AlertDialogDescription>
              Rejecting {selectedApplication?.applicantName}&apos;s application
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div>
            <Label htmlFor="reason">Rejection Reason</Label>
            <Input
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Optional reason for rejection"
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRejectDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                rejectMutation.mutate({
                  applicationId: selectedApplication._id,
                  rejectionReason,
                });
              }}
              disabled={rejectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}