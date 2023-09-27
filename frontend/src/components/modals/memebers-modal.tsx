import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Check,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Gavel,
  Loader2,
} from "lucide-react";
import { kickMember, updateMemberRole } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useModalStore } from "@/hooks/use-modal-store";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  MemberRole,
  ServerWithChannelsWithMembersWithProfiles,
} from "@/models";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
};

const MembersModal = () => {
  const { toast } = useToast();
  const { isOpen, onClose, type, data, onOpen } = useModalStore();
  const { server } = data;
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleMutationError = (error: ApiError) => {
    setLoadingId(null);
    const apiError = error as ApiError;
    switch (apiError.status) {
      case 400:
        toast({
          title: "Bad Request",
          description: "The request was invalid",
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
  };

  const {
    mutateAsync: updateMemberRoleMutation,
    isLoading: _updateMemberRoleLoading,
  } = useMutation({
    mutationFn: async ({
      serverId,
      memeberId,
      role,
    }: {
      serverId: string;
      memeberId: string;
      role: MemberRole;
    }) => {
      return await updateMemberRole(
        queryClient.getQueryData(["accessToken"])!,
        serverId,
        memeberId,
        role
      );
    },
    onError: handleMutationError,
  });

  const { mutateAsync: kickMemberMutation, isLoading: _kickMemberLoading } =
    useMutation({
      mutationFn: async ({
        serverId,
        memeberId,
      }: {
        serverId: string;
        memeberId: string;
      }) => {
        return await kickMember(
          queryClient.getQueryData(["accessToken"])!,
          serverId,
          memeberId
        );
      },
      onError: handleMutationError,
    });

  const isModalOpen = isOpen && type === "members";

  const onRoleChange = async (memeberId: string, role: MemberRole) => {
    setLoadingId(memeberId);
    await updateMemberRoleMutation({
      serverId: server!.id,
      memeberId,
      role,
    });
    await queryClient.invalidateQueries(["server", server!.id]);
    const updateServer = queryClient.getQueryData([
      "server",
      server!.id,
    ]) as ServerWithChannelsWithMembersWithProfiles;
    setLoadingId(null);
    onOpen("members", { server: updateServer });
  };

  const onKick = async (memeberId: string) => {
    setLoadingId(memeberId);
    await kickMemberMutation({
      serverId: server!.id,
      memeberId,
    });
    await queryClient.invalidateQueries(["server", server!.id]);
    const updateServer = queryClient.getQueryData([
      "server",
      server!.id,
    ]) as ServerWithChannelsWithMembersWithProfiles;
    setLoadingId(null);
    onOpen("members", { server: updateServer });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Memebers
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-center">
            {server?.members.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members.map((member) => {
            return (
              <div key={member.id} className="flex items-center gap-x-2 mb-6">
                <UserAvatar src={member.profile.imageUrl} />
                {/* <div className="flex flex-col gap-y-1"> */}
                <div className="text-xs font-semibold flex items-center gap-x-1">
                  {member.profile.username}
                  {roleIconMap[member.role]}
                </div>
                {server.profileId !== member.profile.id &&
                  loadingId !== member.id && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="w-4 h-4 text-zinc-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center">
                              <ShieldQuestion className="w-4 h-4 mr-2" />
                              <span>Role</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onRoleChange(member.id, "GUEST")
                                  }
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Guest
                                  {member.role === "GUEST" && (
                                    <Check className="w-4 h-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onRoleChange(member.id, "MODERATOR")
                                  }
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  Moderator
                                  {member.role === "MODERATOR" && (
                                    <Check className="w-4 h-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onKick(member.id)}>
                            <Gavel className="w-4 h-4 mr-2" />
                            Kick
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                {loadingId === member.id && (
                  <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
                )}
              </div>
            );
          })}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { MembersModal };
