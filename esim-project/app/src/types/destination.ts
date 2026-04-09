export interface Plan {
  id: string;
  data: string;
  dataBytes: number;
  duration: number;
  price: number;
  currency: string;
  bestValue?: boolean;
}

export interface Destination {
  slug: string;
  name: string;
  region: string;
  countryCode: string;
  flag: string;
  popular: boolean;
  plans: Plan[];
}

export interface Region {
  code: string;
  name: string;
  flag: string;
  countriesIncluded: number;
  plans: Plan[];
}
