# Todos v1

- [x] Make it work with edge functions and streaming instead of just serverless
- [x] Add loading logic and make summary look nicer by splitting into more paragraphs
- [x] Add a footer
- [x] Maybe summarize with bullet points? Maybe I should have a toggle that toggles between this
- [x] Fix SEO and OG image
- [x] Make it work for featured articles – why isn't it?
- [x] techcrunch.com, make it work with a dynamic slug can use [[...slug]].tsx
- [x] Fix mobile styles
- [x] Make sure the summary text looks good
- [x] Do a "share URL" thing
- [x] Create shareable links

# Todos v2

- [x] Go over the logic for handling slugs to clean it up
- [x] Fix issue with it splitting on a string that is telling it about a funding amount
- [x] Add better loading spinner
- [x] Better error handling on frontend
- [x] Set the state of article when it's coming from techcrunch and make button disabled
- [x] Deal with issue of putting in a second article after a first has been summarized. The summary isn't being cleared
- [x] Try the prompt where you are a summary generator thing to test accuracy
- [x] Parse URL to make sure it includes techcrunch.com. new URL(string) - make sure it's valid and host name is techcrunch
- [x] Don't move the text up but just keep going down
- [x] Make UI look nicer
- [ ] Write descriptive README, record Twitter video, and announce

# Todos v3

- [ ] Add rate limiting with Upstash
- [ ] Add buttons/icons after article summary to copy summary, share link ect...
- [ ] Cache with upstash redis – pair with andreas
- [ ] Add auth to API route
- [ ] Add framer motion, specifically the resizable container so everything moves nicely
- [ ] Filter output to only start on a capital letter to eleminate bad prompts
- [ ] Ignore italic text
- [ ] Make enter work
- [ ] Maybe show article title and author?
- [ ] Add a "try one of these options": Add a try one of our links below (put 3 cards here)
