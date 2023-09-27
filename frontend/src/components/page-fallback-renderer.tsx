import { ApiError } from "@/utils";
import { Redirect } from "wouter";
import { toast } from "./ui/use-toast";

const PageFallBackRender = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  console.error(error);
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        toast({
          title: "Bad Request",
          description: error.message || "Please check your input and try again",
        });
        resetErrorBoundary();
        return <Redirect to="/initial" />;
      case 401:
        toast({
          title: "Unauthorized",
          description: "You are not authorized to perform this action",
        })
        resetErrorBoundary();
        return <Redirect to="/initial" />;
      case 404:
        toast({
          title: "Not Found",
          description: "The resource you are looking for does not exist",
        });
        resetErrorBoundary();
        return <Redirect to="/404" />;
      case 500:
      default:
        toast({
          title: "Internal Server Error",
          description: "Something went wrong. Please try again later",
        });
        resetErrorBoundary();
        return <Redirect to="/" />;
    }
  } else {
    return (
      <div>We encountered an unexpected issue. Please try again later.</div>
    );
  }
};

export { PageFallBackRender };
