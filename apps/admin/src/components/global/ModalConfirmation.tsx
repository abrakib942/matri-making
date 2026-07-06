import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface IConfirmModal {
  isOpen: boolean;
  onCancel: () => void;
  title: string;
  subtitle: string;
  cancelCallback: () => void;
  cancelColor?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  confirmCallback: () => void;
  confirmColor?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const Modal = ({
  isOpen,
  onCancel,
  title,
  subtitle,
  cancelCallback,
  cancelColor = 'outline',
  confirmCallback,
  confirmColor = 'destructive',
}: IConfirmModal) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-[450px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex items-center gap-3 pt-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <h5 className="font-semibold mb-1">{title}</h5>
                <p>{subtitle}</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelCallback} asChild>
            <Button variant={cancelColor}>No</Button>
          </AlertDialogCancel>
          <AlertDialogAction onClick={confirmCallback} asChild>
            <Button variant={confirmColor}>Yes</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Modal;
