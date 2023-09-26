import { ApiError } from "@/utils";
import { Redirect } from "wouter";

const PageFallBackRender = ({ error }: { error: Error }) => {
  console.error(error);
  if (error instanceof ApiError) {
    switch (error.status) {
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
