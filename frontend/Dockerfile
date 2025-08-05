# ---快速開發使用Vite dev server----
ARG REGISTRY_PREFIX=""
FROM ${REGISTRY_PREFIX}node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# 開發用啟動指令，開放 3001 port
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ---- 後續生產階段使用：Nginx server ----
# FROM node:20 AS build

# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install

# COPY . .
# RUN npm run build

# # Production階段，使用 Nginx 提供靜態檔案
# FROM nginx:alpine

# # 複製 Vite build 出來的檔案到 Nginx 靜態目錄
# COPY --from=build /app/dist /usr/share/nginx/html

# # 暴露 80 port（Nginx 預設端口）
# EXPOSE 80

# # 啟動 Nginx 服務（前台執行）
# CMD ["nginx", "-g", "daemon off;"]