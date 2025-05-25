'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createClient } from '@/lib/actions/clientActions'; // Assuming updateClient exists too
import { Client } from '@/models/Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClientFormProps {
  userId: string;
  client?: Client | null; // For editing
}

function FormButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90 text-white">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {isEditing ? 'Save Client Changes' : 'Add Client'}
    </Button>
  );
}

export function ClientForm({ userId, client }: ClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!client;

  // @ts-ignore
  const [state, formAction] = useFormState(isEditing ? () => {} /* updateClient.bind(...) */ : createClient.bind(null, userId), { success: false, error: null });
  
  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Success!",
        description: state.message || (isEditing ? "Client updated." : "Client added."),
      });
      router.push(isEditing ? `/clients/${client.id}` : (state.clientId ? `/clients/${state.clientId}` : '/clients'));
    } else if (state?.error && typeof state.error === 'string') {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, router, toast, isEditing, client]);

  const getFieldError = (fieldName: string): string | undefined => {
    if (state?.error && typeof state.error !== 'string' && state.error[fieldName as keyof typeof state.error]) {
      // @ts-ignore
      return state.error[fieldName]._errors[0];
    }
    return undefined;
  };

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Client Full Name / Company Name <span className="text-red-500">*</span></Label>
        <Input id="name" name="name" defaultValue={client?.name} required className="mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600" />
        {getFieldError('name') && <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address <span className="text-red-500">*</span></Label>
          <Input id="email" name="email" type="email" defaultValue={client?.email} required className="mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600" />
          {getFieldError('email') && <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>}
        </div>
        <div>
          <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={client?.phone} className="mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600" />
           {getFieldError('phone') && <p className="text-red-500 text-sm mt-1">{getFieldError('phone')}</p>}
        </div>
      </div>
       <div>
        <Label htmlFor="companyName" className="text-gray-700 dark:text-gray-300">Company (Optional)</Label>
        <Input id="companyName" name="companyName" defaultValue={client?.companyName} className="mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600" />
        {getFieldError('companyName') && <p className="text-red-500 text-sm mt-1">{getFieldError('companyName')}</p>}
      </div>
      <div>
        <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
        <Textarea id="address" name="address" defaultValue={client?.address} className="mt-1 min-h-[80px] bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600" />
        {getFieldError('address') && <p className="text-red-500 text-sm mt-1">{getFieldError('address')}</p>}
      </div>
      <div>
        <Label htmlFor="website" className="text-gray-700 dark:text-gray-300">Website URL</Label>
        <Input id="website" name="website" type="url" defaultValue={client?.website} placeholder="https://example.com" className="mt-1 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600" />
        {getFieldError('website') && <p className="text-red-500 text-sm mt-1">{getFieldError('website')}</p>}
      </div>
      <div>
        <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={client?.notes} placeholder="Any specific notes about this client..." className="mt-1 min-h-[100px] bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600" />
        {getFieldError('notes') && <p className="text-red-500 text-sm mt-1">{getFieldError('notes')}</p>}
      </div>
      <div className="flex justify-end pt-4">
        <FormButton isEditing={isEditing} />
      </div>
    </form>
  );
}