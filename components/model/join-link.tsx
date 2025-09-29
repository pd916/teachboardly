"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios"
import qs from "query-string";
import { useState } from "react";
import { useModelStore } from "@/hooks/use-model";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useGuestStore } from "@/hooks/use-guest-store";
// import { useSocket } from "../provider/socket-provider";
import { toast } from "sonner";


export const JoinLinkModel = () => {
    // const {socket} = useSocket()
    const router = useRouter();
    const {isOpen, onClose, type} = useModelStore()
    const {guests, setCurrentGuest,} = useGuestStore((state) => state)
   
    const isModalOpen = isOpen && type === "joinLink" 
    const [value, setValue] = useState({
        link:"",
        name:""
    });
    const [isLoading, setIsLoading] = useState(false)

    const onJoinLink = async (e:React.FormEvent) => {
       e.preventDefault();
       if (!value.link.trim()) return;
       setIsLoading(true);
       
       try {
          const apiUrl = "/api/socket/member-join" 
           const url = qs.stringifyUrl({
               url: apiUrl,
           }, {skipNull: true});

        const res = await axios.post(url, {value})
        if(res.data){
            const guest = res.data.guest;
            // const board = res.data.board;

            // addGuest(guest);
            setCurrentGuest(guest);
            
            // Redirect to the server route
            router.push(`/board/${res.data.board.id}`);
            onClose(); // close the modal if desired
            setValue({ link: "", name: "" });
        }
    } catch (error) {
        if(error){
            toast.error("sorry Admin on free plan only 8 can join")
        }
      console.error('Failed to redirect', error);
    } finally {
      setIsLoading(false);
    }

    }

    // const onJoining = async (e:React.FormEvent) => {
    //     e.preventDefault();
    //    if (!value.link.trim()) return;
    //    setIsLoading(true);

    //     const guest = {
    //         id:uuidv4,
    //         name: value.name,
    //         boardId: 12312312
    //     }

        
    // }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Join Board
                    </DialogTitle>
                </DialogHeader>
               <div className="p-6 space-y-4">
                <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                    Board Join Code
                </Label>
                <div className="flex items-center mt-2 gap-x-2">
                    <Input
                    disabled={isLoading}
                    onChange={(e) => setValue((prev) => ({ ...prev, link: e.target.value }))}
                    className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black
                    focus-visible:ring-offset-0"
                    value={value.link}
                    />
                </div>
                <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                    Your Name
                </Label>
                <div className="flex items-center mt-2 gap-x-2">
                    <Input
                    disabled={isLoading}
                    onChange={(e) => setValue((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black
                    focus-visible:ring-offset-0"
                    value={value.name}
                    />
                </div>
                    <Button 
                    type="submit" 
                    disabled={isLoading || !value.link.trim() || !value.name.trim()}
                    onClick={onJoinLink} size="sm" variant="primary">
                       Submit <ArrowRight className="h-4 w-4 text-white"/>
                    </Button>
            
               </div>
            </DialogContent>
        </Dialog>
    )
}



