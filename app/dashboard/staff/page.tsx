'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { staffApi, CreateAdminData, UpdateAdminData } from '@/lib/api/staff'
import { Admin, AdminRole } from '@/types'
import { StaffForm } from '@/components/staff/StaffForm'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/use-toast'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/AlertDialog"

export default function StaffPage() {
    const { toast } = useToast()
    const { isSuperAdmin, isChapterAdmin, userChapterId, admin: currentUser } = usePermissions()

    const [staff, setStaff] = useState<Admin[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<Admin | undefined>(undefined)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Filters
    const [roleFilter, setRoleFilter] = useState<AdminRole | ''>('')

    const fetchStaff = async () => {
        try {
            setLoading(true)
            const params: any = {}

            if (roleFilter) params.role = roleFilter
            if (isChapterAdmin) params.chapterId = userChapterId

            const response = await staffApi.getAdmins(params)
            setStaff(response.admins || [])
        } catch (error) {
            console.error('Failed to fetch staff:', error)
            toast({
                title: 'Error',
                description: 'Failed to load staff list',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStaff()
    }, [roleFilter, isChapterAdmin, userChapterId])

    const handleCreate = async (data: any) => {
        try {
            setIsSubmitting(true)
            await staffApi.createAdmin(data as CreateAdminData)
            toast({ title: 'Success', description: 'Staff member created successfully' })
            setIsModalOpen(false)
            fetchStaff()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create staff',
                variant: 'destructive'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (data: any) => {
        if (!editingStaff) return
        try {
            setIsSubmitting(true)
            await staffApi.updateAdmin(editingStaff.id, data as UpdateAdminData)
            toast({ title: 'Success', description: 'Staff member updated successfully' })
            setIsModalOpen(false)
            setEditingStaff(undefined)
            fetchStaff()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update staff',
                variant: 'destructive'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await staffApi.deleteAdmin(deleteId)
            toast({ title: 'Success', description: 'Staff member removed' })
            setDeleteId(null)
            fetchStaff()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to remove staff member',
                variant: 'destructive'
            })
        }
    }

    const canEdit = (targetAdmin: Admin) => {
        // Super Admin can edit anyone except themselves (handled differently usually)
        if (isSuperAdmin) return true
        // Chapter Admin can only edit Chapter Staff in their chapter
        if (isChapterAdmin && targetAdmin.role === AdminRole.CHAPTER_STAFF && targetAdmin.chapterId === userChapterId) return true
        return false
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">Manage administrators and staff members.</p>
                </div>
                <Button onClick={() => { setEditingStaff(undefined); setIsModalOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Staff
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        className="w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm"
                        placeholder="Search staff..."
                        // Client side search for now
                        onChange={(e) => {
                            const term = e.target.value.toLowerCase()
                            if (!term) fetchStaff() // Reset
                            else {
                                setStaff(prev => prev.filter(s =>
                                    s.firstName.toLowerCase().includes(term) ||
                                    s.lastName.toLowerCase().includes(term) ||
                                    s.email.toLowerCase().includes(term)
                                ))
                            }
                        }}
                    />
                </div>
                {isSuperAdmin && (
                    <select
                        className="px-3 py-2 border rounded-md bg-background text-sm"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as AdminRole)}
                    >
                        <option value="">All Roles</option>
                        <option value={AdminRole.SUPER_ADMIN}>Super Admin</option>
                        <option value={AdminRole.CHAPTER_ADMIN}>Chapter Admin</option>
                        <option value={AdminRole.HQ_STAFF}>HQ Staff</option>
                        <option value={AdminRole.CHAPTER_STAFF}>Chapter Staff</option>
                    </select>
                )}
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Chapter</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow key="loading"><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : staff.length === 0 ? (
                            <TableRow key="empty"><TableCell colSpan={6} className="text-center py-8">No staff members found.</TableCell></TableRow>
                        ) : (
                            staff.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell className="font-medium">{admin.firstName} {admin.lastName}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell><Badge variant="outline">{admin.role.replace('_', ' ')}</Badge></TableCell>
                                    <TableCell>{admin.chapterId || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={admin.isActive ? 'success' : 'secondary'}>
                                            {admin.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {canEdit(admin) && (
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingStaff(admin); setIsModalOpen(true) }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {admin.id !== currentUser?.id && (
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(admin.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} className="sm:max-w-[500px]">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h2>
                    <StaffForm
                        mode={editingStaff ? 'edit' : 'create'}
                        initialData={editingStaff}
                        onSubmit={editingStaff ? handleUpdate : handleCreate}
                        isSubmitting={isSubmitting}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </div>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the staff member account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
