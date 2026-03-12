FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy backend package files
COPY grievance-backend/package*.json ./grievance-backend/

# Install backend dependencies
RUN cd grievance-backend && npm install

# Copy rest of backend code
COPY grievance-backend ./grievance-backend

# Copy frontend
COPY grievance-frontend ./grievance-frontend
# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]