import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    <Button
      onClick={() => {
        logout({
          logoutParams: {
            returnTo: window.location.origin,
          },
        });
      }}
      className="text-small bg-rose-500 hover:bg-rose-600 rounded-full"
      size={"icon"}
    >
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
};

export default LogoutButton;
