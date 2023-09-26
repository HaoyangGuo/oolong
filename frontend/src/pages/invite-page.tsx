import { getMyProfile, getServers, joinServer } from "@/api";
import { LoadingScreen } from "@/components/loading-screen";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect, useRoute } from "wouter";

const InvitePage = () => {
  const [match, params] = useRoute("/invite/:inviteCode");

  const {
    isAuthenticated,
    isLoading: Auth0IsLoading,
  } = useAuth0();
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

  const { data: joinedServer, isLoading: joinedServerIsLoading } = useQuery({
    queryKey: ["joinedServer"],
    queryFn: async () => {
      return await joinServer(accessToken!, params!.inviteCode);
    },
    enabled:
      accessToken !== undefined &&
      params!.inviteCode !== undefined &&
      myProfile !== undefined &&
      servers !== undefined,
    useErrorBoundary: true,
    cacheTime: 0,
  });

  if (!match || params!.inviteCode === undefined) {
    return <Redirect to="/" />;
  }

  if (Auth0IsLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  if (
    myProfileIsLoading ||
    serversIsLoading ||
    joinedServerIsLoading
  )
    return <LoadingScreen />;

  const existingServer = servers?.find(
    (server) => server.inviteCode === params!.inviteCode
  );

  if (existingServer) {
    return (
      <Redirect
        to={`/servers/${existingServer.id}/channels/${existingServer.channels[0].id}`}
      />
    );
  }

  if (joinedServer) {
    return (
      <Redirect
        to={`/servers/${joinedServer.id}/channels/${joinedServer.channels[0].id}`}
      />
    );
  }

  return null;
};

export { InvitePage };
