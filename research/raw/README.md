# Raw Reloadly catalog dump

This directory was *not* committed to keep repo size down.

Full dump location: `~/.openclaw/workspace/gifted-research/raw/`
- `products.json` — 2,961 SKUs (6MB)
- `countries.json` — 169 supported countries

To regenerate from a Reloadly sandbox key:

```bash
# Set RELOADLY_CLIENT_ID, RELOADLY_CLIENT_SECRET, RELOADLY_AUTH_URL,
# RELOADLY_GIFTCARDS_SANDBOX_URL in env (see .env.local.example)

# See gifted-research/scripts/dump-catalog.py (TODO: extract from inline)
```

Pulled: 2026-05-09 ~08:25 GMT+2.
