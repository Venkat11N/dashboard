FROM node:22-alpine

WORKDIR /app

# Copy backend
COPY grievance-backend ./grievance-backend

# Install backend dependencies
RUN cd grievance-backend && npm install

# Copy frontend
COPY grievance-frontend ./grievance-frontend

# Install frontend dependencies
RUN cd grievance-frontend && npm install

# Build frontend
RUN cd grievance-frontend && npm run build

# Expose backend port
EXPOSE 3000

# Start backend server
CMD ["node", "grievance-backend/server.js"]