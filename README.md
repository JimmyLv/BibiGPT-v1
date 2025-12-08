> This repo is only for v1 and supports Bilibil and YouTube!

# 🤖 BibiGPT: one-Click AI Summary for Audio/Video & Chat with Learning Content [https://bibigpt.co](https://bibigpt.co)

🎉 Effortlessly summarize YouTube and Bilibili videos with our AI-driven Video Summarizer. It also works for Podcasts, Twitter, Meetings, Lectures, Tiktok videos, and more. Discover a more brilliant way to learn with ChatGPT, your best AI-powered study companion! (formerly BiliGPT) "stream-saving artifact & class representative".

Alternate address: https://b.jimmylv.cn
Browser extension: https://bibigpt.co/extension

---

## 🤖 BibiGPT · AI 音视频内容一键总结 & 对话 [https://bibigpt.co](https://bibigpt.co)

🎉 ChatGPT AI 音视频一键总结，轻松学习哔哩哔哩丨 YouTube 丨本地视频丨本地音频丨播客丨小红书丨抖音丨会议丨讲座丨网页等任意内容。BibiGPT 助力于成为最好的 AI 学习助理，支持免费试用！(原 BiliGPT 省流神器 & AI 课代表)（支持 iOS 快捷指令 & 微信服务号）。

备用地址：https://b.jimmylv.cn
浏览器插件: https://bibigpt.co/extension

---

🎬 This project summarizes YouTube/Bilibili/Twitter/TikTok/Podcast/Lecture/Meeting/... videos or audios for you using AI.

🤯 Inspired by [Nutlope/news-summarizer](https://github.com/Nutlope/news-summarizer) & [zhengbangbo/chat-simplifier](https://github.com/zhengbangbo/chat-simplifier/) & [lxfater/BilibiliSummary](https://github.com/lxfater/BilibiliSummary)

[![BibiGPT音视频总结神器](./public/BibiGPT.gif)](https://twitter.com/Jimmy_JingLv/status/1630137750572728320?s=20)

🚀 First Launch: [【BibiGPT】AI 自动总结 B 站视频内容，GPT-3 智能提取并总结字幕](https://www.bilibili.com/video/BV1fX4y1Q7Ux/?vd_source=dd5a650b0ad84edd0d54bb18196ecb86)

## How it works

This project uses the [AI SDK OpenAI-compatible provider](https://ai-sdk.dev/providers/openai-compatible-providers) with [Vercel Edge functions](https://vercel.com/features/edge-functions) for streaming, plus [Upstash](https://console.upstash.com/) for Redis cache and rate limiting. It fetches the content on a Bilibili video, sends it in a prompt to an OpenAI-compatible API, then streams the response back to the application.

## Saving costs

Projects like this can get expensive so in order to save costs if you want to make your own version and share it publicly, I recommend three things:

- [x] 1. Implement rate limiting so people can't abuse your site
- [x] 2. Implement caching to avoid expensive AI re-generations
- [x] 3. Use `text-curie-001` instead of `text-dacinci-003` in the `summarize` edge function

## Running Locally

After cloning the repo, go to [OpenAI](https://beta.openai.com/account/api-keys) to make an account and put your API key in a file called `.env`.

Then, run the application in the command line and it will be available at `http://localhost:3000`.

[specific running procedure is described in this document - Chinese version](./deploy-ch.md)

```bash
npm run dev
```

## Deployment

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples)

Setup the env variables, by following the `./example.env` file.

## Support Docker

https://github.com/JimmyLv/BibiGPT/pull/133

```shell
# make sure setup .env file firstly
docker compose up -d
```

## Support -> Contact Me

![](./public/wechat.jpg)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=JimmyLv/BibiGPT&type=Date)](https://star-history.com/#JimmyLv/BibiGPT&Date)

## Contributors

This project exists thanks to all the people who contribute.

 <a href="https://github.com/JimmyLv/BibiGPT/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=JimmyLv/BibiGPT" />
 </a>
