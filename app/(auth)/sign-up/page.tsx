"use client"
import { zodResolver } from '@hookform/resolvers/zod';
import axios from "axios";
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
import { useRouter } from 'next/navigation';
import { formSchema } from './schema';

const Page = () => {
  const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
          },
})

const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    
    const res = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/sign-up`, values)
    if(res.data.success){
      toast.success(res.data.message ||"User register Successfully")
      form.reset()
      router.push('/sign-in')
    } else {
      toast.error(res.data.message || "Something went wrong")
    }
  }
  return (
     <div className="flex justify-center items-center min-h-screen bg-[#E6F0FA]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-4xl mb-6">
            Join Teachboardly
          </h1>
          <p className="mb-4">Sign up to start your professional experience</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                   placeholder="Enter you name..."
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
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
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page
