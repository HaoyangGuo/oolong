import { Avatar, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { isValidUrl } from "@/utils";
import Avvvatars from "avvvatars-react";

interface UserAvatarProps {
  src: string;
  className?: string;
}

function UserAvatar({ className, src }: UserAvatarProps) {
  console;
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      {isValidUrl(src) ? (
        <AvatarImage src={src} style={{ objectFit: "cover" }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Avvvatars value={src} style={"shape"} size={38} />
        </div>
      )}
    </Avatar>
  );
}

export { UserAvatar };
