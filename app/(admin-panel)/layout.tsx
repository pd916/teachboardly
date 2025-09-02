import { getSelf } from "@/lib/auth-service"
import { redirect } from "next/navigation";


const BrowseLayout = async ({children}:{children: React.ReactNode}) => {
    const self = await getSelf();

    if(!self?.isAdmin){
        redirect('/')
    }
    return (
        <div className="h-full flex">
        <main className="min-h-screen">
            {children}
        </main>
        </div>
    )
}

export default BrowseLayout