import { useAuth0 } from "@auth0/auth0-react";
import { Redirect, useLocation } from "wouter";
import { ModeToggle } from "@/components/mode-toggle";
import { LoadingScreen } from "@/components/loading-screen";

const HomePage = () => {
  const { isLoading, loginWithPopup } = useAuth0();
  const [_location, setLocation] = useLocation();
  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleOnClick = async () => {
    try  {
      await loginWithPopup();
      setLocation("/initial");
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
