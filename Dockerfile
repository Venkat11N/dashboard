FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy backend
COPY grievance-backend ./grievance-backend

# Install backend dependencies
RUN cd grievance-backend && npm install

# Copy frontend
COPY grievance-frontend ./grievance-frontend

# Install frontend dependencies
RUN cd grievance-frontend && npm install

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 3000

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "tsx", "grievance-backend/src/server.ts"]