import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import {
  Plus,
  SendHorizonal,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "../emoji-picker";

interface ChatInputProps {
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const formSchema = z.object({
  content: z.string().nonempty({ message: "Message cannot be empty" }),
  image: z.union([
    z.literal(""),
    z
      .any()
      .refine(
        (data) => {
          return data instanceof File;
        },
        {
          message: "Image must be a file",
        }
      )
      .refine((data) => ACCEPTED_IMAGE_TYPES.includes((data as File).type), {
        message: "Image type must be png, jpeg, jpg, or webp",
      })
      .refine((data) => (data as File).size <= MAX_FILE_SIZE, {
        message: "Image size must be less than 5MB",
      }),
  ]),
});

export const ChatInput = ({ query, name, type }: ChatInputProps) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      image: "",
    },
  });
  const queryClient = useQueryClient();
  const accessToken = queryClient.getQueryData<string>(["accessToken"]);

  const isLoading = form.formState.isSubmitting;

  const handleOnSubmit = async (value: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("content", value.content);
    formData.append("image", value.image);
    try {
      const res = await fetch(
        (type === "channel"
          ? `${import.meta.env.VITE_API_URL}/messages?`
          : `${import.meta.env.VITE_API_URL}/messages/direct?`) +
          new URLSearchParams({
            ...query,
          }),
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        toast({
          title: "Error sending message",
          description: errorData.message as string,
        });
      }
      form.reset({
        content: "",
        image: "",
      });
      if ((document.getElementById("imageInput") as HTMLInputElement).value) {
        (document.getElementById("imageInput") as HTMLInputElement).value = "";
      }
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; // or any default height you want
      }
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (form.formState.errors.image) {
      toast({
        title: "Error uploading image",
        description: ("Only file of type image is supported at the moment. " +
          form.formState.errors.image.message) as string,
        variant: "destructive",
      });
    }
    if (form.formState.errors.content) {
      toast({
        title: "Error sending content",
        description: form.formState.errors.content.message as string,
        variant: "destructive",
      });
    }
  }, [form.formState.errors]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = (e: any) => {
    e.target.style.height = "0"; // Temporarily reduce height to calculate scrollHeight
    e.target.style.height = `${e.target.scrollHeight}px`; // Set height to match content
  };

  const handleKeyDown: KeyboardEventHandler<HTMLFormElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (form.getValues("content") === "" && form.getValues("image") === "")
        return;
      form.handleSubmit(handleOnSubmit)();
    }
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const showDeleteButton = imagePreview !== null;

  const showImagePreview = (image: File) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(image);
  };

  const handleDeleteImage = () => {
    if ((document.getElementById("imageInput") as HTMLInputElement).value) {
      (document.getElementById("imageInput") as HTMLInputElement).value = "";
    }
    setImagePreview(null);
  };

  return (
    <div className="relative md:mb-4 md:mx-4">
      {imagePreview && (
        <div className=" bg-zinc-200/90 dark:bg-zinc-700/75 border-b border-zinc-600 dark:border-zinc-500 rounded-t-sm">
          <div
            className={cn(
              "w-1/3 max-w-[222px] p-3 relative",
              isLoading && "animate-pulse"
            )}
          >
            {showDeleteButton && !isLoading && (
              <button
                onClick={handleDeleteImage}
                className="bg-rose-500 text-white p-1 rounded-full absolute top-[4px] right-[4px] shadow-sm "
                type="button"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <img src={imagePreview} alt="preview" />
          </div>
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleOnSubmit)}
          className="relative"
          onKeyDown={handleKeyDown}
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormControl>
                  <div className="absolute z-40 top-4 left-4">
                    <label
                      htmlFor="imageInput"
                      className="hover:cursor-pointer h-[24px] w-[24px] bg-zinc-500 dark:bg-zin-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                    >
                      <Plus className="text-white dark:text-[#313338]" />
                    </label>
                    <Input
                      id="imageInput"
                      className="hidden"
                      type="file"
                      {...field}
                      value={value?.filename}
                      onChange={(e) => {
                        if (e.target.files === null || !e.target.files[0]) {
                          setImagePreview(null);
                          onChange("");
                          return;
                        }
                        onChange(e.target.files[0]);
                        showImagePreview(e.target.files[0]);
                      }}
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <div className="w-full pl-12 pr-24 py-2 bg-zinc-200/90 dark:bg-zinc-700/75 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200 rounded-sm">
                      <textarea
                        disabled={isLoading}
                        rows={1.2}
                        className={cn(
                          "mt-1 w-full p-1 overflow-hidden bg-zinc-200/90 dark:bg-zinc-700/75 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200 outline-none focus:outline-none",
                          isLoading && "animate-pulse"
                        )}
                        placeholder={`Message ${
                          type === "conversation" ? name : "#" + name
                        }`}
                        {...field}
                        onInput={autoResize}
                        ref={textareaRef}
                      />
                    </div>
                    <div className="absolute top-1.5 right-3 flex items-center h-12 gap-4 ">
                      <EmojiPicker
                        onChange={(emoji: string) => {
                          field.onChange(field.value + emoji);
                        }}
                      />
                      <Button
                        disabled={isLoading || !field.value}
                        size={"icon"}
                        className={cn(
                          "bg-indigo-500 hover:bg-indigo-400 rounded-full w-min h-min p-2"
                        )}
                      >
                        <SendHorizonal className="w-4 h-4 text-zin-400 dark:text-zinc-200" />
                      </Button>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};
