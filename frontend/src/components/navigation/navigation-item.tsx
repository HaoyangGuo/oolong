import { ActionTooltip } from "@/components/action-tooltip";
import { cn } from "@/lib/utils";
import { useRoute, useLocation } from "wouter";

interface NavigationItemProps {
  id: string;
  imageUrl: string;
  name: string;
  channelId: string;
}

const NavigationItem = ({
  id,
  imageUrl,
  name,
  channelId,
}: NavigationItemProps) => {
  const [_match, params] = useRoute("/servers/:id/:any*");
  const [_location, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/servers/${id}/channels/${channelId}`);
  };

  return (
    <ActionTooltip side="right" align="center" label={name}>
      <button
        onClick={handleClick}
        className="group relative flex items-center"
      >
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            params?.id !== id && "group-hover:h-[20px]",
            params?.id === id ? "h-[36px]" : "h-[8px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 w-[48px] h-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            params?.id === id && "bg-primary/10 text-primary rounded-[16px]"
          )}
        >
          <img
            src={imageUrl}
            alt="Channel"
            className="object-cover h-full w-full"
          />
        </div>
      </button>
    </ActionTooltip>
  );
};

export { NavigationItem };
