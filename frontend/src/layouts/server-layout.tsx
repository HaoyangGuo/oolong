import { useQuery } from "@tanstack/react-query";
import { Redirect, useRoute } from "wouter";
import { useAuth0 } from "@auth0/auth0-react";
import { LoadingScreen } from "@/components/loading-screen";
import { getMyProfile, getServer, getServers } from "@/api";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { useQueryClient } from "@tanstack/react-query";

const ServerLayout = ({ children }: { children: React.ReactNode }) => {
  const [match, params] = useRoute("/servers/:serverId/:any*");
  const {isAuthenticated, isLoading: isAuth0Loading} = useAuth0();
  const queryClient = useQueryClient();
  const accessToken = queryClient.getQueryData<string>(["accessToken"]);

  const { data: myProfile, isLoading: myProfileIsLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      return getMyProfile(accessToken!);
    },
    enabled: accessToken !== undefined,
    useErrorBoundary: true,
  });

  const { data: servers, isLoading: serversIsLoading } = useQuery({
    queryKey: ["servers"],
    queryFn: async () => {
      return await getServers(accessToken!);
    },
    enabled: accessToken !== undefined && myProfile !== undefined,
    useErrorBoundary: true,
  });

  const { data: server, isLoading: serverIsLoading } = useQuery({
    queryKey: ["server", params!.serverId],
    queryFn: async () => {
      return getServer(accessToken!, params!.serverId);
    },
    enabled:
      accessToken !== undefined &&
      params!.serverId !== undefined &&
      myProfile !== undefined,
    useErrorBoundary: true,
  });

  if (!match || params!.serverId === undefined) {
    return <Redirect to="/initial" />;
  }

  if (isAuth0Loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  if (
    myProfileIsLoading ||
    serversIsLoading ||
    serverIsLoading
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar servers={servers!} />
      </div>
      <main className="md:pl-[72px] h-full">
        <div className="flex h-full">
          <div className="inset-y-0 flex-col hidden h-full md:flex w-60 flex-shrink-0">
            <ServerSidebar server={server!} myProfile={myProfile!} />
          </div>
          <div className="w-full h-full">{children}</div>
        </div>
      </main>
    </div>
  );
};

export { ServerLayout };
