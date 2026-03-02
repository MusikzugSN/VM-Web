FROM node:22.22 AS build

WORKDIR /workspace

# Copy workspace files
COPY package.json package-lock.json ./
COPY nx.json project.json tsconfig.base.json tsconfig.app.json tsconfig.json ./

# Copy source code
COPY src ./src
COPY public ./public
COPY libs ./libs

RUN npm ci

# Build the Angular app using the correct project name
RUN npx nx build Vereinsmanager-Web --configuration=production

# -----------------------------
# Stage 2: Serve with Nginx
# -----------------------------
FROM lscr.io/linuxserver/nginx:1.28.2

RUN rm -rf /usr/share/nginx/html/*

# Copy the built output from Nx
COPY --from=build /workspace/dist/Vereinsmanager-Web/browser /config/www

COPY nginx.conf /config/nginx/site-confs/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

