import { getServerSession } from "next-auth"
import Footer from "./_component/Footer"
import Navbar from "./_component/navbar"

import { getSelf } from "@/lib/auth-service"
import { authOptions } from "../api/auth/[...nextauth]/options"
// import { SyncGuest } from "@/hooks/use-syncGuest"

const BrowseLayout = async ({children}:{children: React.ReactNode}) => {
     const session = await getServerSession(authOptions)

     const user = session?.user

        if (user) {
            await getSelf();
        }
    return (
        <div className="h-full">
            {/* <SyncGuest user={user} /> */}
        <Navbar/>
        <main className="pt-20 min-h-screen">
            {children}
        </main>
        <Footer/>
        </div>
    )
}

export default BrowseLayout