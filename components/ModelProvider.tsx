"use client"

import { useEffect, useState } from "react";
import EditProfile from "./model/edit-profile";
import CreateBoard from "./model/create-board";
import Students from "./model/Students";
import { InviteBoardModel } from "./model/invite-code";
import { JoinLinkModel } from "./model/join-link";
import { SaveBoard } from "./model/save-board";
import Calculator from "./model/calculator";



export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        console.log("🔹 ModalProvider Mounted");
        setIsMounted(true)
    },[])

    if(!isMounted){
        return null;
    }


    return (
        <>
        <EditProfile/>
        <CreateBoard/>
        <Students/>
        <InviteBoardModel/>
        <JoinLinkModel/>
        <SaveBoard/>
        <Calculator/>
        </>
    )
}
