"use client"

import {cva, type VariantProps} from "class-variance-authority"
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useModelStore } from "@/hooks/use-model"
import { signOut } from "next-auth/react"
import Image from "next/image"
// import LiveBadge from '@/components/live-badge'

const avatarSizes = cva(
    "",
    {
        variants:{
            size: {
                default: "h-8 w-8",
                lg: "h-14 w-14",
            },
        },
        defaultVariants: {
            size: "default",
        },
    },
);

interface UserAvatarProps extends VariantProps<typeof avatarSizes> {
  imageUrl?: string | null
    isLive?: boolean;
    showBadge?:boolean
}

const UserAvatar = ({
    imageUrl,
}:UserAvatarProps) => {
    // const canShowBadge = showBadge && isLive;
    console.log(imageUrl ,"workingsssss")
    const {onOpen} = useModelStore((state) => state);

  return (
    <>
    <DropdownMenu >
        <DropdownMenuTrigger>
          {/* <AvatarImage src={imageUrl ?? "https://github.com/shadcn.png"} className='object-cover'/> */}
      {/* <Avatar
      className='relative'
        >
         <Image
        src={imageUrl || "https://github.com/shadcn.png"}
        alt="profile"
        width={80}
        height={80}
        className="rounded-full object-cover"
      />
      </Avatar> */}

      <Avatar className="relative">
      <AvatarImage
        src={imageUrl || "https://github.com/shadcn.png"}
        className="object-cover"
      />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
    </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-48">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => onOpen("editProfile")}>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => signOut()}>Log-out</DropdownMenuItem>
  </DropdownMenuContent>
    </DropdownMenu>
    </>
  )
}

export default UserAvatar