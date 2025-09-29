import { useEffect, useState } from "react";
import { toast } from "sonner";
import {JwtPayload, jwtDecode} from "jwt-decode";
import { createViewToken } from "@/actions/token";
import { useGuestStore } from "./use-guest-store";

interface UseViewerTokenProps {
    boardId: string | undefined;
}

export const useViewerToken = ({boardId}:UseViewerTokenProps) => {
    const [token, setToken] = useState("");
    const [name, setName] = useState('');
    const [identity, setIdentity] = useState('');
    const [hostIdentity, setHostIdentity] = useState<string>("");
    const {currentGuest} = useGuestStore((state) => state);
    

    useEffect(() => {
        if (!boardId) return;
        
        const  createToken = async () => {
            try {
                const result = await createViewToken({
                    boardId, 
                    currentGuest: currentGuest as {
                    name: string;
                    id: string;
                    boardId: string;
                    }
                
                });
                setToken(result.token);
                setHostIdentity(result.hostIdentity);

                const decodedToken = jwtDecode(result.token) as JwtPayload & {
                    name?: string;
                    sub?: string;
                }

                if (decodedToken?.sub) setIdentity(decodedToken.sub);
               if (decodedToken?.name) setName(decodedToken.name);

                // const name = decodedToken?.name;

                // const identity = decodedToken?.sub;

                // if(identity) {
                //     setIdentity(identity);
                // }

                // if(name) {
                //     setName(name);
                // }


            } catch (error) {
                toast.error("Something wnet wrong")
            }
        }

        createToken()
    },[boardId]);

    return {
        token, 
        name,
        identity,
        hostIdentity
    };
};

