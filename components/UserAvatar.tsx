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
    isLive,
    showBadge
}:UserAvatarProps) => {
    // const canShowBadge = showBadge && isLive;
    console.log(imageUrl ,"workingsssss")
    const {onOpen} = useModelStore((state) => state);

  return (
    <>
    <DropdownMenu >
        <DropdownMenuTrigger>
      <Avatar
      className='relative'
      //   className={cn(
        //     isLive && "ring-2 ring-rose-500 border border-background ",
        //     // avatarSizes({size})
        // )}
        >
        <AvatarImage src={imageUrl || "https://github.com/shadcn.png"} className='object-cover'/>
        {/* <AvatarFallback>
            {username[0]}
            {username[username.length - 1]}
        </AvatarFallback> */}
        {/* {canShowBadge && (
            <div className='absolute -bottom-3 left-1/2 transform -translate-x-1/2'>
                <LiveBadge/>
                </div>
                )} */}
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