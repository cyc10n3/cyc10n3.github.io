# Deployment Guide

## GitHub Pages Deployment

This project is configured to deploy to GitHub Pages at: https://wheltd.github.io/

### Automatic Deployment (Recommended)

The site automatically deploys when you push to the main branch using GitHub Actions.

1. Push your changes to the main branch
2. GitHub Actions will automatically build and deploy
3. Site will be available at https://wheltd.github.io/ within a few minutes

### Manual Deployment

If you need to deploy manually:

```bash
# Option 1: Use the deployment script
./deploy.sh

# Option 2: Use npm commands
npm run build:github
npm run deploy:github
```

### Prerequisites

1. **GitHub Repository Setup:**
   - Repository name should be: `wheltd.github.io`
   - Repository should be public
   - GitHub Pages should be enabled in repository settings

2. **Local Setup:**
   - Node.js 18+ installed
   - npm dependencies installed: `npm install`
   - Git configured with GitHub access

### GitHub Pages Configuration

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The workflow will handle the rest

### Troubleshooting

**Build Fails:**
- Check Node.js version (requires 18+)
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors: `npm run type-check`

**Deployment Fails:**
- Ensure you have push access to the repository
- Check GitHub Actions logs for detailed error messages
- Verify GitHub Pages is enabled in repository settings

**Site Not Loading:**
- Wait 5-10 minutes after deployment
- Check GitHub Pages settings in repository
- Verify the site URL: https://wheltd.github.io/

### Custom Domain (Optional)

To use a custom domain:

1. Update `public/CNAME` file with your domain
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings to use custom domain

### Performance

The site is optimized for production with:
- Code splitting
- Asset optimization
- Modern image formats
- Lazy loading
- SEO optimization

### Support

For deployment issues, check:
- GitHub Actions logs
- Repository settings
- Network connectivity
- GitHub status page