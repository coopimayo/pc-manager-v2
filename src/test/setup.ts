// Registers jest-dom matchers (e.g. toBeInTheDocument) with Vitest's expect,
// and pulls in their type augmentations. Runs before every test file.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React trees between tests so they don't leak into one another.
afterEach(() => {
  cleanup();
});
