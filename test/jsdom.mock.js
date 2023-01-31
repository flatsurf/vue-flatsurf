import { beforeAll } from "vitest";

beforeAll(() => {
    global.ResizeObserver = require('resize-observer-polyfill');
})