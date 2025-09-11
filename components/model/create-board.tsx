import React, { useTransition } from 'react'
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
import { toast } from 'sonner';
import { useModelStore } from '@/hooks/use-model';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { createBoard } from '@/actions/board';
import { useRouter } from 'next/navigation';
import { useGuestStore } from '@/hooks/use-guest-store';
import { useSession } from 'next-auth/react';
import { useSocket } from '../provider/socket-provider';

const formSchema = z.object({
    title:z.string().min(1, {
        message: "Board name is required"
    }),
})

const CreateBoard = () => {
    const {isOpen, onClose, type,} = useModelStore((state) => state);
    const { data: session } = useSession(); 
    const {socket, isConnected} = useSocket()
    const [isPending, stratTransition] = useTransition()
    const router = useRouter()

    const isModalOpen = isOpen && type === "createBoard" 

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            title:"",
        }
    })

    const isLoading = form.formState.isSubmitting;

     const onSubmit = async(values: z.infer<typeof formSchema>) => {
        try {
           stratTransition(() => {
            createBoard(values)
            .then((res) => {
               if (session?.user) {
              useGuestStore.getState().setCurrentGuest({
                id: session.user.id,
                name: session.user.name,
              });
            }
                toast.success("Board Created")

                router.push(`/board/${res.id}`)
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

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Create your Board
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Give your Board a name you can always change it later
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel 
                                    className="uppercase text-xs font-bold text-zinc-500
                                    dark:text-secondary/70"
                                    >
                                        Board name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                        disabled={isLoading}
                                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 
                                        text-black focus-visible:ring-offset-0"
                                        placeholder="Enter Board name"
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
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
  )
}

export default CreateBoard;
