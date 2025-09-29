"use client"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription ,
    DialogTitle
} from "@/components/ui/dialog"
import { useModelStore } from '@/hooks/use-model';
import StudentsList from "../students-list";
import { useGuestStore } from "@/hooks/use-guest-store";
import { useSession } from "next-auth/react";
import { ScrollArea } from "../ui/scroll-area";


type Guest = {
  name?: string;
  id?: string;
  boardId?: string;
};


const Students = () => {
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;
    const {isOpen, onClose, type} = useModelStore((state) => state);
    const {currentGuest, guests} = useGuestStore((state) => state);
    const isModalOpen = isOpen && type === "Students" 

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Class Members
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        View and manage all students currently added to this board. You can track who’s joined, remove members if needed, and monitor activity in real time
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-80 px-6 pb-6">
                    <div className="space-y-2">
                {guests?.map((member:Guest) => (
                    <StudentsList
                    key={member.id}
                    id={member.id}
                    name={member.name}
                    adminId={currentUserId}
                    />
                ))}
                </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
  )
}

export default Students
