import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { X } from "lucide-react";
import { editMyProfile } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useModalStore } from "@/hooks/use-modal-store";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/utils";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
type EditProfileFormValues = {
  username?: string;
  image?: FileList;
};

const EditProfileModal = () => {
  const { isOpen, onClose, type } = useModalStore();
  const form = useForm<EditProfileFormValues>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: editProfileMutation } = useMutation({
    mutationFn: async (formData: FormData) => {
      return await editMyProfile(
        queryClient.getQueryData(["accessToken"])!,
        formData
      );
    },
    onError: (error) => {
      const apiError = error as ApiError;
      switch (apiError.status) {
        case 400:
          toast({
            title: "Bad Request",
            description: "Please check your input and try again",
            variant: "destructive",
          });
          break;
        case 401:
          toast({
            title: "Unauthorized",
            description: "You are not authorized to perform this action",
            variant: "destructive",
          });
          break;
        case 404:
          toast({
            title: "Not Found",
            description: "The resource you are looking for does not exist",
            variant: "destructive",
          });
          break;
        default:
        case 500:
          toast({
            title: "Internal Server Error",
            description: "Something went wrong. Please try again later",
            variant: "destructive",
          });
      }
    },
  });

  const isModalOpen = isOpen && type === "editProfile";
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: EditProfileFormValues) => {
    try {
      if (!values.username && (!values.image || values.image.length === 0)) return;
      const editProfileFormData = new FormData();
      if (values.username) {
        editProfileFormData.append("username", values.username);
      }
      if (values.image?.length === 1) {
        editProfileFormData.append("image", values.image[0]);
      }

      await editProfileMutation(editProfileFormData);
      form.reset();
      setImagePreview(null);
      setShowDeleteButton(false);
      await queryClient.invalidateQueries(["server"]);
      await queryClient.invalidateQueries(["myProfile"]);
      onClose();
    } catch (error) {
      return;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files &&
      e.target.files.length > 0 &&
      ACCEPTED_IMAGE_TYPES.includes(e.target.files[0].type)
    ) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      reader.readAsDataURL(e.target.files[0]);
      setShowDeleteButton(true);
    } else {
      setImagePreview(null);
      setShowDeleteButton(false);
    }
  };

  const handleDeleteImage = () => {
    form.setValue("image", null as any); // This sets the value of 'image' in react-hook-form to null
    setShowDeleteButton(false);
    setImagePreview(null);
  };

  const handleClose = () => {
    form.reset();
    setImagePreview(null);
    setShowDeleteButton(false);
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Edit your profile
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Upload a new profile picture or change your username
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8 px-6">
            <div>
              <div className={`${imagePreview && "invisible"}`}>
                <label
                  className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70"
                  htmlFor="image"
                >
                  new profile picture
                </label>
                <Input
                  {...form.register("image", {
                    validate: {
                      count: (files: FileList | undefined) => {
                        if (!files || files.length === 0) return true;
                        return files.length === 1 || "Please upload one file";
                      },
                      size: (files: FileList | undefined) => {
                        if (!files || files.length === 0) return true;
                        return (
                          files[0].size < MAX_FILE_SIZE || "File is too large"
                        );
                      },
                      type: (files: FileList | undefined) => {
                        if (!files || files.length === 0) return true;
                        return (
                          ACCEPTED_IMAGE_TYPES.includes(files[0].type) ||
                          "File type not supported"
                        );
                      },
                    },
                  })}
                  type="file"
                  name="image"
                  id="image"
                  className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                  disabled={isLoading}
                  onChange={handleImageChange}
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                />
              </div>
              {imagePreview && (
                <div className="relative h-28 w-28 mx-auto">
                  <img
                    src={imagePreview}
                    alt="Thumbnail"
                    className="object-cover h-full w-full rounded-full border border-gray-100"
                  />
                  {showDeleteButton && (
                    <button
                      onClick={handleDeleteImage}
                      className="bg-rose-500 text-white p-1 rounded-full absolute top-1 right-1 shadow-sm"
                      type="button"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
              {form.formState.errors.image && (
                <p className={"text-sm font-medium text-destructive"}>
                  {form.formState.errors.image.message}
                </p>
              )}
            </div>
            <div>
              <label
                className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70"
                htmlFor="username"
              >
                new username
              </label>
              <Input
                {...form.register("username", {})}
                disabled={isLoading}
                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                placeholder="Enter username"
                id="username"
              />
              {form.formState.errors.username && (
                <p className={"text-sm font-medium text-destructive"}>
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="bg-gray-100 px-6 py-4">
            <Button variant={"primary"} disabled={isLoading} type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { EditProfileModal };
