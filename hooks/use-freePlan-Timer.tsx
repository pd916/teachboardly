// "use client";

// import { useEffect, useState, startTransition } from "react";
// import { useRouter } from "next/navigation";
// import { deleteBoard } from "@/actions/board"; // server action

// type AppUser = {
//   id: string;
//   name: string;
//   email: string;
//   plan: string;
// };

// interface Props {
//   boardId: string | string[] | undefined;
//   user?: AppUser; // make optional
// }

// export const useFreePlanTimer = ({ boardId, user }: Props) => {
//   const [timeLeft, setTimeLeft] = useState(15);
//   const router = useRouter();

//   console.log(boardId, user)

//   useEffect(() => {
//     if (user?.plan !== "FREE" || !boardId || Array.isArray(boardId)) return;

//     const timer = setInterval(() => {
//       setTimeLeft(prev => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           startTransition(async () => {
//             try {
//               await deleteBoard(boardId);   // runs on server
//             } catch (err) {
//               console.error("Delete failed:", err);
//             } finally {
//               router.push(`/dashboard/w/${user?.name}`);   // redirect always
//             }
//           });
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [boardId, user?.plan, router]);

//   return { timeLeft };
// };
