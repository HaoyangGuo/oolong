import { useAuth0 } from "@auth0/auth0-react";
import { Redirect } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, getDefaultServer } from "@/api";
import { LoadingScreen } from "@/components/loading-screen";
import { InitialModal } from "@/components/modals/initial-modal";

const InitialPage = () => {
  const { isAuthenticated, isLoading: auth0IsLoading } = useAuth0();
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

  const { data: defaultServer, isLoading: defaultServerIsLoading } = useQuery({
    queryKey: ["defaultServer"],
    queryFn: async () => {
      return getDefaultServer(accessToken!);
    },
    enabled: myProfile !== undefined && accessToken !== undefined,
    useErrorBoundary: true,
  });

  if (auth0IsLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  if (myProfileIsLoading || defaultServerIsLoading) {
    return <LoadingScreen />;
  }

  if (defaultServer) {
    return (
      <Redirect
        to={`/servers/${defaultServer!.id}/channels/${
          defaultServer.channels[0].id
        }`}
      />
    );
  }

  return <InitialModal accessToken={accessToken!} />;
};

export { InitialPage };
