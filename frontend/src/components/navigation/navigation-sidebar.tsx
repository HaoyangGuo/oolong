import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "@/components/mode-toggle";
import LogoutButton from "@/components/logout-button";
import { Profile, ServerWithChannels } from "@/models";
import { useQueryClient } from "@tanstack/react-query";
import { UserAvatar } from "../user-avatar";
import { useModalStore } from "@/hooks/use-modal-store";
import { OolongLogo } from "../oolong-logo";

const NavigationSidebar = ({ servers }: { servers: ServerWithChannels[] }) => {
  const { onOpen } = useModalStore();
  const queryClient = useQueryClient();
  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full bg-[#e3e5e8] dark:bg-[#1E1F22] py-3">
      <OolongLogo width={52} height={52} />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers?.map((server: any) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
              channelId={server.channels[0].id}
            />
          </div>
        ))}
        <NavigationAction />
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-6">
        <ModeToggle />
        <button onClick={() => onOpen("editProfile", {})}>
          <UserAvatar
            src={(queryClient.getQueryData(["myProfile"]) as Profile).imageUrl}
          />
        </button>
        <LogoutButton />
      </div>
    </div>
  );
};

export { NavigationSidebar };
