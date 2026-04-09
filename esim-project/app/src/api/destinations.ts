import type { Destination, Plan } from '../types';
import { delay } from './client';
import { dataToBytes, slugify } from '../utils/format';
import pricingData from '../data/destinations.json';

interface RawPlan {
  data: string;
  validity: number;
  price: number;
}

interface RawCountry {
  code: string;
  name: string;
  flag: string;
  region: string;
  popular: boolean;
  plans: RawPlan[];
}

function transformPlan(raw: RawPlan, countryCode: string): Plan {
  return {
    id: `${countryCode.toLowerCase()}-${raw.data.toLowerCase().replace(/\s/g, '')}-${raw.validity}d`,
    data: raw.data,
    dataBytes: dataToBytes(raw.data),
    duration: raw.validity,
    price: raw.price,
    currency: 'USD',
  };
}

function markBestValue(plans: Plan[]): Plan[] {
  const metered = plans.filter((p) => p.data !== 'Unlimited');
  if (metered.length < 2) return plans;

  let bestIdx = -1;
  let bestRatio = Infinity;
  metered.forEach((p) => {
    const gb = parseInt(p.data, 10);
    if (gb > 0) {
      const ratio = p.price / gb;
      if (ratio < bestRatio) {
        bestRatio = ratio;
        bestIdx = plans.indexOf(p);
      }
    }
  });

  return plans.map((p, i) => (i === bestIdx ? { ...p, bestValue: true } : p));
}

function transformCountry(raw: RawCountry): Destination {
  const plans = raw.plans.map((p) => transformPlan(p, raw.code));
  return {
    slug: slugify(raw.name),
    name: raw.name,
    region: raw.region,
    countryCode: raw.code,
    flag: raw.flag,
    popular: raw.popular,
    plans: markBestValue(plans),
  };
}

const destinations: Destination[] = (pricingData as { countries: RawCountry[] }).countries.map(transformCountry);

export async function getDestinations(): Promise<Destination[]> {
  await delay();
  return destinations;
}

export async function getDestination(slug: string): Promise<Destination | null> {
  await delay();
  return destinations.find((d) => d.slug === slug) ?? null;
}
