import React, { useEffect, useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription ,
    DialogFooter,
    DialogTitle
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { FileUpload } from '../FileUpload';
import { updateUser } from '@/actions/user';
import { toast } from 'sonner';
import { useModelStore } from '@/hooks/use-model';
import { useSession } from 'next-auth/react';

const formSchema = z.object({
    name:z.string().optional(),
    imageUrl: z.string().optional()
})

const EditProfile = () => {
    const {isOpen, onClose, type} = useModelStore((state) => state);
    const [isPending, startTransition] = useTransition()
     const { data:session, update } = useSession();

    const isModalOpen = isOpen && type === "editProfile" 

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            name:session?.user?.name || "",
            imageUrl:session?.user?.image || ""
        }
    })

    const isLoading = form.formState.isSubmitting;

     const onSubmit = async(values: z.infer<typeof formSchema>) => {
        try {
           startTransition(() => {
            updateUser(values)
            .then(async ( updatedUser) => {
                await update();
                    
                    // Small delay to ensure session is updated
                    setTimeout(async () => {
                        await update();
                        // Trigger a window event for other components to listen to
                        window.dispatchEvent(new CustomEvent('profileUpdated', { 
                            detail: { user: updatedUser } 
                        }));
                    }, 200);
                toast.success("User updated")
                onClose()
            })
            .catch(() => {
                toast.error("Something wnet wrong")
            })
        })
        } catch (error) {
            console.log(error)
        }

    }

    const handleClose  =  () => {
        form.reset();
        onClose()
    }

    useEffect(() => {
        if (session?.user) {
            form.reset({
                name: session.user.name || "",
                imageUrl: session.user.image || ""
            });
        }
    }, [session, form]);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Edt Your Profile
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                       Update your profile name and image
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload
                                            // endpoint = "profileImage"
                                            value={field.value}
                                            onChange={field.onChange}
                                            setValue={form.setValue}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                                />
                            </div>

                            <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel 
                                    className="uppercase text-xs font-bold text-zinc-500
                                    dark:text-secondary/70"
                                    >
                                        Profile name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                        disabled={isLoading}
                                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 
                                        text-black focus-visible:ring-offset-0"
                                        placeholder="Enter Your name"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button variant="primary" disabled={isLoading} className='text-white '>
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
  )
}

export default EditProfile
