import Actions from "./actions"


export const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full h-20 z-[49] text-white bg-[#4AAF6C] 
        px-2 lg:px-4 flex justify-between items-center shadow-sm ">
            <h1 className="text-xl font-semibold">
            Teachboardly
            </h1>
            {/* <Actions/> */}
        </nav>
    )
}