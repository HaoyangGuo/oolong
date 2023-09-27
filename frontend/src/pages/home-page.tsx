import { useAuth0 } from "@auth0/auth0-react";
import { ModeToggle } from "@/components/mode-toggle";
import { LoadingScreen } from "@/components/loading-screen";

const HomePage = () => {
  const { isLoading, loginWithRedirect } = useAuth0();
  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleOnClick = async () => {
    try {
      await loginWithRedirect();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      Home
      <ModeToggle />
      <button onClick={handleOnClick}>Login</button>
    </div>
  );
};

export { HomePage };
