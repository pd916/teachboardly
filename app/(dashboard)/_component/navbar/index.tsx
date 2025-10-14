import Link from "next/link"
import Actions from "../../w/[username]/(teacher)/_component/Actions"


export const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full h-20 z-[49] text-white bg-[#4AAF6C] 
        px-2 lg:px-4 flex justify-between items-center shadow-sm ">
            <Link href={"/"}>
            <h1 className="text-xl font-semibold">
            Teachboardly
            </h1>
            </Link>
          <Actions/>
        </nav>
    )
}