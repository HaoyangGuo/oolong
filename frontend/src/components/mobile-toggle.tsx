import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { NavigationSidebar } from "./navigation/navigation-sidebar";
import {
  Profile,
  ServerWithChannels,
  ServerWithChannelsWithMembersWithProfiles,
} from "@/models";
import { ServerSidebar } from "./server/server-sidebar";

export const MobileToggle = ({ serverId }: { serverId: string }) => {
  const queryClient = useQueryClient();
  const servers = queryClient.getQueryData<ServerWithChannels[]>(["servers"]);
  const server =
    queryClient.getQueryData<ServerWithChannelsWithMembersWithProfiles>([
      "server",
      serverId,
    ]);
  const myProfile = queryClient.getQueryData<Profile>(["myProfile"]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"} className="p-0 flex gap-0">
        <div className="w-[72px]">
          <NavigationSidebar servers={servers!} />
        </div>
        <ServerSidebar server={server!} myProfile={myProfile!} />
      </SheetContent>
    </Sheet>
  );
};
