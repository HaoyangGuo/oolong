import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { leaveServer } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useModalStore } from "@/hooks/use-modal-store";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/utils";
import { useLocation } from "wouter";

const LeaveServerModal = () => {
  const [_location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isOpen, onClose, type, data } = useModalStore();
  const { server } = data;
  const queryClient = useQueryClient();

  const { mutateAsync: leaveServerMutation, isLoading: leaveServerIsLoading } =
    useMutation({
      mutationFn: async () => {
        return await leaveServer(
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

  const isModalOpen = isOpen && type === "leaveServer";

  const handleLeaveServerOnClick = async () => {
    await leaveServerMutation();
    await queryClient.invalidateQueries(["servers"]);
    setLocation("/");
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Leave Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to leave{" "}
            <span className="font-semibold text-indigo-500">
              {server?.name}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={leaveServerIsLoading}
              onClick={() => onClose()}
              variant={"ghost"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLeaveServerOnClick}
              disabled={leaveServerIsLoading}
              variant={"primary"}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { LeaveServerModal };
