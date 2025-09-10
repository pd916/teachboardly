import Image from "next/image";
import { X } from "lucide-react";
import { UseFormSetValue } from "react-hook-form";

type FormValues = {
  name?: string;
  imageUrl?: string;
  publicId?: string;
};

type FileUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  setValue: UseFormSetValue<FormValues>;
};

export const FileUpload = ({ value, onChange, setValue }: FileUploadProps) => {
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 👉 If you want just local preview:
    // const localUrl = URL.createObjectURL(file);
    // onChange(localUrl);

    // 👉 If you want Cloudinary upload right away:
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "teachboardly");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    onChange(data.secure_url);
    setValue("publicId", data.public_id);
  };

  if (value) {
    return (
      <div className="relative h-20 w-20">
        <Image
          src={value}
          fill
          alt="Profile"
          className="rounded-full object-cover"
        />
        <button
          onClick={() => onChange("")}
          type="button"
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label className="flex items-center justify-center h-20 w-20 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-blue-500 text-gray-500 text-sm">
      Upload
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </label>
  );
};
