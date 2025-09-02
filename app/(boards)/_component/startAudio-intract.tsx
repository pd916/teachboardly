import { useEffect } from 'react'
import { useRoomContext } from '@livekit/components-react'

export function StartAudioOnInteract() {
  const room = useRoomContext()
  useEffect(() => {
    if (!room) return
    const onClick = () => room.startAudio().catch(() => {})
    window.addEventListener('click', onClick, { once: true })
    return () => window.removeEventListener('click', onClick)
  }, [room])
  return null
}
