# Deployment Guide

## Railway Deployment (Recommended)

Railway is the easiest way to deploy your Kasplex Revoke application.

### Prerequisites
- GitHub account
- Railway account (free tier available)
- Kasplex RPC endpoint URL

### Step-by-Step Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/kasplex-revoke.git
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Visit [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect it's a Next.js app

3. **Configure Environment Variables**
   In Railway dashboard → Settings → Variables, add:
   ```
   NEXT_PUBLIC_RPC_URL=https://your-kasplex-rpc-url.com
   NEXT_PUBLIC_CHAIN_ID=your-chain-id
   NEXT_PUBLIC_ENVIRONMENT=production
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - You'll receive a public URL (e.g., `your-app.railway.app`)

### Custom Domain (Optional)
- In Railway → Settings → Domains
- Add your custom domain
- Configure DNS as instructed

## Alternative Deployment Options

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard

### Docker
1. Build: `docker build -t kasplex-revoke .`
2. Run: `docker run -p 3000:3000 -e NEXT_PUBLIC_RPC_URL=your-url kasplex-revoke`

### Traditional VPS
1. Install Node.js 18+
2. Clone repository
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Start: `npm start`
6. Use PM2 for process management: `pm2 start npm --name "kasplex-revoke" -- start`

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_RPC_URL` | Yes | Kasplex RPC endpoint | `https://rpc.kasplex.com` |
| `NEXT_PUBLIC_CHAIN_ID` | Yes | Network chain ID | `1337` |
| `NEXT_PUBLIC_ENVIRONMENT` | No | Environment type | `production` |

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] RPC endpoint is secure and reliable
- [ ] Application is served over HTTPS
- [ ] CSP headers are configured (if applicable)
- [ ] Regular security updates planned

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics, Plausible)
- Uptime monitoring (UptimeRobot)
- Performance monitoring (Vercel Analytics)

## Troubleshooting

### Common Issues

**Build fails with "Module not found"**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally first

**RPC connection errors**
- Verify `NEXT_PUBLIC_RPC_URL` is correct
- Check if RPC endpoint is accessible
- Confirm chain ID matches the network

**Wallet connection issues**
- Ensure the app is served over HTTPS in production
- Check that Web3Modal is configured correctly
- Verify wallet supports the target network

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review Railway/deployment platform logs
3. Verify environment variables are set
4. Test locally with production build: `npm run build && npm start`