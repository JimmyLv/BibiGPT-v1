import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

export interface OpenAIStreamPayload {
  api_key?: string;
  model: string;
  prompt: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

function checkApiKey(str :string) {
  var pattern = /^sk-[A-Za-z0-9]{48}$/;
  return pattern.test(str);
}

export async function OpenAIStream(payload: OpenAIStreamPayload, apiKey?: string) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const openai_api_key = apiKey || process.env.OPENAI_API_KEY || '';

  if(!checkApiKey(openai_api_key)) {
    throw new Error('OpenAI API Key Format Error')
  }

  const res = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openai_api_key ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  let counter = 0;

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text;
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // maybe parse error
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
