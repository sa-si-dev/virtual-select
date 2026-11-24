import test from 'node:test';
import assert from 'node:assert/strict';
import { computePlacement } from '../../../src/utils/placement.js';

const viewport = { width: 1280, height: 800 };
const shared = { viewport, margin: 4, offset: 5, distance: 30 };

function box(left, top, width, height) {
  return { left, top, width, height };
}

const vectors = [
  {
    name: 'below-left',
    position: 'bottom left',
    trigger: box(100, 100, 200, 40),
    floating: box(100, 140, 200, 300),
    expected: { side: 'bottom', x: 0, y: 4, fromX: 0, fromY: -26 },
  },
  {
    name: 'flip-up',
    position: 'bottom left',
    trigger: box(100, 700, 200, 40),
    floating: box(100, 740, 200, 300),
    expected: { side: 'top', x: 0, y: -344, fromX: 0, fromY: -314 },
  },
  {
    name: 'auto-up-centred',
    position: 'auto',
    trigger: box(100, 700, 200, 40),
    floating: box(100, 740, 300, 300),
    expected: { side: 'top', x: -50, y: -344, fromX: -50, fromY: -314 },
  },
  {
    name: 'clamp-left',
    position: 'bottom',
    trigger: box(10, 100, 100, 40),
    floating: box(10, 140, 300, 200),
    expected: { side: 'bottom', x: -5, y: 4, fromX: -5, fromY: -26 },
  },
  {
    name: 'trunc-toward-zero',
    position: 'bottom',
    trigger: box(10.5, 100, 100, 40),
    floating: box(10.5, 140, 300, 200),
    expected: { side: 'bottom', x: -5, y: 4, fromX: -5, fromY: -26 },
  },
  {
    name: 'fractions',
    position: 'bottom right',
    trigger: box(100.5, 100.25, 200, 40),
    floating: box(20.25, 10.5, 150.5, 100),
    expected: { side: 'bottom', x: 129, y: 133, fromX: 129, fromY: 103 },
  },
  {
    name: 'flip-sideways',
    position: 'right',
    trigger: box(1100, 300, 150, 40),
    floating: box(0, 0, 200, 100),
    expected: { side: 'left', x: 896, y: 270, fromX: 926, fromY: 270 },
  },
  {
    name: 'tall-floating',
    position: 'bottom',
    trigger: box(100, 380, 200, 40),
    floating: box(100, 420, 200, 900),
    expected: { side: 'top', x: 0, y: -944, fromX: 0, fromY: -914 },
  },
  {
    name: 'zero-rects',
    position: 'auto',
    trigger: box(0, 0, 0, 0),
    floating: box(0, 0, 0, 0),
    expected: { side: 'bottom', x: 0, y: 0, fromX: 0, fromY: -30 },
  },
];

for (const vector of vectors) {
  test(`computePlacement: ${vector.name}`, () => {
    const { position, trigger, floating } = vector;
    const result = computePlacement({ ...shared, position, trigger, floating });
    assert.deepEqual(result, vector.expected);
  });
}

test('computePlacement: zero rects produce integers', () => {
  const result = computePlacement({
    ...shared,
    position: 'auto',
    trigger: box(0, 0, 0, 0),
    floating: box(0, 0, 0, 0),
  });
  for (const key of ['x', 'y', 'fromX', 'fromY']) {
    assert.ok(Number.isInteger(result[key]), `${key} should be an integer, got ${result[key]}`);
  }
});

test('computePlacement: NaN geometry never reaches a transform', () => {
  const nan = box(NaN, NaN, NaN, NaN);
  const result = computePlacement({ ...shared, position: 'bottom', trigger: nan, floating: nan });
  assert.equal(result.x, 0);
  assert.equal(result.y, 0);
  assert.equal(result.fromX, 0);
  assert.equal(result.fromY, 0);
});
