# 🚀 Deploy Week 1 Security Features

## Quick Start (15 minutes)

Follow these steps to deploy the security features implemented by the CODER agent.

---

## Step 1: Set Up Sentry (5 minutes)

### 1.1 Create Sentry Account
1. Go to https://sentry.io/signup/
2. Choose "Next.js" as your platform
3. Create a new project named "Gifted"

### 1.2 Get Your DSN
1. In Sentry dashboard → Project Settings → Client Keys (DSN)
2. Copy the DSN (format: `https://xxx@yyy.ingest.sentry.io/zzz`)

### 1.3 Add to Vercel
```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# When prompted, paste your Sentry DSN
```

**Example DSN:**
```
https://examplePublicKey@o0.ingest.sentry.io/0
```

---

## Step 2: Set Up Upstash Redis (5 minutes)

### 2.1 Create Upstash Account
1. Go to https://console.upstash.com/
2. Sign up (free tier is sufficient)

### 2.2 Create Redis Database
1. Click "Create Database"
2. Name: `gifted-rate-limiting`
3. Region: Choose closest to your users (e.g., `us-east-1`)
4. Type: `Regional` (free tier)
5. Click "Create"

### 2.3 Get Credentials
1. In database dashboard, find **REST API** section
2. Copy:
   - **UPSTASH_REDIS_REST_URL** (e.g., `https://xxx.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long string)

### 2.4 Add to Vercel
```bash
vercel env add UPSTASH_REDIS_REST_URL production
# Paste: https://your-redis.upstash.io

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste: your-long-token-string
```

---

## Step 3: Deploy to Production (2 minutes)

### 3.1 Trigger Deployment
Since code is already pushed to GitHub, you have two options:

**Option A: Vercel Auto-Deploy (Recommended)**
- Vercel will automatically detect the GitHub push
- Go to https://vercel.com/dashboard
- Wait for deployment to complete (~2 minutes)

**Option B: Manual Deploy**
```bash
cd /Users/administrator/.openclaw/workspace/gifted-project
vercel --prod --yes
```

### 3.2 Wait for Build
Monitor the build logs:
- ✅ Build should complete successfully
- ⚠️ Upstash warnings during build are normal (env vars load at runtime)
- ⏱️ Estimated time: 1-2 minutes

---

## Step 4: Verify Deployment (3 minutes)

### 4.1 Test Rate Limiting

```bash
# Get your production URL (if using Vercel auto-deploy)
PROD_URL="https://gifted-project-blue.vercel.app"

# Test 1: Normal request (should work)
curl -w "\nStatus: %{http_code}\n" \
  "$PROD_URL/api/reloadly/products?country=US"

# Expected: 200 OK with gift card data

# Test 2: Rate limiting (make 15 rapid requests)
for i in {1..15}; do
  echo "Request $i:"
  curl -w "\nStatus: %{http_code}\n" \
    "$PROD_URL/api/reloadly/products?country=US" \
    2>/dev/null | grep -E "(Status|error|remaining)"
  sleep 0.5
done

# Expected: First 10 succeed, next 5 return 429 Too Many Requests
```

**What to look for:**
- ✅ First 10 requests: `Status: 200`
- ✅ Requests 11-15: `Status: 429` with error "Too many requests"
- ✅ Response headers include:
  ```
  X-RateLimit-Limit: 10
  X-RateLimit-Remaining: 7
  X-RateLimit-Reset: 1712857260
  ```

### 4.2 Test Sentry Error Tracking

```bash
# Trigger a validation error (missing country param)
curl "$PROD_URL/api/reloadly/products"

# Expected: 400 Bad Request
```

Then:
1. Go to Sentry dashboard: https://sentry.io
2. Click on "Gifted" project
3. You should see the error appear within ~10 seconds
4. Click on the error to see:
   - Stack trace
   - Request details (URL, headers)
   - User IP
   - Timestamp

### 4.3 Verify Environment Variables

```bash
# List all production env vars
vercel env ls production

# Expected output should include:
# NEXT_PUBLIC_SENTRY_DSN
# UPSTASH_REDIS_REST_URL
# UPSTASH_REDIS_REST_TOKEN
# (plus existing Reloadly vars)
```

---

## Step 5: Upstash Dashboard (1 minute)

### Check Rate Limit Analytics

1. Go to https://console.upstash.com/
2. Click on `gifted-rate-limiting` database
3. Go to "Analytics" tab
4. You should see:
   - Request count increasing
   - Rate limit hits (if you triggered 429s)
   - Memory usage

**Expected metrics after testing:**
- Total Requests: ~20-30
- Denied Requests: ~5 (from rate limit test)
- Database Size: <1 KB

---

## ✅ Success Checklist

- [ ] Sentry DSN added to Vercel
- [ ] Upstash credentials added to Vercel
- [ ] Deployment succeeded (no build errors)
- [ ] Rate limiting works (429 after 10 requests)
- [ ] Errors appear in Sentry dashboard
- [ ] Upstash analytics show requests

**If all checked:** 🎉 Week 1 security features are live!

---

## 📊 Monitoring Dashboards

### Sentry (Error Tracking)
**URL:** https://sentry.io/organizations/your-org/projects/gifted/  
**Check daily for:**
- New errors or performance issues
- User-reported bugs
- API failures

### Upstash (Rate Limiting)
**URL:** https://console.upstash.com/  
**Check weekly for:**
- Rate limit abuse patterns
- Blocked IPs
- Memory usage (should stay <10 MB)

### Vercel (Deployment)
**URL:** https://vercel.com/dashboard  
**Check after each deploy:**
- Build status
- Function logs (errors appear here too)
- Analytics (if enabled)

---

## 🚨 Troubleshooting

### Build Fails with "UPSTASH_REDIS_REST_URL is undefined"

**Cause:** Environment variables not set in Vercel  
**Fix:**
```bash
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
# Then redeploy
```

### Rate Limiting Not Working (always returns 200)

**Cause 1:** Upstash credentials incorrect  
**Fix:** Check credentials in Upstash dashboard, re-add to Vercel

**Cause 2:** Redis database paused (free tier inactivity)  
**Fix:** Go to Upstash dashboard → Resume database

### Sentry Not Capturing Errors

**Cause 1:** DSN incorrect  
**Fix:** Verify DSN format: `https://xxx@yyy.ingest.sentry.io/zzz`

**Cause 2:** Client-side errors only (Sentry configured for server-side)  
**Fix:** This is expected - current setup tracks server API errors primarily

### 429 Errors for Legitimate Users

**Cause:** Rate limit too strict (10/10s)  
**Fix:** Edit `lib/rate-limit.ts`:
```typescript
// Change from 10/10s to 20/10s
limiter: Ratelimit.slidingWindow(20, "10 s"),
```

Then redeploy.

---

## 📈 What's Next?

### Week 2 Priorities (14 hours)

From the RESEARCHER's roadmap:

1. **Uptime Monitoring** (UptimeRobot)
   - 5-minute checks
   - Email/SMS alerts
   - Public status page

2. **Response Caching** (Redis)
   - Cache product lists (15-minute TTL)
   - Reduce Reloadly API calls
   - Faster response times

3. **IP Whitelisting** (Reloadly Sandbox)
   - Restrict API access to Vercel IPs
   - Requires manual setup in Reloadly dashboard

4. **Health Check Endpoint**
   - `/api/health` for monitoring
   - Check Redis, Reloadly connectivity
   - Return 200 OK if healthy

5. **Runbook Documentation**
   - Incident response procedures
   - On-call escalation
   - Recovery steps

**Estimated time:** 14 hours  
**Risk reduction:** 80% (from current 60%)

---

## 💰 Cost Tracking

### Current Monthly Costs (Free Tier)

| Service | Usage | Limit | Cost |
|---------|-------|-------|------|
| **Sentry** | 0 errors | 5,000/month | $0 |
| **Upstash Redis** | 0 requests | 10,000/day | $0 |
| **Vercel** | 1 deployment | Unlimited | $0 |

**Total:** $0/month

### When You'll Need to Upgrade

**Sentry:**
- Free tier sufficient unless hitting 5,000 errors/month
- If that happens, you have bigger problems! (indicates major bugs)

**Upstash:**
- Free tier: 10,000 requests/day = ~300 DAU
- Upgrade at: ~500 DAU = $10/month
- At 10,000 DAU: ~$30/month

**Total expected cost at scale:** $30-50/month for 10k DAU

---

## 📚 Additional Resources

### Documentation
- [Sentry Next.js Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Support
- **Sentry:** support@sentry.io
- **Upstash:** support@upstash.com
- **Vercel:** https://vercel.com/support

### Code Reference
- `lib/rate-limit.ts` - Rate limiting logic
- `sentry.client.config.ts` - Client error tracking
- `sentry.server.config.ts` - Server error tracking
- `app/global-error.tsx` - React render error handler

---

## 🎯 Success Metrics

After deployment, you should see:

**Day 1:**
- ✅ 0 build errors
- ✅ Rate limiting active (visible in Upstash)
- ✅ Sentry configured (test error captured)

**Week 1:**
- ✅ No critical errors in Sentry
- ✅ <5 rate limit violations per day (indicates healthy traffic)
- ✅ API response time <500ms (visible in Vercel logs)

**Month 1:**
- ✅ 99.9% uptime (once UptimeRobot added in Week 2)
- ✅ <10 unresolved Sentry errors
- ✅ <1% of requests rate-limited

---

**Deployment Guide Version:** 1.0  
**Last Updated:** 2026-04-11  
**Agent:** CODER (Swarm Workflow)

🚀 **Ready to deploy? Start with Step 1!**
