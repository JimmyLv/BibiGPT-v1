import SquigglyLines from "../components/SquigglyLines";
import { checkoutUrl } from "../utils/constants";

export default () => {
  return (
    <div>
      <h1 className="max-w-5xl pb-10 text-center text-4xl font-bold sm:text-7xl">
        伤不起了啊，每天仅限5次，如果有需求请点击
        <span className="relative whitespace-nowrap text-[#3290EE]">
          <SquigglyLines />
          <a
            className="relative text-pink-400 hover:underline"
            href={checkoutUrl}
          >
            点击购买
          </a>
        </span>
        哦，💰
        <div className="mt-8">
          或者
          <a
            href="/wechat.jpg"
            className="text-green-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            「加我微信」
          </a>
        </div>
      </h1>
      <div className="min-h-screen min-w-fit border-2 border-sky-400 p-1">
        <iframe src={checkoutUrl} width="100%" height="1024px"></iframe>
      </div>
    </div>
  );
};
