import { test } from 'node:test';
import assert from 'node:assert/strict';
import { approximateRoute, haversineMetres } from '../src/services/routing.js';

test('haversine distance between two Johannesburg points is plausible', () => {
  const sandton = { lat: -26.1072, lon: 28.0546 };
  const centre = { lat: -26.1017, lon: 28.0536 };
  const metres = haversineMetres(sandton, centre);
  assert.ok(metres > 300 && metres < 1000, `expected a few hundred metres, got ${metres}`);
});

test('approximate fallback route is labelled, connects both ends and is never empty', () => {
  const from = { lat: -26.1072, lon: 28.0546 };
  const to = { lat: -26.1017, lon: 28.0536 };
  const route = approximateRoute(from, to);
  assert.equal(route.approximate, true);
  assert.deepEqual(route.path[0], [from.lat, from.lon]);
  assert.deepEqual(route.path[route.path.length - 1], [to.lat, to.lon]);
  assert.match(route.steps[0].instruction, /Approximate route/);
  assert.ok(route.distance > 0 && route.duration > 0);
});
