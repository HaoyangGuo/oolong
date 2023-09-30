import { useAuth0 } from "@auth0/auth0-react";
import { LoadingScreen } from "@/components/loading-screen";
import { OolongLogo } from "@/components/oolong-logo";
import { Button } from "@/components/ui/button";

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
    <div className="h-full overflow-x-hidden text-zinc-600 dark:text-zinc-300">
      <header className="dark:bg-[#2B2D31] bg-[#F2F3F5] h-screen md:h-[400px]  flex items-center justify-center ">
        <div className="relative w-full">
          <div className="relative w-full max-w-lg mx-auto">
            <div className="absolute top-10 -left-4 w-72 h-72 dark:bg-indigo-600 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-10 -right-4 w-72 h-72 dark:bg-zinc-600 bg-zinc-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          <div className="my-8 relative gap-y-6 flex flex-col">
            <div className=" w-full flex flex-col md:flex-row items-center justify-center gap-6">
              <OolongLogo width={100} />
              <div className="text-2xl md:text-4xl text-center md:text-start font-bold">
                Sip back and relax 😎! <br />
                Enjoy some oolong tea with your friends ❤️.
              </div>
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <Button
                variant={"primary"}
                className="text-xl w-36 h-12"
                onClick={handleOnClick}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>
      <ul>
        <li className="">
          <div className="flex mx-auto flex-col md:flex-row justify-center items-center py-8 md:gap-x-10">
            <div className="text-xl md:text-3xl md:w-[30rem] text-center md:text-start ">
              <p className="font-bold">Brew your own space!</p>
              <p className="text-indigo-600 dark:text-indigo-400 text-xl">
                {" "}
                Create and customize your servers.
              </p>
              <p className="text-sm md:text-base md:mt-4 text-zinc-500 dark:text-zinc-400 ">
                Whether it's a tea party or a gaming session, make it yours.
              </p>
            </div>
            <div className="md:w-[30rem] p-10 md:p-5">
              <img
                src="/img/server-demo.png"
                alt="server demo"
                className="object-fit"
              />
            </div>
          </div>
        </li>
        <li className="dark:bg-[#2B2D31] bg-[#F2F3F5]">
          <div className="flex mx-auto flex-col md:flex-row justify-center items-center py-8 md:gap-x-10">
            <div className="md:w-[30rem] order-last md:order-first p-10 md:p-5">
              <img
                src="/img/text-demo.png"
                alt="server demo"
                className="object-fit"
              />
            </div>
            <div className="text-xl md:text-3xl md:w-[30rem] text-center md:text-start">
              <p className="font-bold">Spill the tea in Groupchat channels!</p>
              <p className="text-indigo-600 dark:text-indigo-400 text-xl">
                {" "}
                Text your friends, share the latest.
              </p>
              <p className="text-sm md:text-base md:mt-4 text-zinc-500 dark:text-zinc-400">
                From memes to deep conversations, keep the chat brewing.
              </p>
            </div>
          </div>
        </li>
        <li className="">
          <div className="flex mx-auto flex-col md:flex-row justify-center items-center py-8 md:gap-x-10">
            <div className="text-xl md:text-3xl md:w-[30rem] text-center md:text-start">
              <p className="font-bold">Slide into the DMs!</p>
              <p className="text-indigo-600 dark:text-indigo-400 text-xl">
                {" "}
                Connect from any server.
              </p>
              <p className="text-sm md:text-base md:mt-4 text-zinc-500 dark:text-zinc-400">
                Private chats for those steeped conversations.
              </p>
            </div>
            <div className="md:w-[30rem] p-10 md:p-5">
              <img
                src="/img/dm-demo.png"
                alt="server demo"
                className="object-fit"
              />
            </div>
          </div>
        </li>
        <li className="dark:bg-[#2B2D31] bg-[#F2F3F5]">
          <div className="flex mx-auto flex-col md:flex-row justify-center items-center py-8 md:gap-x-10">
            <div className="md:w-[30rem] order-last md:order-first p-10 md:p-5">
              <img
                src="/img/video-demo.png"
                alt="server demo"
                className="object-fit"
              />
            </div>
            <div className="text-xl md:text-3xl md:w-[30rem] text-center md:text-start">
              <p className="font-bold">It's tea time on video!</p>
              <p className="text-indigo-600 dark:text-indigo-400 text-xl">
                {" "}
                Sip and see your friends.
              </p>
              <p className="text-sm md:text-base md:mt-4 text-zinc-500 dark:text-zinc-400">
                Face-to-face, even when miles apart.
              </p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export { HomePage };

{
  /* <div>
      Home
      <ModeToggle />
      <button onClick={handleOnClick}>Login</button>
    </div> */
}
