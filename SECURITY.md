# Security Guidelines

## Environment Variables

**CRITICAL**: Never commit `.env` files to version control!

### Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual Stripe secret key in `.env`

3. The `.env` file is in `.gitignore` and will NOT be committed

### Required Environment Variables

- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_`)

### For Deployment

Set environment variables in your hosting platform (Render) dashboard.
**Never** hardcode secrets in your code.

## Stripe Key Security

⚠️ **Your Stripe secret key has full access to your Stripe account!**

### If Exposed:

1. **Immediately roll your API keys** at https://dashboard.stripe.com/apikeys
2. Click "Roll key" next to your secret key
3. Update the new key in:
   - Local `.env` file
   - Render environment variables
   - Any other deployment environments

### Best Practices

- ✅ Use test keys (`sk_test_*`) for development
- ✅ Use live keys (`sk_live_*`) only in production
- ✅ Restrict API key permissions if possible
- ✅ Monitor Stripe dashboard for suspicious activity
- ✅ Rotate keys regularly
- ❌ Never commit `.env` files
- ❌ Never share secret keys
- ❌ Never log secret keys
- ❌ Never expose keys in client-side code

## CORS Configuration

The backend currently allows all origins (`cors()`). For production:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```
