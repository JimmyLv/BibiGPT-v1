import Image from "next/image";

const LoadingDots = () => {
  return (
    <div className="flex justify-center items-center text-white">
      <Image src="/blocks-wave.svg" alt="Loading..." width={28} height={28} />
    </div>
  );
};

export default LoadingDots;
