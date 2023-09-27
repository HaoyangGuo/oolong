import { ApiError } from "@/utils";
import { Redirect } from "wouter";
import { useToast } from "@/components/ui/use-toast";

const PageFallBackRender = ({ error }: { error: Error }) => {
  console.error(error);
  const { toast } = useToast();
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        toast({
          title: "Bad Request",
          description: error.message || "Please check your input and try again",
          variant: "destructive",
        });
        return;
      case 401:
        return <Redirect to="/initial" />;
      case 404:
        return <Redirect to="/404" />;
      case 500:
      default:
        return <Redirect to="/" />;
    }
  } else {
    return <div>We encountered an unexpected issue. Please try again later.</div>;
  }
};

export { PageFallBackRender };
