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

interface CompleteProfileDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  action: 'contact' | 'order' | 'review'
}

const actionMessages = {
  contact: {
    title: 'Complete Your Profile First',
    description:
      'Before you can contact sellers, please complete your profile. We need your full name, username, and campus information.',
  },
  order: {
    title: 'Complete Your Profile First',
    description:
      'Before you can place an order, please complete your profile. We need your full name, username, and campus information.',
  },
  review: {
    title: 'Complete Your Profile First',
    description:
      'Before you can leave a review, please complete your profile. We need your full name, username, and campus information.',
  },
}

export function CompleteProfileDialog({ isOpen, onOpenChange, action }: CompleteProfileDialogProps) {
  const message = actionMessages[action]

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{message.title}</AlertDialogTitle>
          <AlertDialogDescription>{message.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Link href="/profile" onClick={() => onOpenChange(false)}>
            <AlertDialogAction>Go to Profile</AlertDialogAction>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
