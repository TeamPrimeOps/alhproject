'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DisputeForm from './DisputeForm';

interface WalkthroughDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function WalkthroughDialog({ open, onClose }: WalkthroughDialogProps) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: 'Welcome to Dispute Management',
      description: 'Let\'s get started with creating your first dispute. We\'ll guide you through the process.',
    },
    {
      title: 'Create Your First Dispute',
      description: 'Fill in the details of your dispute. Our AI will analyze it and provide insights.',
      form: true,
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>

        {currentStep.form ? (
          <DisputeForm />
        ) : (
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setStep(2)}>Get Started</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}