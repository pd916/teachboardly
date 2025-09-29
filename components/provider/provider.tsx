"use client"
import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { useGuestStore } from "@/hooks/use-guest-store"
import { useRouter } from "next/navigation"

type PresencePayload = { id: string; name: string; boardId: string }

type Profile = {
  id?: string
  name?: string
  boardId?: string | string[]
}

export function useBoardPresence(
  boardIdParam: string | string[] | undefined,
  profile?:Profile
) {
  const router = useRouter();
  const boardId = Array.isArray(boardIdParam) ? boardIdParam[0] : boardIdParam
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);

  const addGuest = useGuestStore((s) => s.addGuest)
  const removeGuest = useGuestStore((s) => s.removeGuest)
  // const setCurrentGuest = useGuestStore((s) => s.setCurrentGuest)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!boardId || !profile?.id || !profile?.name) return


    const channel = supabase.channel(`presence-board-${boardId}`, {
      config: { presence: { key: profile?.id } },
    })
    channelRef.current = channel

    // Initial sync
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, PresencePayload[]>
      const members = Object.values(state).flat()
      members.forEach((m) =>
        addGuest({ id: m.id, name: m.name, boardId: m.boardId })
      )
    })

    // New member joined
        channel.on<PresencePayload>("presence", { event: "join" }, ({ newPresences }) => {
        newPresences.forEach((m) => {
            addGuest({ id: m.id, name: m.name, boardId: m.boardId })
        })
        })

        channel.on<PresencePayload>("presence", { event: "leave" }, ({ leftPresences }) => {
        leftPresences.forEach((m) => {
            removeGuest(m.id)
        })
        })

        channel.on("broadcast", { event: "member-kicked" }, ({ payload }) => {
        if (!payload || typeof payload !== "object") return
        const { kickedMemberId } = payload as { kickedMemberId: string }

        if (!kickedMemberId) return

        // Remove from Zustand
        removeGuest(kickedMemberId)

        // If I’m the one kicked → redirect
        if (profile?.id === kickedMemberId) {
          router.push("/")
        }
      })

    // 🟢 Draw permission listener
    channel.on("broadcast", { event: "can-draw" }, ({ payload }) => {
      const { id, allowed } = payload as { id: string; allowed: boolean }
       if (profile?.id === id) {
    setIsDrawingEnabled(allowed) // <-- update local state or Zustand
  }
    })

    channel.on("broadcast", { event: "end-session" }, ({ payload }) => {
  if (!payload || typeof payload !== "object") return
  const { boardId: endedBoardId } = payload as { boardId: string }

  console.log("Session ended for board:", endedBoardId)

  // Clear all guests from Zustand
  useGuestStore.getState().clearGuests?.()

  // Redirect everyone to home
  router.push("/")
})

    // Subscribe and announce ourselves
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          id: profile?.id,
          name: profile?.name,
          boardId,
        })
      }
    })

    return () => {
      const cleanup = async () => {
        try {
          await channel.untrack()
        } finally {
          supabase.removeChannel(channel)
        }
      }
      cleanup()
    }
  }, [boardId, profile?.id, profile?.name])

   useEffect(() => {
    const handleUnload = async () => {
      await channelRef.current?.untrack()
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [])

  const kickMember = (id: string) => {
    const channel = channelRef.current
    if (!id || !channel) return

    channel.send({
    type: "broadcast",
    event: "member-kicked",
    payload: { kickedMemberId: id },
  })
  }

  const handleDrawingPermission = (userId: string, allowed: boolean) => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: "broadcast",
      event: "can-draw",
      payload: { id:userId, allowed },
    })
  }

  const endSession = () => {
  const channel = channelRef.current
  if (!channel) return

  channel.send({
    type: "broadcast",
    event: "end-session",
    payload: { boardId },
  })
}

  return { kickMember, handleDrawingPermission, endSession, isDrawingEnabled }
}
