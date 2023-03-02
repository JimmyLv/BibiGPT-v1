import SquigglyLines from "../components/SquigglyLines";

export default () => {
  const checkoutUrl =
    "https://jimmylv.lemonsqueezy.com/checkout/buy/1ddaaa34-05eb-4db6-8c48-3ac0faed1b94";
  return (
    <div>
      <h1 className="max-w-5xl pb-10 text-center text-4xl font-bold sm:text-7xl">
        伤不起了啊，每天仅限5次，如果有需求请点击
        <span className="relative whitespace-nowrap text-[#3290EE]">
          <SquigglyLines />
          <a
            className="relative text-pink-400 hover:underline"
            href="https://jimmylv.lemonsqueezy.com/checkout/buy/1ddaaa34-05eb-4db6-8c48-3ac0faed1b94"
          >
            点击购买
          </a>
        </span>
        哦，💰
      </h1>
      <div className="border-2 border-sky-400 min-h-screen min-w-fit p-1">
        <iframe src={checkoutUrl} width="100%" height="1024px"></iframe>
      </div>
    </div>
  );
};
