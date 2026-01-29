'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription
} from '@/components/ui/Dialog'

const AlertDialog = Dialog
const AlertDialogContent = DialogContent
const AlertDialogHeader = DialogHeader
const AlertDialogFooter = DialogFooter
const AlertDialogTitle = DialogTitle
const AlertDialogDescription = DialogDescription

const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
    <Button ref={ref} className={cn(className)} {...props} />
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, onClick, ...props }, ref) => {
    // We rely on the parent Dialog to handle closing via context if utilizing proper accessible primitives
    // But since our Dialog is simple, we might need manual handling.
    // In the usage page.tsx: <AlertDialogCancel>Cancel</AlertDialogCancel>
    // It expects to close the dialog.
    // Since our Dialog component uses `onOpenChange`, we assume the user of AlertDialogCancel 
    // passes an onClick that closes it, OR we are using a library like Radix which handles this.
    // The current Dialog implementation is custom and simple.
    // So `AlertDialogCancel` needs to act like a close button. 
    // But we don't have access to `setOpen` here easily without context.
    // For now, in page.tsx, we can add onClick to Cancel if needed, 
    // OR we rely on the fact that Shadcn usually implies Radix. 
    // BUT the existing Dialog.tsx is CUSTOM and NOT Radix (it listens to Keydown).
    // AND the usage in page.tsx is:
    // <AlertDialogCancel>Cancel</AlertDialogCancel>
    // This implies it should auto-close. 
    // Start simple: The usage in page.tsx for cancel doesn't have onClick.
    // I must add onClick logic or Context.

    // Actually, I'll allow passing onClick. 
    // But wait, the `page.tsx` usage is `<AlertDialogCancel>Cancel</AlertDialogCancel>`. 
    // It won't close if I don't give it behavior.
    // I will check page.tsx again. It DOES NOT pass onClick.

    // I will cheat slightly: I will wrap AlertDialogCancel to just be a button, 
    // but the user has to handle state. 
    // In `page.tsx`: 
    // <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && setResourceToDelete(null)}>
    // If I click Cancel, it does nothing?
    // I should update page.tsx to add onClick={() => setResourceToDelete(null)} to Cancel.
    return (
        <Button
            variant="outline"
            ref={ref}
            className={cn("mt-2 sm:mt-0", className)}
            onClick={onClick}
            {...props}
        />
    )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
