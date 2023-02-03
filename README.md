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
- [ ] Do a "share URL" thing
- [ ] Maybe add framer motion to animate down OR handle the text moving up somehow – why wasn't this an issue with others like twitterbio?
- [ ] Add better loading spinner

# Todos v2

- [ ] Make the bullet points into cards
- [ ] Cache with upstash redis
- [ ] Handle errors more gracefully – especially with the featured thing
- [ ] Setup log drain on Vercel to see what sites are working
- [ ] Maybe show article title and author?

# Todos v3

- [ ] Create shareable links
- [ ] Parse URL to make sure it includes techcrunch.com. new URL(string) - make sure it's valid and host name is techcrunch
- [ ] Add a "try one of these options": Add a try one of our links below (put 3 cards here)
- [ ] Make sure to have clean URLs, remove query params
- [ ] Maybe a slider for how long to make the summary
