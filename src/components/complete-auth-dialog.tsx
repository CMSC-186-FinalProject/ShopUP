import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import Link from 'next/link'

interface CompleteAuthDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CompleteAuthDialog({ isOpen, onOpenChange }: CompleteAuthDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log In First</AlertDialogTitle>
          <AlertDialogDescription>
            You need to log in or create an account before you can place an order, converse or add to favorites.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/auth/login">Log In</Link>
          </AlertDialogAction>
          <AlertDialogAction asChild>
            <Link href="/auth/sign-up">Create Account</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}