/**
 * Per-locale × per-brand hand-authored copy registry.
 *
 * Lookup order in `resolveCopy()`:
 *   1. COPY[locale][slug]                         ← exact match
 *   2. COPY['en'][slug]                           ← English baseline (always present)
 *   3. generateFallbackCopy(brand, locale)        ← templated, marked TODO
 *
 * Phase-1 coverage:
 *   - en (baseline): ALL 20 brands. en-IE/en-AU/en-MT/en-NZ ship as-is.
 *   - fi-FI: 5 brands hand-translated (Netflix, Steam, App Store/iTunes,
 *     PlayStation, Fortnite — the 5 highest-value Finnish cells per the
 *     research scoring).
 *   - ar-AE: 1 brand (Amazon — the highest-value AE cell).
 *   - pl-PL: 1 brand (Netflix — the highest-value PL cell).
 *   - All others fall back to English copy with `isFallback=true` for
 *     downstream "needs translation" markers.
 */

import type { Locale } from '@/lib/i18n/config'
import type { BrandSlug, BrandCopy } from './types'

type CopyMap = Partial<
  Record<Locale | 'en', Partial<Record<BrandSlug, BrandCopy>>>
>

// ---------------------------------------------------------------------------
// English baseline — ALL 20 brands. Production-ready for en-IE/AU/MT/NZ.
// ---------------------------------------------------------------------------

const EN: Record<BrandSlug, BrandCopy> = {
  netflix: {
    heroTitle: 'Buy a Netflix Gift Card — Instant Email Delivery',
    heroSubtitle: 'Pay by card, receive your code in minutes, redeem on Netflix.',
    description:
      'A Netflix gift card is the easiest way to share a year of binge-worthy series and films. ' +
      'Buy yours from Gifted, get the code emailed to you in minutes, and redeem it on any ' +
      'Netflix account — no subscription baked in, no commitment, just unlimited entertainment ' +
      'for the recipient. Works on every device Netflix supports.',
    keywords: [
      'netflix gift card',
      'buy netflix gift card',
      'netflix code',
      'netflix digital gift',
      'netflix voucher',
    ],
    faq: [
      {
        question: 'How fast does the code arrive?',
        answer:
          'Usually within 5 minutes of payment, delivered straight to your email inbox.',
      },
      {
        question: 'Does the recipient need a Netflix account?',
        answer:
          'They need a Netflix account to redeem, but they can create one during the redemption flow if they don’t have one yet.',
      },
      {
        question: 'Where can the code be redeemed?',
        answer:
          'Netflix gift cards are region-specific — buy the right currency for the country where the account is registered.',
      },
      {
        question: 'Is the payment secure?',
        answer:
          'Yes. We use Stripe for card processing — one of the most trusted payment providers in the world. Your card details never touch our servers.',
      },
      {
        question: 'Can the code be refunded?',
        answer:
          'Unredeemed codes can be refunded within 14 days. Once a code is revealed and applied to an account, it cannot be refunded.',
      },
    ],
  },

  steam: {
    heroTitle: 'Buy a Steam Gift Card — Instant Wallet Top-Up',
    heroSubtitle: 'Games, DLC, in-game items — everything Steam sells.',
    description:
      'A Steam gift card is the no-fail present for any PC gamer. Buy yours from Gifted in your ' +
      'local currency, receive the code instantly by email, and add it to any Steam wallet. ' +
      'Use it for full-price games, DLC, in-game cosmetics, software — anything in the Steam ' +
      'store. No expiry date, no fees: balance stays on the account until it’s spent.',
    keywords: [
      'steam gift card',
      'steam wallet code',
      'buy steam credit',
      'steam digital code',
      'pc gamer gift',
    ],
    faq: [
      {
        question: 'Does the code work for any Steam account?',
        answer:
          'Steam wallet codes are region-locked — match the currency of the recipient’s Steam account country.',
      },
      {
        question: 'What can Steam balance be spent on?',
        answer:
          'Games, DLC, in-game items, software, and anything else listed in the Steam store.',
      },
      {
        question: 'Does the balance expire?',
        answer:
          'No — once added to a Steam wallet, the balance stays until it’s spent.',
      },
      {
        question: 'Can I gift the code to someone else?',
        answer:
          'Yes. Forward the email or share the code directly. The recipient enters it into the Steam client to redeem.',
      },
      {
        question: 'How quickly does the code arrive?',
        answer:
          'Usually within 5 minutes of payment, to the email address you provide at checkout.',
      },
    ],
  },

  'app-store-itunes': {
    heroTitle: 'Buy an App Store & iTunes Gift Card — Apple ID Top-Up',
    heroSubtitle: 'Apps, games, music, films and iCloud — one code, the entire Apple ecosystem.',
    description:
      'An App Store & iTunes gift card unlocks the whole Apple ecosystem: apps, games, Apple ' +
      'Music, Apple TV+, iCloud+ storage, in-app purchases — anything bought through an Apple ' +
      'ID. Buy from Gifted, get the code in minutes by email, and add the balance to any Apple ' +
      'ID. Codes are region-specific: match the currency to the recipient’s country.',
    keywords: [
      'app store gift card',
      'itunes gift card',
      'apple id top up',
      'apple gift card',
      'iphone gift card',
    ],
    faq: [
      {
        question: 'Can the balance be used for Apple Music?',
        answer:
          'Yes — Apple ID balance covers Apple Music, Apple TV+, Apple Arcade, iCloud+, the App Store, iTunes Store, and any in-app purchases.',
      },
      {
        question: 'Does the code work in any country?',
        answer:
          'No — Apple gift cards are region-locked. Match the currency to the country where the Apple ID is registered.',
      },
      {
        question: 'Does the balance expire?',
        answer:
          'No — Apple ID balance stays on the account permanently.',
      },
      {
        question: 'How is the code redeemed?',
        answer:
          'Open the App Store, tap the profile icon, then "Redeem Gift Card or Code" and enter the code.',
      },
      {
        question: 'How quickly does it arrive?',
        answer:
          'Usually within 5 minutes of payment, to the email address used at checkout.',
      },
    ],
  },

  playstation: {
    heroTitle: 'Buy a PlayStation Store Gift Card — PSN Wallet Top-Up',
    heroSubtitle: 'Games, DLC, PlayStation Plus — everything the PS Store offers.',
    description:
      'A PlayStation Store gift card is the go-to present for PS4 and PS5 players. Buy from ' +
      'Gifted in your local currency, get the code in minutes, and add the balance to any PSN ' +
      'account. Use it for full-price games, DLC, PlayStation Plus subscriptions, or movie ' +
      'rentals. Codes are region-locked — match the currency to the account country.',
    keywords: [
      'playstation gift card',
      'psn code',
      'ps5 gift card',
      'playstation store credit',
      'ps plus gift card',
    ],
    faq: [
      {
        question: 'Does the code work for any PlayStation account?',
        answer:
          'PSN gift cards are region-locked — match the currency to the country where the account is registered.',
      },
      {
        question: 'Can I buy PlayStation Plus with PSN balance?',
        answer:
          'Yes — PSN wallet balance covers PlayStation Plus subscriptions and renewals.',
      },
      {
        question: 'Does the balance expire?',
        answer: 'No — PSN wallet balance stays on the account until it’s spent.',
      },
      {
        question: 'How is the code redeemed?',
        answer:
          'On the console: PS Store → Redeem Codes. On the web: PlayStation.com → Account → Payment & Subscriptions → Redeem Codes.',
      },
      {
        question: 'Does it work on both PS4 and PS5?',
        answer:
          'Yes — the wallet balance is shared across every PlayStation console signed in to the account.',
      },
    ],
  },

  fortnite: {
    heroTitle: 'Buy a Fortnite V-Bucks Gift Card — Instant Code',
    heroSubtitle: 'V-Bucks for skins, emotes, the Battle Pass — delivered to your inbox.',
    description:
      'A Fortnite gift card converts to V-Bucks, the in-game currency for skins, emotes, ' +
      'pickaxes and the Battle Pass. Buy from Gifted, receive the code by email in minutes, ' +
      'and redeem it on any Epic Games account. V-Bucks are tied to the Epic account, so they ' +
      'work across PC, PS5, Xbox, Switch and mobile.',
    keywords: [
      'fortnite gift card',
      'v-bucks code',
      'buy v-bucks',
      'fortnite battle pass',
      'epic games gift card',
    ],
    faq: [
      {
        question: 'Do V-Bucks work across all platforms?',
        answer:
          'Yes — V-Bucks are tied to the Epic Games account, so they work on PC, PS5, Xbox, Switch and mobile.',
      },
      {
        question: 'How is the code redeemed?',
        answer:
          'Visit fortnite.com/vbuckscard and sign in with the Epic Games account, then enter the code.',
      },
      {
        question: 'Can I buy the Battle Pass with V-Bucks?',
        answer:
          'Yes — V-Bucks cover the Battle Pass plus any item from the in-game store.',
      },
      {
        question: 'Is there an age restriction?',
        answer:
          'Fortnite requires an Epic Games account. Players under 13 need parental consent.',
      },
      {
        question: 'Do V-Bucks expire?',
        answer:
          'No — once redeemed, V-Bucks stay on the account until they’re spent.',
      },
    ],
  },

  xbox: {
    heroTitle: 'Buy an Xbox Gift Card — Microsoft Store Credit',
    heroSubtitle: 'Games, Game Pass, in-game items — for Xbox and Windows PC.',
    description:
      'An Xbox gift card adds balance to any Microsoft account, ready to spend on full-price ' +
      'games, DLC, in-game items, or Xbox Game Pass subscriptions. Works on Xbox consoles and ' +
      'Windows PCs running the Microsoft Store. Buy from Gifted, get the code by email in ' +
      'minutes, and redeem on the recipient’s Microsoft account.',
    keywords: [
      'xbox gift card',
      'microsoft gift card',
      'xbox game pass code',
      'xbox live credit',
      'xbox digital code',
    ],
    faq: [
      {
        question: 'Does the code work on PC and Xbox?',
        answer:
          'Yes — Xbox gift cards add balance to a Microsoft account, which works on Xbox consoles and Windows PCs.',
      },
      {
        question: 'Can I buy Game Pass with the balance?',
        answer:
          'Yes — Microsoft account balance covers Xbox Game Pass and Game Pass Ultimate subscriptions.',
      },
      {
        question: 'Does the code work in any region?',
        answer:
          'No — Xbox gift cards are region-locked. Match the currency to the account country.',
      },
      {
        question: 'Does the balance expire?',
        answer: 'No — once added, the balance stays on the account until spent.',
      },
      {
        question: 'How is the code redeemed?',
        answer:
          'On Xbox: Microsoft Store → Redeem. On the web: account.microsoft.com/billing → Redeem code.',
      },
    ],
  },

  'mobile-legends': {
    heroTitle: 'Buy a Mobile Legends Diamonds Gift Card',
    heroSubtitle: 'Diamonds for heroes, skins and battle passes — delivered instantly.',
    description:
      'A Mobile Legends: Bang Bang gift card converts to Diamonds, the premium currency used to ' +
      'buy heroes, skins, emotes and battle passes in MLBB. Buy from Gifted, get the code by ' +
      'email, and redeem it via Moonton account top-up. Mobile-only game; codes work for any ' +
      'Moonton account region.',
    keywords: [
      'mobile legends gift card',
      'mlbb diamonds',
      'buy mobile legends diamonds',
      'moonton gift card',
      'mlbb code',
    ],
    faq: [
      {
        question: 'How are Diamonds redeemed?',
        answer:
          'Use the code at the Moonton recharge page (mtopup.moontongames.com) or via the in-game top-up screen.',
      },
      {
        question: 'Do the Diamonds work on iOS and Android?',
        answer: 'Yes — Diamonds are tied to the Moonton account, not the device.',
      },
      {
        question: 'Can I buy heroes with Diamonds?',
        answer:
          'Yes — Diamonds cover heroes, skins, emotes, the Starlight Membership and the Battle Pass.',
      },
      {
        question: 'Do Diamonds expire?',
        answer:
          'No — once added, Diamonds remain on the account until used.',
      },
    ],
  },

  'world-of-warcraft': {
    heroTitle: 'Buy a Battle.net / World of Warcraft Gift Card',
    heroSubtitle: 'Game time, mounts, expansions — credit on Battle.net.',
    description:
      'A Battle.net gift card adds balance to a Blizzard account, ready to spend on World of ' +
      'Warcraft subscriptions, mounts, services and any other Blizzard title — Diablo, ' +
      'Overwatch, StarCraft. Buy from Gifted, receive the code by email, redeem in the ' +
      'Battle.net app. Codes are region-specific.',
    keywords: [
      'world of warcraft gift card',
      'battle.net gift card',
      'wow game time',
      'blizzard gift card',
      'wow subscription',
    ],
    faq: [
      {
        question: 'Can the balance be used for WoW subscription?',
        answer:
          'Yes — Battle.net balance covers WoW game time, plus any other Blizzard title’s in-game store.',
      },
      {
        question: 'Where is the code redeemed?',
        answer:
          'In the Battle.net desktop app: account dropdown → Redeem a code.',
      },
      {
        question: 'Is the code region-locked?',
        answer:
          'Yes — match the currency to the country where the Battle.net account is registered.',
      },
      {
        question: 'Does the balance expire?',
        answer: 'No — Battle.net balance stays on the account until spent.',
      },
    ],
  },

  'crypto-voucher': {
    heroTitle: 'Buy a Crypto Voucher — Convert to Bitcoin or Ethereum Instantly',
    heroSubtitle: 'A simple way to gift crypto. No exchange account needed.',
    description:
      'A Crypto Voucher is a prepaid code that the recipient can swap for Bitcoin, Ethereum, ' +
      'Litecoin and other major cryptocurrencies — no exchange registration required for small ' +
      'amounts. Buy from Gifted, receive the code by email, and gift it as the simplest entry ' +
      'point into crypto. Region availability varies; check Crypto Voucher’s site for current ' +
      'supported coins and limits.',
    keywords: [
      'crypto voucher',
      'buy bitcoin gift card',
      'crypto gift card',
      'ethereum voucher',
      'cryptocurrency gift',
    ],
    faq: [
      {
        question: 'Which cryptocurrencies are supported?',
        answer:
          'Crypto Voucher supports a rotating list including Bitcoin, Ethereum, Litecoin, Bitcoin Cash and several others — see crypto-voucher.com for the current list.',
      },
      {
        question: 'Do I need an exchange account?',
        answer:
          'For small amounts, no — Crypto Voucher’s redemption flow handles the conversion. Larger amounts may trigger KYC.',
      },
      {
        question: 'Where is the code redeemed?',
        answer: 'At crypto-voucher.com — paste the code and choose the coin.',
      },
      {
        question: 'Does the code expire?',
        answer:
          'Crypto Voucher codes typically remain valid for 12 months from purchase — confirm on their site.',
      },
    ],
  },

  amazon: {
    heroTitle: 'Buy an Amazon Gift Card — Use on Any Amazon Region',
    heroSubtitle: 'The most flexible gift card. Pay by card, get the code in minutes.',
    description:
      'An Amazon gift card lets the recipient pick anything from Amazon’s catalogue — ' +
      'electronics, fashion, books, household, anything. Buy from Gifted in your local ' +
      'currency, get the code by email in minutes, and add it to any Amazon account. Codes ' +
      'are region-specific: an Amazon.de card works on Amazon.de, an Amazon.ae card on ' +
      'Amazon.ae, and so on.',
    keywords: [
      'amazon gift card',
      'amazon code',
      'buy amazon voucher',
      'amazon digital gift',
      'amazon credit',
    ],
    faq: [
      {
        question: 'Where can the code be redeemed?',
        answer:
          'Amazon gift cards are region-locked. An Amazon.de card works on Amazon.de, an Amazon.co.uk card on Amazon.co.uk, etc.',
      },
      {
        question: 'How is the code redeemed?',
        answer:
          'Sign in to the regional Amazon site, go to "Gift cards", choose "Add to your balance", and enter the code.',
      },
      {
        question: 'Does the balance expire?',
        answer: 'No — Amazon gift card balance does not expire.',
      },
      {
        question: 'Can I gift the code to someone else?',
        answer:
          'Yes — forward the email or share the code, and the recipient applies it to their own Amazon account.',
      },
      {
        question: 'How quickly does the code arrive?',
        answer:
          'Usually within 5 minutes of payment, to the email address you provide at checkout.',
      },
    ],
  },

  twitch: {
    heroTitle: 'Buy a Twitch Gift Card — Bits & Subscriptions',
    heroSubtitle: 'Support your favourite streamers. Subscribe to channels.',
    description:
      'A Twitch gift card adds balance for Bits — Twitch’s in-platform currency used to cheer ' +
      'streamers — and for channel subscriptions. Buy from Gifted, get the code by email, ' +
      'and redeem it via your Twitch account settings. Codes are tied to the redeeming Twitch ' +
      'account.',
    keywords: [
      'twitch gift card',
      'twitch bits',
      'twitch subscription gift',
      'twitch credit',
      'streamer gift card',
    ],
    faq: [
      {
        question: 'What can the balance be used for?',
        answer:
          'Twitch balance covers Bits (cheering streamers) and channel subscriptions.',
      },
      {
        question: 'Where is the code redeemed?',
        answer:
          'On twitch.tv: account settings → "Redeem code". Apply to the receiving account.',
      },
      {
        question: 'Does it expire?',
        answer: 'No — Twitch balance stays on the account until spent.',
      },
      {
        question: 'Can the code be transferred?',
        answer:
          'Once redeemed, the balance is bound to the Twitch account and cannot be transferred.',
      },
    ],
  },

  flixbus: {
    heroTitle: 'Buy a FlixBus Gift Card — European Bus Tickets',
    heroSubtitle: 'Travel across Europe by bus. Apply at FlixBus checkout.',
    description:
      'A FlixBus gift card pays for any FlixBus or FlixTrain ticket across Europe and beyond. ' +
      'Buy from Gifted, receive the code by email in minutes, and apply it at FlixBus.com ' +
      'checkout. Region availability follows FlixBus’s own coverage; verify the recipient’s ' +
      'route before purchase.',
    keywords: [
      'flixbus gift card',
      'flixbus voucher',
      'european bus tickets',
      'flixtrain gift card',
      'travel gift card',
    ],
    faq: [
      {
        question: 'How is the voucher redeemed?',
        answer:
          'At FlixBus.com checkout, enter the voucher code in the "Voucher code" field before payment.',
      },
      {
        question: 'Where can it be used?',
        answer:
          'On any FlixBus or FlixTrain route — across Europe and selected international destinations.',
      },
      {
        question: 'Does it expire?',
        answer:
          'FlixBus vouchers typically remain valid for 3 years from purchase — verify on FlixBus’s site.',
      },
      {
        question: 'Can the code cover multiple bookings?',
        answer:
          'Yes — partial balance can be used across multiple bookings until exhausted.',
      },
    ],
  },

  talabat: {
    heroTitle: 'Buy a Talabat Gift Card — Food Delivery Credit',
    heroSubtitle: 'Instant credit for food, groceries and quick commerce in MENA.',
    description:
      'A Talabat gift card adds balance to a Talabat account, ready to spend on food delivery, ' +
      'groceries and tDaily services across the UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, ' +
      'Oman, Jordan and Egypt. Buy from Gifted, receive the code by email, and redeem in the ' +
      'Talabat app.',
    keywords: [
      'talabat gift card',
      'talabat voucher',
      'food delivery gift card mena',
      'talabat credit',
      'uae food delivery gift',
    ],
    faq: [
      {
        question: 'Where is the code redeemed?',
        answer:
          'In the Talabat app: Account → Talabat Wallet → Add credit / Redeem code.',
      },
      {
        question: 'Which countries does Talabat cover?',
        answer:
          'UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman, Jordan and Egypt.',
      },
      {
        question: 'Can it be used for groceries?',
        answer:
          'Yes — Talabat balance covers restaurant orders, groceries (tMart) and tDaily services.',
      },
      {
        question: 'Does the balance expire?',
        answer:
          'Talabat wallet balance typically remains valid for 12 months — verify in-app.',
      },
    ],
  },

  starzplay: {
    heroTitle: 'Buy a STARZPLAY Subscription Gift Card',
    heroSubtitle: 'Streaming hits, Arabic originals, sport — across MENA.',
    description:
      'A STARZPLAY gift card prepays a subscription credit on the MENA streaming service ' +
      'STARZPLAY — Arabic originals, Hollywood hits, kids and sport. Buy from Gifted, get the ' +
      'code by email, and redeem on starzplay.com under "Redeem code". Bound to the redeeming ' +
      'STARZPLAY account.',
    keywords: [
      'starzplay gift card',
      'starzplay subscription',
      'mena streaming gift card',
      'arabic streaming voucher',
    ],
    faq: [
      {
        question: 'Where is the code redeemed?',
        answer:
          'At starzplay.com under "Redeem code", or in the STARZPLAY app account settings.',
      },
      {
        question: 'Which countries does STARZPLAY cover?',
        answer:
          'STARZPLAY operates across MENA — including UAE, Saudi Arabia, Egypt, Kuwait and others.',
      },
      {
        question: 'Can the code be transferred?',
        answer:
          'Once redeemed, the credit is bound to the STARZPLAY account and cannot be moved.',
      },
      {
        question: 'Does the credit expire?',
        answer:
          'Unredeemed codes are typically valid for 12 months. Once redeemed, the subscription period starts immediately.',
      },
    ],
  },

  'nintendo-eshop': {
    heroTitle: 'Buy a Nintendo eShop Gift Card — Switch Wallet Top-Up',
    heroSubtitle: 'Games, DLC and Nintendo Switch Online — credit on the eShop.',
    description:
      'A Nintendo eShop gift card adds balance to a Nintendo Account, spendable on Switch ' +
      'games, DLC and Nintendo Switch Online subscriptions. Buy from Gifted, receive the code ' +
      'by email, and redeem on the eShop or Nintendo’s website. Codes are region-locked — ' +
      'match the currency to the recipient’s account country.',
    keywords: [
      'nintendo eshop gift card',
      'nintendo switch gift card',
      'switch eshop credit',
      'nintendo gift card',
      'switch online subscription',
    ],
    faq: [
      {
        question: 'Where is the code redeemed?',
        answer:
          'On the Switch: eShop → user icon → Redeem Code. On the web: accounts.nintendo.com → Shop menu → Redeem.',
      },
      {
        question: 'Is the code region-locked?',
        answer:
          'Yes — match the currency to the country where the Nintendo Account is registered.',
      },
      {
        question: 'Can I buy Switch Online with the balance?',
        answer:
          'Yes — eShop balance covers Switch Online individual and family memberships.',
      },
      {
        question: 'Does the balance expire?',
        answer: 'No — eShop balance stays on the account until spent.',
      },
    ],
  },

  'google-play': {
    heroTitle: 'Buy a Google Play Gift Card — Android Wallet Credit',
    heroSubtitle: 'Apps, games, films, books and in-app purchases — instant code.',
    description:
      'A Google Play gift card adds balance to a Google account, spendable on apps, games, ' +
      'films, books, in-app purchases and Google Play subscriptions. Buy from Gifted, receive ' +
      'the code by email, and redeem at play.google.com/redeem. Codes are region-specific — ' +
      'match the currency to the account country.',
    keywords: [
      'google play gift card',
      'google play code',
      'android gift card',
      'play store credit',
      'google play voucher',
    ],
    faq: [
      {
        question: 'Where is the code redeemed?',
        answer:
          'At play.google.com/redeem or in the Play Store app: profile → Payments & subscriptions → Redeem code.',
      },
      {
        question: 'Is the code region-locked?',
        answer:
          'Yes — match the currency to the country where the Google account is registered.',
      },
      {
        question: 'What can the balance be spent on?',
        answer:
          'Apps, games, in-app purchases, films, books, and Google Play subscriptions like YouTube Premium.',
      },
      {
        question: 'Does the balance expire?',
        answer: 'No — Google Play balance stays on the account until spent.',
      },
    ],
  },

  spotify: {
    heroTitle: 'Buy a Spotify Premium Gift Card',
    heroSubtitle: 'Prepaid Premium subscription. No card-on-file required.',
    description:
      'A Spotify gift card prepays a Spotify Premium subscription — ad-free music, offline ' +
      'downloads, podcasts. Buy from Gifted, get the code by email, and redeem at ' +
      'spotify.com/redeem. Codes are region-locked — match the currency to the recipient’s ' +
      'Spotify country.',
    keywords: [
      'spotify gift card',
      'spotify premium gift',
      'spotify subscription voucher',
      'spotify code',
      'music streaming gift',
    ],
    faq: [
      {
        question: 'Where is the code redeemed?',
        answer: 'At spotify.com/redeem — sign in and enter the code.',
      },
      {
        question: 'Does it work for an existing Spotify Premium subscription?',
        answer:
          'It pauses any existing card-on-file billing and uses the gift card balance until exhausted.',
      },
      {
        question: 'Is the code region-locked?',
        answer:
          'Yes — match the currency to the recipient’s Spotify country.',
      },
      {
        question: 'Can it be combined with Spotify Family?',
        answer:
          'Spotify gift cards apply to Premium Individual plans by default; Family/Duo redemption depends on regional support.',
      },
    ],
  },

  'ea-play': {
    heroTitle: 'Buy an EA Play Gift Card — EA Game Library Subscription',
    heroSubtitle: 'EA Play subscription credit and EA games — for console and PC.',
    description:
      'An EA gift card adds balance to an EA / Origin account, ready to spend on EA Play ' +
      'subscriptions and EA-published games — FIFA, Battlefield, Madden, Apex Legends in-game ' +
      'currency, and more. Buy from Gifted, receive the code by email, and redeem in the EA ' +
      'app or on console.',
    keywords: [
      'ea play gift card',
      'ea gift card',
      'origin gift card',
      'ea play subscription',
      'fifa points gift card',
    ],
    faq: [
      {
        question: 'Where is the code redeemed?',
        answer:
          'In the EA app on PC, on the EA website (account.ea.com), or via the EA section of the PlayStation/Xbox/Switch storefronts.',
      },
      {
        question: 'Can I buy EA Play with the balance?',
        answer:
          'Yes — EA wallet balance covers EA Play and EA Play Pro subscriptions.',
      },
      {
        question: 'Is it region-locked?',
        answer:
          'Yes — EA gift cards are region-specific; match the account country.',
      },
      {
        question: 'Does the balance expire?',
        answer: 'No — EA wallet balance stays on the account until spent.',
      },
    ],
  },

  'riot-points': {
    heroTitle: 'Buy a Riot Points / Valorant Points Gift Card',
    heroSubtitle: 'In-game currency for League of Legends and Valorant.',
    description:
      'A Riot gift card converts to Riot Points (League of Legends) or Valorant Points — used ' +
      'to buy champions, skins, agent contracts and battle passes. Buy from Gifted, receive ' +
      'the code by email, and redeem on the Riot account page. Codes are server-region locked.',
    keywords: [
      'riot points gift card',
      'valorant points',
      'league of legends rp',
      'lol skins gift card',
      'riot gift card',
    ],
    faq: [
      {
        question: 'Where is the code redeemed?',
        answer:
          'At account.riotgames.com → "Redeem cards & codes". Apply to the receiving Riot account.',
      },
      {
        question: 'Are RP and VP transferable between games?',
        answer:
          'No — Riot Points are for League of Legends; Valorant Points are for Valorant. Card type determines which.',
      },
      {
        question: 'Is it server-region locked?',
        answer:
          'Yes — match the card region to the recipient’s Riot account region.',
      },
      {
        question: 'Do the points expire?',
        answer:
          'No — Riot/Valorant Points stay on the account until spent.',
      },
    ],
  },

  roblox: {
    heroTitle: 'Buy a Roblox Gift Card — Robux Top-Up',
    heroSubtitle: 'Robux for in-game items, avatar customisation and Premium.',
    description:
      'A Roblox gift card converts to Robux, the in-platform currency used for avatar items, ' +
      'in-experience purchases and the Roblox Premium subscription. Buy from Gifted, receive ' +
      'the code by email, and redeem at roblox.com/redeem. Robux work cross-platform — PC, ' +
      'mobile, Xbox, PlayStation.',
    keywords: [
      'roblox gift card',
      'robux code',
      'buy robux',
      'roblox premium gift card',
      'roblox digital code',
    ],
    faq: [
      {
        question: 'Where is the code redeemed?',
        answer: 'At roblox.com/redeem — sign in and enter the code.',
      },
      {
        question: 'Do Robux work on every platform?',
        answer:
          'Yes — Robux are tied to the Roblox account, so they work on PC, mobile, Xbox and PlayStation.',
      },
      {
        question: 'Can I gift Robux to someone else?',
        answer:
          'Forward the gift-card code; the recipient redeems it on their own Roblox account.',
      },
      {
        question: 'Does it expire?',
        answer: 'Once redeemed, Robux stay on the account until spent.',
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// fi-FI hand-authored copy — top 5 cells from the research
// ---------------------------------------------------------------------------

const FI_FI: Partial<Record<BrandSlug, BrandCopy>> = {
  netflix: {
    heroTitle: 'Osta Netflix-lahjakortti Suomeen',
    heroSubtitle: 'Heti sähköpostiisi. Maksa kortilla, lunasta Netflixissä.',
    description:
      'Netflix-lahjakortti on helpoin tapa antaa sarjojen ja elokuvien iloa. Osta meiltä ' +
      'euroina, saa koodi sähköpostiisi minuuteissa ja lunasta se Netflix-tililläsi. Ei ' +
      'tilausta, ei sitoumusta — vain rajaton viihde lahjan saajalle. Toimii kaikilla ' +
      'Netflixin laitteilla.',
    keywords: [
      'netflix lahjakortti',
      'netflix lahjakortti suomi',
      'osta netflix',
      'netflix koodi',
      'netflix lahja',
    ],
    faq: [
      {
        question: 'Kuinka nopeasti saan koodin?',
        answer: 'Yleensä alle 5 minuutissa maksun jälkeen, sähköpostiisi.',
      },
      {
        question: 'Tarvitsenko Netflix-tilin?',
        answer:
          'Lahjan saaja tarvitsee Netflix-tilin koodin lunastamiseen, mutta tilaus voidaan luoda lunastuksen yhteydessä.',
      },
      {
        question: 'Voiko koodin lunastaa Suomessa?',
        answer:
          'Kyllä — Suomessa ostetut Netflix-lahjakortit toimivat suomalaisilla Netflix-tileillä.',
      },
      {
        question: 'Onko maksu turvallista?',
        answer:
          'On — maksut käsitellään Stripen kautta, joka on yksi maailman luotetuimmista maksunkäsittelijöistä.',
      },
      {
        question: 'Voiko koodin palauttaa?',
        answer:
          'Lunastamattoman koodin voi palauttaa 14 päivän kuluessa. Lunastettua koodia ei voi palauttaa.',
      },
    ],
  },
  steam: {
    heroTitle: 'Osta Steam-lahjakortti Suomeen',
    heroSubtitle: 'Pelit, lisäosat, kosmetiikka — kaikki Steamin kirjastosta.',
    description:
      'Steam-lahjakortti on pelaajan paras lahja. Osta meiltä euroina, saa koodi heti ' +
      'sähköpostiisi ja lisää saldoa Steam-tilille. Käytä peleihin, DLC:ihin, in-game-' +
      'kosmetiikkaan tai mihin tahansa Steamin kaupasta. Ei vanhentumispäivää — saldo pysyy ' +
      'käytettävissä, kunnes käytät sen.',
    keywords: [
      'steam lahjakortti',
      'steam koodi',
      'osta steam',
      'steam wallet',
      'pelaaja lahja',
    ],
    faq: [
      {
        question: 'Toimiiko koodi Suomessa?',
        answer:
          'Kyllä, EUR-määräiset Steam-lahjakortit toimivat suomalaisilla Steam-tileillä.',
      },
      {
        question: 'Mihin Steam-saldoa voi käyttää?',
        answer:
          'Peleihin, DLC:hen, kosmeettisiin esineisiin, ohjelmistoihin ja kaikkeen muuhun Steamin kaupasta.',
      },
      {
        question: 'Vanheneeko Steam-saldo?',
        answer: 'Ei — saldo pysyy tililläsi kunnes käytät sen.',
      },
      {
        question: 'Voinko ostaa lahjaksi?',
        answer:
          'Kyllä — lähetä koodi sähköpostissa kenelle haluat. Saaja syöttää sen Steam-asiakasohjelmaan.',
      },
      {
        question: 'Kuinka nopeasti koodi saapuu?',
        answer:
          'Sähköpostiisi yleensä alle 5 minuutissa maksun jälkeen.',
      },
    ],
  },
  'app-store-itunes': {
    heroTitle: 'Osta App Store & iTunes -lahjakortti Suomeen',
    heroSubtitle:
      'Sovellukset, pelit, musiikki, elokuvat ja iCloud — yhdellä koodilla.',
    description:
      'App Store & iTunes -lahjakortilla saa täyden Applen ekosysteemin: sovellukset, pelit, ' +
      'Apple Music, Apple TV+, iCloud-tila ja kaikki App Storesta. Osta meiltä euroina, saa ' +
      'koodi sähköpostiisi minuuteissa ja lisää saldoa Apple ID:lle. Toimii Suomessa ' +
      'rekisteröidyillä Apple-tileillä.',
    keywords: [
      'app store lahjakortti',
      'itunes lahjakortti',
      'apple lahjakortti suomi',
      'osta app store',
      'apple id saldo',
    ],
    faq: [
      {
        question: 'Voinko käyttää koodia Apple Musicin tilaamiseen?',
        answer:
          'Kyllä — koodin saldoa voi käyttää Apple Music -tilaukseen ja kaikkiin muihin Apple-palveluihin.',
      },
      {
        question: 'Toimiiko koodi suomalaisella Apple ID:llä?',
        answer:
          'Kyllä, EUR-koodit toimivat Suomessa rekisteröidyillä Apple ID -tileillä.',
      },
      {
        question: 'Mihin saldoa voi käyttää?',
        answer:
          'App Store, iTunes Store, Apple Music, Apple TV+, Apple Arcade, iCloud+ ja sovelluksen sisäisiin ostoksiin.',
      },
      {
        question: 'Vanheneeko saldo?',
        answer: 'Ei — Apple ID -saldo pysyy tililläsi pysyvästi.',
      },
      {
        question: 'Kuinka koodi lunastetaan?',
        answer:
          'Avaa App Store, kosketa profiilikuvaketta ja valitse "Lunasta lahjakortti tai koodi".',
      },
    ],
  },
  playstation: {
    heroTitle: 'Osta PlayStation Store -lahjakortti Suomeen',
    heroSubtitle:
      'Pelit, lisäosat, PlayStation Plus — kaikki yhdellä koodilla.',
    description:
      'PlayStation Store -lahjakortti on PS4- ja PS5-pelaajan luottolahja. Osta meiltä ' +
      'euroina, saa koodi sähköpostiisi heti ja lisää saldoa PlayStation Networkiin. Käytä ' +
      'peleihin, DLC:hen, PlayStation Plus -tilaukseen tai elokuvavuokriin. Toimii ' +
      'suomalaisilla PSN-tileillä.',
    keywords: [
      'playstation lahjakortti',
      'psn lahjakortti',
      'ps5 lahjakortti',
      'osta playstation',
      'playstation store',
    ],
    faq: [
      {
        question: 'Toimiiko koodi Suomessa?',
        answer:
          'Kyllä — EUR-määräiset PlayStation-lahjakortit toimivat suomalaisilla PSN-tileillä.',
      },
      {
        question: 'Voinko ostaa PlayStation Plussan?',
        answer:
          'Kyllä — PSN-saldolla voi tilata PlayStation Plus -jäsenyyden.',
      },
      {
        question: 'Vanheneeko PSN-saldo?',
        answer: 'Ei — saldo pysyy tililläsi kunnes käytät sen.',
      },
      {
        question: 'Kuinka koodi lunastetaan?',
        answer:
          'PlayStationissa: PS Store → Lunasta koodi. Verkossa: PlayStation.com → Tili → Maksu ja tilaukset → Lunasta koodit.',
      },
      {
        question: 'Toimiiko koodi PS4:llä ja PS5:llä?',
        answer:
          'Kyllä — PSN-saldoa voi käyttää kaikilla PlayStation-konsoleilla, joilla olet kirjautunut sisään.',
      },
    ],
  },
  fortnite: {
    heroTitle: 'Osta Fortnite V-Bucks -lahjakortti Suomeen',
    heroSubtitle: 'V-Bucksia tilille — heti sähköpostiisi.',
    description:
      'Fortnite-lahjakortti vaihtuu V-Bucksiksi, joilla saa skinejä, emoteja, ' +
      'taisteluvälineitä ja Battle Passin. Osta meiltä euroina, saa koodi sähköpostiisi ' +
      'minuuteissa ja lunasta se Epic Games -tilillä. Toimii kaikilla alustoilla — PC, PS5, ' +
      'Xbox, Switch ja mobiili.',
    keywords: [
      'fortnite lahjakortti',
      'v-bucks koodi',
      'fortnite v-bucks',
      'osta fortnite',
      'epic games lahja',
    ],
    faq: [
      {
        question: 'Toimiiko V-Bucks kaikilla alustoilla?',
        answer:
          'Kyllä — V-Bucksit ovat sidottuja Epic Games -tiliisi, joten ne toimivat PC:llä, PS5:llä, Xboxilla, Switchillä ja mobiililla.',
      },
      {
        question: 'Kuinka koodi lunastetaan?',
        answer:
          'Mene osoitteeseen fortnite.com/vbuckscard ja kirjaudu Epic Games -tilillesi.',
      },
      {
        question: 'Voinko ostaa Battle Passin?',
        answer:
          'Kyllä — V-Bucksilla voi ostaa Battle Passin sekä yksittäisiä esineitä.',
      },
      {
        question: 'Onko ikäraja?',
        answer:
          'Fortniten käyttö vaatii Epic Games -tilin. Alle 13-vuotiaat tarvitsevat huoltajan luvan.',
      },
      {
        question: 'Vanhentuvatko V-Bucksit?',
        answer:
          'Eivät — kerran lunastetut V-Bucksit pysyvät tililläsi.',
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// pl-PL hand-authored copy — Netflix (highest-value PL cell)
// ---------------------------------------------------------------------------

const PL_PL: Partial<Record<BrandSlug, BrandCopy>> = {
  netflix: {
    heroTitle: 'Kup kartę podarunkową Netflix dla Polski',
    heroSubtitle:
      'Natychmiastowa dostawa na e-mail. Zapłać kartą, odbierz w Netflixie.',
    description:
      'Karta podarunkowa Netflix to najprostszy sposób na prezent z serialami i filmami. Kup ' +
      'u nas w PLN, odbierz kod na e-mail w kilka minut i wykorzystaj go na swoim koncie ' +
      'Netflix. Bez subskrypcji, bez zobowiązań — tylko nieograniczona rozrywka dla ' +
      'obdarowanego. Działa na wszystkich urządzeniach Netflix.',
    keywords: [
      'netflix karta podarunkowa',
      'kod netflix polska',
      'kup netflix',
      'netflix prezent',
      'netflix doładowanie',
    ],
    faq: [
      {
        question: 'Jak szybko otrzymam kod?',
        answer:
          'Zwykle w mniej niż 5 minut po płatności, na Twój e-mail.',
      },
      {
        question: 'Czy potrzebuję konta Netflix?',
        answer:
          'Obdarowany potrzebuje konta Netflix, ale można je założyć w trakcie wykorzystywania kodu.',
      },
      {
        question: 'Czy kod działa w Polsce?',
        answer:
          'Tak — karty Netflix kupione w PLN działają na polskich kontach Netflix.',
      },
      {
        question: 'Czy płatność jest bezpieczna?',
        answer:
          'Tak — płatności obsługuje Stripe, jeden z najbardziej zaufanych operatorów płatności na świecie.',
      },
      {
        question: 'Czy mogę zwrócić kod?',
        answer:
          'Niewykorzystany kod można zwrócić w ciągu 14 dni. Wykorzystany kod nie podlega zwrotowi.',
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// ar-AE hand-authored copy — Amazon (highest-value AE cell). RTL-ready.
// ---------------------------------------------------------------------------

const AR_AE: Partial<Record<BrandSlug, BrandCopy>> = {
  amazon: {
    heroTitle: 'اشترِ بطاقة هدايا أمازون الإمارات',
    heroSubtitle:
      'تسليم فوري إلى بريدك الإلكتروني. ادفع ببطاقتك واستلم الكود.',
    description:
      'بطاقة هدايا أمازون الإمارات تمنحك حرية اختيار أي شيء من amazon.ae — إلكترونيات، ' +
      'أزياء، كتب، منزل، وأكثر. اشترِ منا بالدرهم الإماراتي، استلم الكود في بريدك خلال ' +
      'دقائق، واستخدمه في حسابك على أمازون. لا اشتراك ولا رسوم خفية.',
    keywords: [
      'بطاقة هدايا امازون',
      'كود امازون الامارات',
      'amazon gift card uae',
      'شراء امازون',
      'هدية الكترونية',
    ],
    faq: [
      {
        question: 'هل يعمل الكود في الإمارات؟',
        answer:
          'نعم — البطاقة بقيمة الدرهم الإماراتي وتستخدم على amazon.ae.',
      },
      {
        question: 'كيف أستخدم الكود؟',
        answer:
          'سجّل الدخول إلى amazon.ae، اذهب إلى "بطاقات الهدايا" واختر "أضف للحساب"، ثم أدخل الكود.',
      },
      {
        question: 'هل ينتهي صلاحية الرصيد؟',
        answer: 'لا — رصيد بطاقات هدايا أمازون لا ينتهي صلاحيته.',
      },
      {
        question: 'متى يصل الكود؟',
        answer:
          'عادة خلال 5 دقائق من إتمام الدفع، إلى بريدك الإلكتروني.',
      },
      {
        question: 'هل الدفع آمن؟',
        answer:
          'نعم — جميع المدفوعات تتم عبر Stripe، أحد أكثر مزودي خدمات الدفع موثوقية في العالم.',
      },
      {
        question: 'هل يمكنني إعطاء الكود كهدية؟',
        answer:
          'نعم — أرسل الكود عبر البريد الإلكتروني لأي شخص، وسيستخدمه على حسابه.',
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// Aggregate map
// ---------------------------------------------------------------------------

export const COPY: CopyMap = {
  en: EN,
  'fi-FI': FI_FI,
  'pl-PL': PL_PL,
  'ar-AE': AR_AE,
}

/**
 * Resolve copy for a (locale × brand) pair.
 * Returns `isFallback=true` when the locale is non-English and we
 * served the English baseline — useful for QA and downstream "needs
 * translation" flagging.
 */
export function resolveCopy(
  locale: Locale,
  slug: BrandSlug
): { copy: BrandCopy; isFallback: boolean } {
  const localized = COPY[locale]?.[slug]
  if (localized) return { copy: localized, isFallback: false }

  const en = COPY.en?.[slug]
  if (en) {
    // English baseline always exists; mark non-English locales as fallback
    return { copy: en, isFallback: !locale.startsWith('en-') }
  }

  // Last-resort templated copy if a brand was added to BRANDS without
  // a matching EN entry. Should never fire in production once both
  // arrays are kept in sync.
  return {
    copy: generateFallbackCopy(slug),
    isFallback: true,
  }
}

function generateFallbackCopy(slug: BrandSlug): BrandCopy {
  const human = slug.replace(/-/g, ' ')
  return {
    heroTitle: `Buy a ${human} gift card`,
    heroSubtitle: 'Instant digital delivery to your inbox.',
    description:
      `Buy a ${human} gift card with instant digital delivery. ` +
      'No signup required. Pay securely with card and receive your code by email in minutes.',
    keywords: [slug, `${slug} gift card`, `buy ${slug}`, `${slug} digital code`],
    faq: [
      {
        question: 'How is the code delivered?',
        answer: 'By email, usually within 5 minutes of payment.',
      },
      {
        question: 'Do I need an account?',
        answer: 'No. Pay as a guest with your email.',
      },
      {
        question: 'What payment methods are accepted?',
        answer: 'All major credit and debit cards via Stripe.',
      },
      {
        question: 'Is the code refundable?',
        answer: 'Once delivered and revealed, codes are non-refundable.',
      },
    ],
  }
}
