# Deployment Guide

## Development Deployment

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:3000`

### Steps
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open browser to `http://localhost:8080`

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Configuration
Create `.env.production`:
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=Production Order Dashboard
```

### Deployment Options

#### Option 1: Static Hosting (Vercel, Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure redirects for SPA routing

#### Option 2: Docker Deployment
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Option 3: Node.js Server
```bash
npm install -g serve
serve -s dist -l 8080
```

### Performance Optimization
- Enable gzip compression
- Configure CDN for static assets
- Set proper cache headers
- Enable service worker for PWA features

### Security Checklist
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Environment variables secured
- [ ] API endpoints validated
- [ ] Rate limiting implemented