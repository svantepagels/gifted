import { MOCK_DELAY_MS } from '../utils/constants';

/** Simulate network delay for mock API calls */
export function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
