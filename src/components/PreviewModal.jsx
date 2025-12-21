import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const PreviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = "Confirm",
  loading = false,
  children,
  confirmButtonColor = "default"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please review the details below before confirming.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading}
            variant={confirmButtonColor === 'red' ? 'destructive' : 'default'}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
