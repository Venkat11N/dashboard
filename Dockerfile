# Stage 1: Build the frontend application
FROM node:22-alpine AS frontend-builder
WORKDIR /app/grievance-frontend

# Copy package files and install dependencies to leverage Docker cache
COPY grievance-frontend/package.json grievance-frontend/package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code and build
COPY grievance-frontend/ ./
RUN npx vite build

# Stage 2: Prepare the backend application
FROM node:22-alpine AS backend-builder
WORKDIR /app

# Copy package files and install production dependencies
COPY grievance-backend/package.json grievance-backend/package-lock.json* ./
RUN npm install --production

# Copy backend source code
COPY grievance-backend/ ./

# Stage 3: Create the final production image
FROM node:22-alpine
WORKDIR /app

# Copy backend with production dependencies from the backend-builder stage
COPY --from=backend-builder /app/ ./

# Copy built frontend assets into a 'public' directory for the backend to serve
COPY --from=frontend-builder /app/grievance-frontend/dist ./public

EXPOSE 3000

# Start the backend server. Assumes a 'start' script in your backend's package.json
CMD ["npm", "start"]