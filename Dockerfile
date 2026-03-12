# ---------- Stage 1: Build frontend ----------
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

COPY grievance-frontend/package*.json ./
RUN npm install

COPY grievance-frontend/ .

RUN npm run build


# ---------- Stage 2: Build backend ----------
FROM node:22-alpine AS backend-builder

WORKDIR /app/backend

COPY grievance-backend/package*.json ./
RUN npm install

COPY grievance-backend/ .

RUN npm run build


# ---------- Stage 3: Production image ----------
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# install backend dependencies
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm install --omit=dev

# copy backend build
COPY --from=backend-builder /app/backend/dist ./dist

# copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000

CMD ["node", "dist/server.js"]