import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={"oolong.us.auth0.com"}
      clientId={"GdxxxVdZeQAhaGziPXWLjuMnLn1oUaC1"}
      authorizationParams={{
        redirect_uri: window.location.origin + "/initial",
        audience: "https://oolong-api.dhguo.dev",
        scope: "openid profile email",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} position="top-right" />
        <ThemeProvider defaultTheme="dark" storageKey="oolong-theme">
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </Auth0Provider>
  </React.StrictMode>
);
