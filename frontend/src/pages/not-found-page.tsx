import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  return (
    <div className="border h-full flex flex-col items-center justify-center gap-y-4">
      <div className="text-4xl">404</div>
      <div className="text-2xl">This page could not be found</div>
      <Button asChild>
        <Link href="/initial">Return to Home</Link>
      </Button>
    </div>
  );
};

export { NotFoundPage };
