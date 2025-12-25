import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const RejectTaskDialog = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length === 0) {
      return; // Will show error via required attribute
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason(""); // Reset after successful submission
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Reject Task
          </DialogTitle>
          <DialogDescription>
            You're rejecting: <strong>{taskTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're rejecting this task..."
              rows={4}
              maxLength={500}
              required
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Provide a clear reason to help the task creator understand
              </span>
              <span className={`font-medium ${reason.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {reason.length}/500
              </span>
            </div>
          </div>

          {reason.trim().length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                A rejection reason is required. This will be sent to the task creator.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length === 0}
          >
            {isSubmitting ? "Rejecting..." : "Reject Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectTaskDialog;