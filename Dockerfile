# Build the static site, then serve it with nginx (security headers and routing come from the generated nginx.conf).
#   docker build -t kubedojo --build-arg VITE_SITE_URL=https://your-domain.example .
#   docker run --rm -p 8080:80 kubedojo
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_SITE_URL=""
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist/_deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/_deploy
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
