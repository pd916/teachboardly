import { getSelfByUsername } from "@/lib/auth-service"
import { redirect } from "next/navigation";
import { Navbar } from "./_component/navbar";
import Sidebar from "./_component/sidebar";

interface CreatorLayoutProps {
    children: React.ReactNode
     params: Promise<{ username: string }>;
}


const CreatorLayout = async ({children, params}:CreatorLayoutProps) => {
     const { username } = await params;
     const self = await getSelfByUsername(username)

    if(!self) {
        redirect("/")
    }
    return (
        <>
       <Navbar/>
        <div className="flex h-full pt-20">
            <Sidebar/>
             <main className="ml-64 my-2 w-full min-h-screen">
            {children}
             </main>
          
        </div>
        </>
    )
}

export default CreatorLayout;