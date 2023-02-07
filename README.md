# [TechCrunchSummary.com](https://www.techcrunchsummary.com/)

This project summarizes TechCrunch articles for you using AI.

[![TechCrunch Summary Tool](./public/screenshot.png)](https://www.techcrunchsummary.com)

## How it works

This project uses the [OpenAI GPT-3 API](https://openai.com/api/) (specifically, text-davinci-003) and [Vercel Edge functions](https://vercel.com/features/edge-functions) with streaming. It fetches the content on a Techcrunch article, sends it in a prompt to the GPT-3 API to summarize it via a Vercel Edge function, then streams the response back to the application.

Video coming soon on how I built it from scratch!

## Running Locally

After cloning the repo, go to [OpenAI](https://beta.openai.com/account/api-keys) to make an account and put your API key in a file called `.env`.

Then, run the application in the command line and it will be available at `http://localhost:3000`.

```bash
npm run dev
```

## One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nutlope/news-summarizer&env=OPENAI_API_KEY&project-name=techcrunch-summarizer&repo-name=news-summarizer)
