"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { getUser } from "@/actions/user"
import { useRouter } from "next/navigation"
import { Subscription } from "@prisma/client"

export type UserProps = {
  id: string
  name: string
  email: string | null
  imageUrl: string | null
  subscription:Subscription | null
}

export const useCurrentUser = () => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<UserProps | null>(null)
  const router = useRouter();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    const fetchUser = async () => {
      if (!session?.user?.id) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const self = await getUser(session.user.id)
        setUser(self || null)
        router.refresh()
      } catch (err) {
        console.error(err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [session, status])

  return { user, loading }
}
