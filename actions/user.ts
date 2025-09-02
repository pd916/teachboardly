"use server"
import { getSelf } from "@/lib/auth-service"
import { db } from "@/lib/db";
import { deleteFromCloudinary } from "@/lib/upload-image";
import { User } from "@prisma/client"
import { revalidatePath } from "next/cache";
// import { UTApi } from "uploadthing/server";

// const utapi = new UTApi();

type UpdateUserInput = Partial<User> & { publicId?: string };


export  const updateUser = async (values: UpdateUserInput) => {
        const self = await getSelf();

        const valiData = {
            name: values.name,
            imageUrl: values.imageUrl

        };

        const user = await db.user.update({
            where:{id: self?.id},
            data: {...valiData}
        });

         if (values?.publicId) {
    await deleteFromCloudinary(values.publicId);
  }

        revalidatePath('/');

        return user;
    
};

