import { createChannel } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useModalStore } from "@/hooks/use-modal-store";
import { ApiError } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useRoute } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Channel name is required" })
    .refine((name) => name.toLowerCase() !== "general", {
      message: "Channel name cannot be 'general'",
    }),
  type: z.union([z.literal("TEXT"), z.literal("AUDIO"), z.literal("VIDEO")]),
});

const CreateChannelModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const [_match, params] = useRoute("/servers/:id/:any*");
  const { channelType: potentialChannelType } = data;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "TEXT",
    },
  });

  useEffect(() => {
    if (potentialChannelType) {
      form.setValue("type", potentialChannelType);
    } else {
      form.setValue("type", "TEXT");
    }
  }, [potentialChannelType, form]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: createChannelMutation } = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: any }) => {
      return await createChannel(
        queryClient.getQueryData(["accessToken"])!,
        params!.id,
        name,
        type
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

  const isModalOpen = isOpen && type === "createChannel";
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createChannelMutation(values);
      form.reset();
      await queryClient.invalidateQueries(["server", params!.id]);
      onClose();
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Create Channel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Channel name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter channel name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                          <SelectValue placeholder="Select a channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="AUDIO">Audio</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant={"primary"} disabled={isLoading} type="submit">
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { CreateChannelModal };
