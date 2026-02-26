FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
	&& pnpm install --frozen-lockfile \
	&& pnpm rebuild sqlite3

COPY tsconfig.json ./
COPY src ./src

RUN pnpm build

ENV NODE_ENV=production

CMD ["pnpm", "start"]
