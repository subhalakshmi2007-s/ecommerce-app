FROM node:20.18.0-slim

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy frontend files and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && CI=false npm run build

# Expose port
EXPOSE 5000

# Start the server
CMD ["sh", "-c", "cd backend && node server.js"]