import { vi } from "vitest";

vi.stubGlobal('ResizeObserver', require('resize-observer-polyfill'));