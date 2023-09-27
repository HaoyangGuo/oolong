
export const OolongLogo = ({
  width = 32,
  height = 32,
}: {
  width?: number;
  height?: number;
}) => {
  return (
    <div className="w-fit">
      <img src="/oolong.svg" width={width} height={height} alt="Oolong Logo" />
    </div>
  );
};
