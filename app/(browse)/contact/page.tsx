import { Button } from '@/components/ui/button'
import React from 'react'

const Page = () => {
  return (
    <div className="bg-[#A6F297] text-black px-4 py-10 md:px-16">
        <div className="max-w-md mx-auto text-center">
      <h1 className="text-3xl font-bold text-center mb-8">Get in Touch</h1>
      <p>Have questions or need support? We’re here to help!</p>

      <form className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Your Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Your Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
        variant="primary"
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Send Message
        </Button>
      </form>
    </div>
     </div>
  )
}

export default Page
