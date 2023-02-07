import Image from "next/image";

const LoadingDots = () => {
  return (
    <div className="flex items-center justify-center text-white">
      <Image src="/270-ring.svg" alt="Loading..." width={28} height={28} />
    </div>
  );
};

export default LoadingDots;
