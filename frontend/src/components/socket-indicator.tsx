import { useSocket } from "@/components/providers/socket-provider";
import { Badge } from "@/components/ui/badge";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <Badge  variant={"outline"} className="bg-red-500 text-white border-none">Disconnected</Badge>
    )
  }

  return (
    <Badge  variant={"outline"} className="bg-emerald-600 text-white border-none">Live: Real-time updates</Badge>
  )
}
