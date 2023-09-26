import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { updateInviteCode } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useModalStore } from "@/hooks/use-modal-store";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const InviteModal = () => {
  const { toast } = useToast();
  const { isOpen, onClose, type, data, onOpen } = useModalStore();
  const origin = window.location.origin;
  const { server } = data;
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const {
    mutateAsync: updateInviteCodeMutation,
    isLoading: updateInviteCodeIsLoading,
  } = useMutation({
    mutationFn: async () => {
      return await updateInviteCode(
        queryClient.getQueryData(["accessToken"])!,
        server!.id
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

  const onNew = async () => {
    const server = await updateInviteCodeMutation();
    onOpen("invite", { server: server });
  };

  const isModalOpen = isOpen && type === "invite";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Server invite link
          </Label>
          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={updateInviteCodeIsLoading}
              className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
              value={inviteUrl}
              readOnly
            />
            <Button size={"icon"} onClick={onCopy}>
              {copied ? (
                <Check className="w-4 h-4 " />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            disabled={updateInviteCodeIsLoading}
            variant={"link"}
            size={"sm"}
            className="text-xs text-zinc-500 mt-4"
            onClick={onNew}
          >
            Generate a new link
            <RefreshCw className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { InviteModal };
