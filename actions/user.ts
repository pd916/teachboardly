"use server"
import { getSelf } from "@/lib/auth-service"
import { db } from "@/lib/db";
import { deleteFromCloudinary } from "@/lib/upload-image";
import { User } from "@prisma/client"
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
// import { UTApi } from "uploadthing/server";

// const utapi = new UTApi();

type UpdateUserInput = Partial<User> & { publicId?: string };


export  const updateUser = async (values: UpdateUserInput) => {

        const self = await getSelf();

        // const valiData = {
        //     name: values.name,
        //     imageUrl: values.imageUrl

        // };

          const updateData: any = {};

          if (values.name && values.name.trim() !== "") {
        updateData.name = values.name.trim();
    }
    
    if (values.imageUrl && values.imageUrl.trim() !== "") {
        updateData.imageUrl = values.imageUrl.trim();
    }

        const user = await db.user.update({
            where:{id: self?.id},
            data: updateData
        });

        if (values.imageUrl && values.imageUrl.includes('cloudinary')) {
        const imagePublicId = values.imageUrl.split('/').pop()?.split('.')[0];
      
        
        if (imagePublicId) {
            await deleteFromCloudinary(imagePublicId);
        }
    }

        revalidatePath('/');

        return user;
    
};


export const getUser = async (userId: string) => {
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      email: true,
      subscription:true
    },
  })

  return user // directly return the user object
}

