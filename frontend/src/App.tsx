import { Route, Switch, useLocation } from "wouter";
import {
  useQuery,
} from "@tanstack/react-query";
import { HomePage } from "./pages/home-page";
import { InitialPage } from "./pages/initial-page";
import { NotFoundPage } from "./pages/not-found-page";
import { ModalProvider } from "./components/providers/modal-provider";
import { Toaster } from "./components/ui/toaster";
import { ErrorBoundary } from "react-error-boundary";
import { PageFallBackRender } from "./components/page-fallback-renderer";
import { InvitePage } from "./pages/invite-page";
import { ChannelPage } from "./pages/channel-page";
import { ConversationPage } from "./pages/conversation-page";
import { ServerLayout } from "./layouts/server-layout";
import { SocketProvider } from "./components/providers/socket-provider";
import { useAuth0 } from "@auth0/auth0-react";
import { LoadingScreen } from "./components/loading-screen";

const App = () => {
  const [location, _setLocation] = useLocation();

  const {
    getAccessTokenSilently,
    isLoading: isAuth0Loading,
    isAuthenticated,
  } = useAuth0();

  const {
    data: _accessToken,
    isLoading: _accessTokenIsLoading,
    isFetching: accessTokenIsFetching,
  } = useQuery({
    queryKey: ["accessToken"],
    queryFn: async () => {
      return await getAccessTokenSilently();
    },
    enabled: isAuthenticated && location !== "/",
    useErrorBoundary: true,
  });

  if (isAuth0Loading || accessTokenIsFetching) {
    return <LoadingScreen />;
  }

  return (
    <SocketProvider>
      <main className="h-screen">
        <Switch>
          <Route path="/">{<HomePage />}</Route>
          <Route path="/initial">
            <ErrorBoundary fallbackRender={PageFallBackRender}>
              <InitialPage />
            </ErrorBoundary>
          </Route>
          <Route path="/servers/:serverId/channels/:channelId">
            <ErrorBoundary fallbackRender={PageFallBackRender}>
              <ServerLayout>
                <ChannelPage />
              </ServerLayout>
            </ErrorBoundary>
          </Route>
          <Route path="/servers/:serverId/conversations/:memeberId">
            <ErrorBoundary fallbackRender={PageFallBackRender}>
              <ServerLayout>
                <ConversationPage />
              </ServerLayout>
            </ErrorBoundary>
          </Route>
          <Route path="/invite/:inviteCode">
            <ErrorBoundary fallbackRender={PageFallBackRender}>
              <InvitePage />
            </ErrorBoundary>
          </Route>
          <Route path="/404">{<NotFoundPage />}</Route>
          <Route path="/:rest*">{<NotFoundPage />}</Route>
        </Switch>
      </main>

      <Toaster />
      <ModalProvider />
    </SocketProvider>
  );
};

export default App;
