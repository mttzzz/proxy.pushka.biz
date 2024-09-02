# Этап сборки
FROM node:20-alpine as build

# Установите рабочий каталог
WORKDIR /app

# Копирование файлов проекта
COPY package.json /app
COPY pnpm-lock.yaml /app

# Установка npm и pnpm
RUN npm install -g npm@latest pnpm

# Установка зависимостей
RUN pnpm install

# Копирование остальных файлов проекта
COPY . /app

# Использование аргументов сборки для переменных окружения
# ARG MEILISEARCH_URL
# ARG MEILISEARCH_API_KEY

# Установка переменных окружения
# ENV MEILISEARCH_URL=$MEILISEARCH_URL
# ENV MEILISEARCH_API_KEY=$MEILISEARCH_API_KEY

# Сборка приложения
RUN pnpm build


# Этап продакшена
FROM node:20-alpine as prod

WORKDIR /app

COPY --from=build /app/.output /app/.output

EXPOSE 3000/tcp

CMD ["/app/.output/server/index.mjs"]
