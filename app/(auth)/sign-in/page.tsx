"use client"
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link'
import React from 'react'
import { useForm } from 'react-hook-form';
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useGuestStore } from '@/hooks/use-guest-store';
import { formSchema } from './schema';

const Page = () => {
  const router = useRouter();
  const {setCurrentGuest} = useGuestStore((state) => state);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
          },
})

const { isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data)
    const result = await signIn('credentials', {
      redirect: false,
       email: data.email,
      password: data.password,
    });

     if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast.error("Login failed");
      } else {
        toast(result.error);
      }
    }

    if (result?.url) {
      router.push("/");
    }
  };
  return (
     <div className="flex justify-center items-center min-h-screen bg-[#E6F0FA]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-4xl mb-6">
            Join Teachboardly
          </h1>
          <p className="mb-4">Sign In to start</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
  
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} placeholder='Enter email...' />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" placeholder='password' {...field}/>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className='w-full' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page
