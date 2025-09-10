"use client"

// import { useUser } from "@clerk/nextjs"
import { BadgeInfo, Fullscreen, History, KeyRound, MessageSquare, Save, Send, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import NavItems from "./NavItems";
import { useSession } from "next-auth/react";


export const Navigation = () => {
    const pathname = usePathname();
     const { data: session, status } = useSession();
    const user = session?.user;

    const routes = [
        {
            label: "Saved Board",
            href: `/w/${user?.name}/saved-board`,
            icon:Save
        },
        {
            label: "Recent Session",
            href: `/w/${user?.name}`,
            icon:History
        },
        {
            label: "Plan Info",
            href: `/w/${user?.name}/plan-info`,
            icon: BadgeInfo,
        },
    ]

    return (
        <ul className="space-y-2 px-2 pt-4 lg:pt-0">
            {routes.map((route) => (
                <NavItems
                key={route.href}
                label={route.label}
                icon={route.icon}
                href={route.href}
                isActive={pathname === route.href}
                />
            ))}
        </ul>

    )
}