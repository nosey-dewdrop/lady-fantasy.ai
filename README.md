cat << 'EOF' > README.md
# lady fantasy

AI-powered tarot video experience. Pick cards from a full 78-card deck, and AI turns their meanings into a mystical cinematic narrative.

## how it works

1. you draw cards (3 or 5)
2. AI reads the meanings and builds a narrative video prompt
3. fal.ai generates a cinematic video from it
4. you watch your mystical tarot vision

the tarot figures come alive — they interact, reach toward each other, pass symbolic objects. it's not just a slideshow, it's a story.

## architecture
```
browser  →  /api/generate  →  fal.ai queue (submit)
         →  /api/status    →  fal.ai queue (poll)
         →  /api/result    →  fal.ai queue (get video)
```

API key stays server-side. nobody sees it. ever.

## deploy to vercel (2 min)
```bash
git init
git add .
git commit -m "arcana visio"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/arcana-visio.git
git push -u origin main
```

then go to [vercel.com](https://vercel.com):

1. "Add New Project" → pick your repo
2. framework: Next.js (auto-detected)
3. environment variables → add `FAL_KEY` with your fal.ai key
4. hit deploy. done.

## run locally
```bash
npm install
echo "FAL_KEY=your-key-here" > .env.local
npm run dev
```

open http://localhost:3000 and vibe.

## security

- API key: server-side only, never touches the browser
- model whitelist: only approved fal.ai models allowed
- CORS: handled by vercel automatically

## video models

| model | vibe | cost |
|-------|------|------|
| MiniMax Video-01 | balanced, reliable | ~$0.50 |
| MiniMax Live | more artistic | ~$0.50 |
| Hailuo-02 | budget friendly | ~$0.27 |

## the deck

78 cards total:
- 22 Major Arcana (The Fool → The World)
- 14 Wands (fire, creativity, passion)
- 14 Cups (water, emotions, love)
- 14 Swords (air, intellect, conflict)
- 14 Pentacles (earth, material, wealth)

## stack

- Next.js 15 (App Router)
- React 19
- fal.ai API (video generation)
- Vercel (serverless deployment)

## license

MIT 
EOF