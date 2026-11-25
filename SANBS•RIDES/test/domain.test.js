import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOCATIONS,
  createInitialState,
  estimateDriverPickupMinutes,
  getBookingStatus,
  getDriverAvailability,
  getEligibleDrivers,
  getJourneyState,
  getJourneyMapState,
  getJourneySummary,
  isBookingActive,
  makeBooking,
  normalizeState,
} from '../src/domain.js';
import { projectProgressOnRoute } from '../src/services/routing.js';

test('Gauteng donor-centre catalogue includes the full public fixed-centre set with valid map points', () => {
  const ids = LOCATIONS.map((location) => location.id);
  assert.equal(new Set(ids).size, ids.length, 'centre ids are unique');
  assert.ok(LOCATIONS.length >= 28);
  for (const location of LOCATIONS) {
    assert.ok(Number.isFinite(location.coordinates.lat) && Math.abs(location.coordinates.lat) <= 90, `${location.name} latitude`);
    assert.ok(Number.isFinite(location.coordinates.lon) && Math.abs(location.coordinates.lon) <= 180, `${location.name} longitude`);
    assert.ok(location.coordinates.lat > -27.5 && location.coordinates.lat < -25, `${location.name} is in Gauteng latitude range`);
    assert.ok(location.coordinates.lon > 27 && location.coordinates.lon < 29, `${location.name} is in Gauteng longitude range`);
  }
  for (const name of ['SANBS Alberton Donor Centre', 'SANBS Fourways Donor Centre', 'SANBS Maponya Donor Centre', 'SANBS Hatfield Donor Centre', 'SANBS Wonderpark Donor Centre']) {
    assert.ok(LOCATIONS.some((location) => location.name === name), `${name} is present`);
  }
});

function bookingAt(status, returnStatus = 'not_required', returnRequested = false) {
  const booking = makeBooking({
    donorId: 'donor-test',
    donorName: 'Test Donor',
    appointmentDate: '2026-12-01',
    appointmentTime: '10:00',
    locationId: 'sandton-centre',
    pickupAddress: '1 Test Street, Sandton',
    returnRequested,
  }, 'donor', 1);
  booking.outbound.status = status;
  booking.returnLeg.status = returnStatus;
  return booking;
}

test('outbound statuses map to ordered journey stages and completion', () => {
  const stages = [
    ['awaiting_assignment', 0],
    ['driver_assigned', 1],
    ['driver_on_the_way', 2],
    ['driver_arrived', 3],
    ['donor_picked_up', 4],
    ['arrived_at_site', 5],
  ];
  for (const [status, index] of stages) {
    const booking = bookingAt(status);
    assert.equal(getJourneyState(booking).index, index, status);
  }
  assert.equal(getJourneyState(bookingAt('arrived_at_site')).done, true);
});

test('return authorization keeps the journey active until return completes', () => {
  const waiting = bookingAt('arrived_at_site', 'waiting_authorisation', true);
  assert.equal(getBookingStatus(waiting), 'awaiting_return_authorisation');
  assert.equal(getJourneySummary(waiting).key, 'awaiting_return_authorisation');
  assert.equal(isBookingActive(waiting), true);

  const completed = bookingAt('arrived_at_site', 'completed', true);
  assert.equal(getBookingStatus(completed), 'completed');
  assert.equal(getJourneySummary(completed).done, true);
  assert.equal(isBookingActive(completed), false);
});

test('driver availability excludes active assignments and respects operating model', () => {
  const state = createInitialState();
  assert.equal(getDriverAvailability(state, 'driver-james'), 'on_trip');
  assert.deepEqual(getEligibleDrivers(state, 'outbound').map((driver) => driver.id), ['driver-sipho']);

  state.operatingModel = 'independent';
  assert.deepEqual(getEligibleDrivers(state).map((driver) => driver.id), ['driver-lerato']);
  state.operatingModel = 'partner';
  assert.deepEqual(getEligibleDrivers(state).map((driver) => driver.id), ['partner-citylink']);
});

test('a new ride retains the donor identity and verified pickup coordinates used for driver routing', () => {
  const pickupCoordinates = { lat: -26.1415, lon: 28.0392, label: 'Verified pickup' };
  const booking = makeBooking({
    donorId: 'donor-selected',
    donorName: 'Selected Donor',
    donorPhone: '0820000000',
    locationId: 'rosebank-drive',
    appointmentDate: '2026-12-01',
    pickupAddress: 'Exact pickup, Johannesburg',
    pickupCoordinates,
  }, 'donor', 12);

  assert.equal(booking.donorId, 'donor-selected');
  assert.equal(booking.donorName, 'Selected Donor');
  assert.deepEqual(booking.pickupCoordinates, pickupCoordinates);
  assert.equal(booking.appointment.locationId, 'rosebank-drive');
  assert.equal(booking.outbound.status, 'awaiting_assignment');
});

test('nearest-driver assignment ETA is conservative and enforces a five-minute radius', () => {
  assert.equal(estimateDriverPickupMinutes({ lat: -26.1, lon: 28.05 }, { lat: -26.1, lon: 28.05 }), 0);
  assert.ok(estimateDriverPickupMinutes({ lat: -26.1, lon: 28.05 }, { lat: -26.11, lon: 28.05 }) < 5);
  const twoKmNorth = { lat: -26.1 + 2 / 111.195, lon: 28.05 };
  assert.ok(Math.abs(estimateDriverPickupMinutes({ lat: -26.1, lon: 28.05 }, twoKmNorth) - 5) < 0.01, 'two road-adjusted kilometres is the five-minute boundary');
  assert.ok(estimateDriverPickupMinutes({ lat: -26.1, lon: 28.05 }, { lat: -26.13, lon: 28.05 }) > 5);
});

test('nearest eligible driver is ordered first for the verified pickup coordinates', () => {
  const state = createInitialState();
  state.operatingModel = 'hybrid';
  const booking = bookingAt('awaiting_assignment');
  booking.pickupCoordinates = { lat: -26.1415, lon: 28.0392, label: 'Exact Rosebank pickup' };
  const eligible = getEligibleDrivers(state, 'outbound', booking);
  assert.equal(eligible[0].id, 'driver-lerato');
});

test('normalization preserves verified pickup, selected center, and last-known driver coordinates', () => {
  const booking = bookingAt('driver_assigned');
  booking.pickupCoordinates = { lat: -26.14, lon: 28.04, label: 'Verified pickup' };
  booking.outbound.driverId = 'driver-lerato';
  booking.outbound.navigationProgress = 0.37;
  const state = normalizeState({ ...createInitialState(), bookings: [booking] });
  const normalized = state.bookings[0];
  assert.deepEqual(normalized.pickupCoordinates, { lat: -26.14, lon: 28.04, label: 'Verified pickup' });
  assert.deepEqual(normalized.appointment.coordinates, { lat: -26.1076, lon: 28.0567 });
  assert.deepEqual(normalized.outbound.driverCoordinates, { lat: -26.1415, lon: 28.0392 });
  assert.equal(normalized.outbound.navigationProgress, 0.37);
});

test('GPS fixes project onto road geometry and the route distance is shared with all journey views', () => {
  const projection = projectProgressOnRoute([[-26.1, 28.0], [-26.1, 28.01]], { lat: -26.1, lon: 28.005 });
  assert.ok(Math.abs(projection.progress - 0.5) < 0.001);
  assert.ok(projection.offRouteMeters < 1);

  const booking = bookingAt('driver_on_the_way');
  booking.outbound.navigationProgress = 0.63;
  const shared = getJourneyMapState(booking, 'outbound', Date.now());
  assert.equal(shared.progress, 0.63);
  assert.ok(Math.abs(shared.fillProgress - 0.315) < 1e-9, 'the drop fills during the approach: half of the journey at 63% of the approach');
});

test('normalizeState repairs incomplete saved records and rejects malformed bookings', () => {
  const normalized = normalizeState({
    role: 'not-a-role',
    operatingModel: 'unknown',
    bookings: [
      { id: 'broken', donorName: 'Missing appointment' },
      { id: 'partial', appointment: { locationName: 'Test site' }, exceptions: null, history: null },
    ],
    drivers: [],
    notifications: [{ id: 'notice' }],
    donorProfile: { name: 'Saved Donor' },
  });

  assert.equal(normalized.role, 'donor');
  assert.equal(normalized.operatingModel, 'fleet');
  assert.equal(normalized.donorProfile.id, 'donor-thabo');
  assert.equal(normalized.donorProfile.name, 'Saved Donor');
  assert.equal(normalized.bookings.length, 1);
  assert.equal(normalized.bookings[0].appointment.coordinates, null, 'unknown centre names must not silently fall back to Sandton');
  assert.deepEqual(normalized.bookings[0].exceptions, []);
  assert.deepEqual(normalized.bookings[0].history, []);
  assert.ok(normalized.bookings[0].outbound.status);
  assert.deepEqual(normalized.notifications[0].roles, []);
  assert.deepEqual(normalized.notifications[0].readBy, []);
  assert.equal(normalized.drivers.length, 4);
});

test('simulated progress is time-based and shared across donor and driver journey views', () => {
  const booking = bookingAt('driver_on_the_way');
  booking.outbound.navigationMode = 'simulated';
  booking.outbound.navigationProgress = null;
  booking.outbound.statusAt = new Date(100_000).toISOString();
  const driverView = getJourneyMapState(booking, 'outbound', 145_000);
  const donorView = getJourneyMapState(booking, 'outbound', 145_000);
  assert.equal(driverView.progress, 0.5);
  assert.equal(donorView.progress, driverView.progress);
  assert.equal(booking.outbound.navigationMode, 'simulated');
});

test('map progress sequences the driver-to-pickup leg before passenger travel', () => {
  const booking = bookingAt('driver_on_the_way');
  booking.outbound.statusAt = new Date(100_000).toISOString();
  const approaching = getJourneyMapState(booking, 'outbound', 145_000);
  assert.equal(approaching.phase, 'to_pickup');
  assert.equal(approaching.progress, 0.5);
  assert.equal(approaching.fillProgress, 0.25);

  booking.outbound.status = 'donor_picked_up';
  booking.outbound.statusAt = new Date(200_000).toISOString();
  const passengerTrip = getJourneyMapState(booking, 'outbound', 260_000);
  assert.equal(passengerTrip.phase, 'to_destination');
  assert.equal(passengerTrip.progress, 0.5);
  assert.equal(passengerTrip.fillProgress, 0.75);

  booking.returnLeg.status = 'donor_on_the_way_home';
  booking.returnLeg.statusAt = new Date(300_000).toISOString();
  const returnTrip = getJourneyMapState(booking, 'return', 360_000);
  assert.equal(returnTrip.phase, 'to_destination');
  assert.equal(returnTrip.progress, 0.5);
  assert.equal(returnTrip.fillProgress, 0.5);
});

test('the outbound drop rises monotonically from booking through approach to the centre', () => {
  const booking = bookingAt('driver_on_the_way');
  booking.outbound.statusAt = new Date(0).toISOString();
  const fills = [];
  for (let t = 0; t <= 90_000; t += 15_000) fills.push(getJourneyMapState(booking, 'outbound', t).fillProgress);
  booking.outbound.status = 'donor_picked_up';
  booking.outbound.statusAt = new Date(100_000).toISOString();
  for (let t = 100_000; t <= 220_000; t += 20_000) fills.push(getJourneyMapState(booking, 'outbound', t).fillProgress);
  booking.outbound.status = 'arrived_at_site';
  fills.push(getJourneyMapState(booking, 'outbound', 221_000).fillProgress);
  for (let i = 1; i < fills.length; i += 1) assert.ok(fills[i] >= fills[i - 1], `fill fell at step ${i}: ${fills}`);
  assert.equal(fills[0], 0);
  assert.ok(Math.abs(fills[fills.length - 1] - 1) < 1e-9, 'drop is full on arrival at the centre');
});
