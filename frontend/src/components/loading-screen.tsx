import { cn } from "@/lib/utils";

const LoadingScreen = () => {
  return (
    <div
      className={cn(
        "z-50 absolute top-0 left-0 w-screen h-screen border flex items-center justify-center flex-col gap-2 bg-white dark:bg-[#313338]",
      )}
    >
      <div className="waveform min-h-[30px] min-w-[60px] h-[10%] w-[20%]">
        <div className="waveform__bar"></div>
        <div className="waveform__bar"></div>
        <div className="waveform__bar"></div>
        <div className="waveform__bar"></div>
      </div>
    </div>
  );
};

export { LoadingScreen };
