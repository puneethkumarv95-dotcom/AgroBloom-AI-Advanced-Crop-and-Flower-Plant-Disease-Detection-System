import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => cleanup());

Element.prototype.scrollIntoView = () => {};
Object.defineProperty(navigator, 'mediaDevices', {
  configurable: true,
  value: { getUserMedia: () => new Promise(() => {}) },
});
