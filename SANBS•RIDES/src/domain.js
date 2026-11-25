export const STORAGE_KEY = 'sanbs-ride-demo-v1';

// Existing demo destinations plus SANBS's public Gauteng collection-centre
// directory (https://sanbs.org.za/plasma-and-platelets). Map pins use the
// venue where mapped, otherwise the named suburb/area as an overview position.
export const LOCATIONS = [
  {
    id: 'sandton-centre',
    name: 'SANBS Sandton Donor Centre',
    shortName: 'Sandton Donor Centre',
    address: 'Rivonia Road, Sandton, Johannesburg',
    kind: 'Permanent donation centre',
    area: 'Sandton',
    coordinates: { lat: -26.1076, lon: 28.0567 },
  },
  {
    id: 'rosebank-drive',
    name: 'Rosebank Blood Drive',
    shortName: 'Rosebank Blood Drive',
    address: 'The Zone @ Rosebank, Oxford Road, Johannesburg',
    kind: 'Temporary blood drive',
    area: 'Rosebank',
    coordinates: { lat: -26.1452, lon: 28.0436 },
  },
  {
    id: 'randburg-centre',
    name: 'SANBS Randburg Donor Centre',
    shortName: 'Randburg Donor Centre',
    address: 'Republic Road, Randburg, Johannesburg',
    kind: 'Permanent donation centre',
    area: 'Randburg',
    coordinates: { lat: -26.0945, lon: 28.0060 },
  },
  {
    id: 'alberton-centre', name: 'SANBS Alberton Donor Centre', shortName: 'Alberton',
    address: 'Alberton City Shopping Centre, Voortrekker Road, Alberton', kind: 'Permanent donation centre', area: 'Alberton',
    coordinates: { lat: -26.26519, lon: 28.122405 },
  },
  {
    id: 'beacon-road-centre', name: 'SANBS Beacon Road Donor Centre', shortName: 'Beacon Road',
    address: 'Office 5, 31 Beacon Road, Florida North, Roodepoort', kind: 'Permanent donation centre', area: 'Florida',
    coordinates: { lat: -26.169525, lon: 27.92808 },
  },
  {
    id: 'benoni-centre', name: 'SANBS Benoni Donor Centre', shortName: 'Benoni',
    address: '42 14th Avenue, Northmead, Benoni', kind: 'Permanent donation centre', area: 'Benoni',
    coordinates: { lat: -26.1697, lon: 28.3132 },
  },
  {
    id: 'carnival-mall-centre', name: 'SANBS Carnival Mall Donor Centre', shortName: 'Carnival Mall',
    address: 'Shop 33B, Mall of Carnival, Heidelberg Road, Dalpark, Brakpan', kind: 'Permanent donation centre', area: 'Brakpan',
    coordinates: { lat: -26.236, lon: 28.369 },
  },
  {
    id: 'centurion-centre', name: 'SANBS Centurion Donor Centre', shortName: 'Centurion',
    address: 'Shop 15B, Jean Village Shopping Centre, Jean Avenue, Centurion', kind: 'Permanent donation centre', area: 'Centurion',
    coordinates: { lat: -25.861, lon: 28.188 },
  },
  {
    id: 'east-rand-mall-centre', name: 'SANBS East Rand Mall Donor Centre', shortName: 'East Rand Mall',
    address: 'Shop 155, Entrance 2, East Rand Mall, Bentel Avenue, Boksburg', kind: 'Permanent donation centre', area: 'Boksburg',
    coordinates: { lat: -26.181961, lon: 28.239617 },
  },
  {
    id: 'fourways-centre', name: 'SANBS Fourways Donor Centre', shortName: 'Fourways',
    address: 'Shop 12, Forest Design and Décor Centre, Pineslopes, Fourways', kind: 'Permanent donation centre', area: 'Fourways',
    coordinates: { lat: -26.004472, lon: 28.004245 },
  },
  {
    id: 'germiston-centre', name: 'SANBS Germiston Donor Centre', shortName: 'Germiston',
    address: 'Shop 1, Lambton Gardens, Cnr Weber and Beacon Road, Germiston', kind: 'Permanent donation centre', area: 'Germiston',
    coordinates: { lat: -26.252792, lon: 28.184436 },
  },
  {
    id: 'greenstone-centre', name: 'SANBS Greenstone Donor Centre', shortName: 'Greenstone',
    address: 'Shop LO67, Greenstone Shopping Centre, Stoneridge Drive, Edenvale', kind: 'Permanent donation centre', area: 'Greenstone',
    coordinates: { lat: -26.118389, lon: 28.141033 },
  },
  {
    id: 'hatfield-centre', name: 'SANBS Hatfield Donor Centre', shortName: 'Hatfield',
    address: 'Medical Suite F1G, 1122 Burnett Street, Hatfield Plaza, Pretoria', kind: 'Permanent donation centre', area: 'Pretoria',
    coordinates: { lat: -25.7498, lon: 28.236332 },
  },
  {
    id: 'kempton-park-centre', name: 'SANBS Kempton Park Donor Centre', shortName: 'Kempton Park',
    address: 'Law Chambers Building, 20 Central Avenue, Kempton Park', kind: 'Permanent donation centre', area: 'Kempton Park',
    coordinates: { lat: -26.107585, lon: 28.233736 },
  },
  {
    id: 'kolonnade-centre', name: 'SANBS Kolonnade Donor Centre', shortName: 'Kolonnade',
    address: 'Shop U32, Kolonnade Shopping Centre, Montana Park, Pretoria', kind: 'Permanent donation centre', area: 'Montana',
    coordinates: { lat: -25.681372, lon: 28.250566 },
  },
  {
    id: 'lenasia-centre', name: 'SANBS Lenasia Donor Centre', shortName: 'Lenasia',
    address: 'Shop 41A, Signet Terrace, 82 Gemsbok Avenue, Lenasia', kind: 'Permanent donation centre', area: 'Lenasia',
    coordinates: { lat: -26.314542, lon: 27.829262 },
  },
  {
    id: 'maponya-centre', name: 'SANBS Maponya Donor Centre', shortName: 'Maponya',
    address: 'Shop 410, Maponya Mall, 2127 Chris Hani Road, Pimville, Soweto', kind: 'Permanent donation centre', area: 'Soweto',
    coordinates: { lat: -26.257086, lon: 27.902809 },
  },
  {
    id: 'monument-centre', name: 'SANBS Monument Donor Centre', shortName: 'Monument',
    address: 'Unit 244, Anthos Building, Cnr Voortrekker and Van Oordt Road, Krugersdorp', kind: 'Permanent donation centre', area: 'Krugersdorp',
    coordinates: { lat: -26.1, lon: 27.77 },
  },
  {
    id: 'northgate-centre', name: 'SANBS Northgate Donor Centre', shortName: 'Northgate',
    address: 'Shop 8B, Entrance 3 and 4, Northgate Shopping Centre, Northriding', kind: 'Permanent donation centre', area: 'Northgate',
    coordinates: { lat: -26.0603, lon: 27.946509 },
  },
  {
    id: 'olympus-gardens-centre', name: 'SANBS Olympus Gardens Donor Centre', shortName: 'Olympus Gardens',
    address: 'Shop 912, Olympus Gardens Centre, Cnr Solomon Mahlangu and Haymeadow Crescent, Pretoria', kind: 'Permanent donation centre', area: 'Faerie Glen',
    coordinates: { lat: -25.79, lon: 28.32 },
  },
  {
    id: 'park-meadows-centre', name: 'SANBS Park Meadows Donor Centre', shortName: 'Park Meadows',
    address: 'Park Meadows Shopping Centre, Cnr Cumberland and Allum Road, Kensington, Johannesburg', kind: 'Permanent donation centre', area: 'Kensington',
    coordinates: { lat: -26.183803, lon: 28.114763 },
  },
  {
    id: 'river-square-centre', name: 'SANBS River Square Donor Centre', shortName: 'River Square',
    address: 'Shop C2, River Square Shopping Centre, Nile Drive, Three Rivers, Vereeniging', kind: 'Permanent donation centre', area: 'Vereeniging',
    coordinates: { lat: -26.671, lon: 27.93 },
  },
  {
    id: 'sammy-marks-centre', name: 'SANBS Sammy Marks Donor Centre', shortName: 'Sammy Marks',
    address: 'Sammy Marks Square, 138 Church Street, Pretoria Central', kind: 'Permanent donation centre', area: 'Pretoria Central',
    coordinates: { lat: -25.7475, lon: 28.188 },
  },
  {
    id: 'springs-centre', name: 'SANBS Springs Donor Centre', shortName: 'Springs',
    address: 'Shop U18, Springs Mall, 19 Jan Smuts Drive, Springs', kind: 'Permanent donation centre', area: 'Springs',
    coordinates: { lat: -26.275453, lon: 28.454257 },
  },
  {
    id: 'the-woods-centre', name: 'SANBS The Woods Donor Centre', shortName: 'The Woods',
    address: 'Unit F12, The Woods Shopping Centre, Jan Smuts Avenue, Randburg', kind: 'Permanent donation centre', area: 'Randburg',
    coordinates: { lat: -26.104, lon: 28.001 },
  },
  {
    id: 'vanderbijlpark-centre', name: 'SANBS Vanderbijlpark Donor Centre', shortName: 'Vanderbijlpark',
    address: 'Unit 5, Sentio Building, Cnr Frikkie Meyer and FW Beyers Streets, Vanderbijlpark', kind: 'Permanent donation centre', area: 'Vanderbijlpark',
    coordinates: { lat: -26.71, lon: 27.84 },
  },
  {
    id: 'westgate-centre', name: 'SANBS Westgate Donor Centre', shortName: 'Westgate',
    address: 'Shop 170, Westgate Shopping Centre, Ondekkers Road, Roodepoort', kind: 'Permanent donation centre', area: 'Roodepoort',
    coordinates: { lat: -26.13985, lon: 27.86263 },
  },
  {
    id: 'wonderpark-centre', name: 'SANBS Wonderpark Donor Centre', shortName: 'Wonderpark',
    address: 'Shop 554, Entrance 6, Wonderpark Shopping Centre, Akasia', kind: 'Permanent donation centre', area: 'Akasia',
    coordinates: { lat: -25.671882, lon: 28.110541 },
  },
];

export const DRIVER_SEEDS = [
  {
    id: 'driver-sipho',
    name: 'Sipho Dlamini',
    firstName: 'Sipho',
    type: 'sanbs',
    typeLabel: 'SANBS employed',
    phone: '082 410 2261',
    vehicle: 'Toyota Corolla',
    registration: 'JHB 482 GP',
    verification: 'Verified',
    online: true,
    initials: 'SD',
    color: 'red',
    currentCoordinates: { lat: -26.1126, lon: 28.0555 },
  },
  {
    id: 'driver-lerato',
    name: 'Lerato Nkosi',
    firstName: 'Lerato',
    type: 'independent',
    typeLabel: 'Independent approved',
    phone: '083 728 1150',
    vehicle: 'Hyundai Grand i10',
    registration: 'JHB 913 GP',
    verification: 'Verified',
    online: true,
    initials: 'LN',
    color: 'plum',
    currentCoordinates: { lat: -26.1415, lon: 28.0392 },
  },
  {
    id: 'driver-james',
    name: 'James Peterson',
    firstName: 'James',
    type: 'sanbs',
    typeLabel: 'SANBS employed',
    phone: '071 334 8290',
    vehicle: 'Volkswagen Polo Vivo',
    registration: 'JHB 206 GP',
    verification: 'Verified',
    online: true,
    initials: 'JP',
    color: 'blue',
    currentCoordinates: { lat: -26.1043, lon: 28.0688 },
  },
  {
    id: 'partner-citylink',
    name: 'CityLink Dispatch',
    firstName: 'CityLink',
    type: 'partner',
    typeLabel: 'Transport partner',
    phone: '010 880 2210',
    vehicle: 'Partner vehicle · assigned by provider',
    registration: 'Provider managed',
    verification: 'Contract active',
    online: true,
    initials: 'CL',
    color: 'green',
    isProvider: true,
    currentCoordinates: { lat: -26.1184, lon: 28.0470 },
  },
];

export const OPERATING_MODELS = {
  fleet: {
    title: 'SANBS fleet',
    description: 'Trips are assigned to employed drivers. Drivers acknowledge an assignment before moving.',
    short: 'Employed drivers · acknowledge',
  },
  independent: {
    title: 'Independent drivers',
    description: 'Trips are offered to approved independent drivers, who can accept or decline.',
    short: 'Approved drivers · accept or decline',
  },
  partner: {
    title: 'Transport partner',
    description: 'Operations assigns trips to a partner desk. Partner progress is simulated in this prototype.',
    short: 'Partner dispatch · simulated updates',
  },
  hybrid: {
    title: 'Hybrid supply',
    description: 'Fleet, approved independent drivers and partner resources can all be dispatched as needed.',
    short: 'Multiple resource types',
  },
};

export const ROLE_LABELS = {
  donor: 'Donor app',
  driver: 'Driver app',
  staff: 'SANBS staff',
  operations: 'Transport ops',
};

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateAfter(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

export function formatDate(dateString, options = { weekday: 'short', day: 'numeric', month: 'short' }) {
  if (!dateString) return '—';
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-ZA', options).format(date);
}

export function formatLongDate(dateString) {
  return formatDate(dateString, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(time) {
  if (!time) return '—';
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour || 0, minute || 0, 0, 0);
  return new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function formatStamp(stamp) {
  if (!stamp) return 'Just now';
  const date = new Date(stamp);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function safeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeHistory(label, by, minutesAgo, note = '') {
  return {
    id: safeId('event'),
    label,
    by,
    note,
    at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
  };
}

function makeSeedBooking() {
  const today = localDateString();
  return {
    id: 'booking-demo-live',
    reference: `SR-${today.slice(2).replaceAll('-', '')}-008`,
    donorId: 'donor-thabo',
    donorName: 'Thabo Mokoena',
    donorPhone: '082 555 0142',
    origin: 'donor',
    appointment: {
      locationId: 'sandton-centre',
      locationName: 'SANBS Sandton Donor Centre',
      locationAddress: 'Rivonia Road, Sandton, Johannesburg',
      locationKind: 'Permanent donation centre',
      date: today,
      time: '11:15',
    },
    pickupAddress: '22 West Street, Sandown, Sandton, Johannesburg',
    pickupCoordinates: { lat: -26.1072, lon: 28.0546, label: '22 West Street, Sandown, Sandton, Johannesburg' },
    pickupNotes: 'Please use the visitor entrance on the east side.',
    contactNumber: '082 555 0142',
    returnRequested: false,
    requirements: [],
    notes: 'Demo record · donor requested a pickup.',
    createdAt: new Date(Date.now() - 42 * 60_000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    outbound: {
      status: 'driver_on_the_way',
      driverId: 'driver-james',
      acknowledged: true,
      accepted: true,
      assignedAt: new Date(Date.now() - 2 * 60_000).toISOString(),
      statusAt: new Date().toISOString(),
    },
    returnLeg: {
      status: 'not_required',
      driverId: null,
      acknowledged: false,
      accepted: false,
      authorizedAt: null,
      authorizedBy: null,
      statusAt: new Date().toISOString(),
    },
    exceptions: [],
    history: [
      makeHistory('Transport request submitted', 'Donor app', 42),
      makeHistory('James Peterson assigned to pickup', 'Transport operations', 2),
      makeHistory('Driver started navigation', 'James Peterson · driver app', 0),
    ],
  };
}

export function createInitialState() {
  return {
    schemaVersion: 2,
    role: 'donor',
    donorProfile: {
      id: 'donor-thabo',
      name: 'Thabo Mokoena',
      phone: '082 555 0142',
      pickupAddress: '22 West Street, Sandown, Sandton, Johannesburg',
      /* Verified position for the sample address, so the saved address is usable offline. */
      pickupCoordinates: { lat: -26.1072, lon: 28.0546, label: '22 West Street, Sandown, Sandton, Johannesburg' },
    },
    selectedDriverId: 'driver-james',
    operatingModel: 'fleet',
    bookings: [makeSeedBooking()],
    drivers: DRIVER_SEEDS.map((driver) => ({ ...driver })),
    nextReference: 9,
    notifications: [
      {
        id: 'notice-seed',
        title: 'Driver en route',
        message: 'James is heading to Thabo’s pickup location.',
        at: new Date(Date.now() - 8 * 60_000).toISOString(),
        roles: ['staff', 'operations', 'driver'],
        readBy: [],
        bookingId: 'booking-demo-live',
      },
    ],
    lastActivity: {
      message: 'James started navigation · demo trip SR-008',
      at: new Date(Date.now() - 8 * 60_000).toISOString(),
    },
  };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeCoordinates(value) {
  if (!isRecord(value)) return null;
  const lat = Number(value.lat);
  const lon = Number(value.lon ?? value.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon, ...(typeof value.label === 'string' ? { label: value.label } : {}) };
}

function normalizeBooking(booking) {
  if (!isRecord(booking) || typeof booking.id !== 'string' || !isRecord(booking.appointment)) return null;
  const defaults = makeBooking({ returnRequested: Boolean(booking.returnRequested) }, 'donor', 1);
  const outbound = isRecord(booking.outbound) ? booking.outbound : defaults.outbound;
  const returnLeg = isRecord(booking.returnLeg) ? booking.returnLeg : defaults.returnLeg;
  const outboundStatuses = new Set(['awaiting_assignment', 'driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_picked_up', 'arrived_at_site', 'cancelled', 'completed']);
  const returnStatuses = new Set(['not_required', 'waiting_authorisation', 'awaiting_dispatch', 'driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_on_the_way_home', 'completed', 'cancelled']);
  const normalizeLeg = (leg, fallback, validStatuses) => ({
    ...fallback,
    ...leg,
    status: validStatuses.has(leg.status) ? leg.status : fallback.status,
    driverId: typeof leg.driverId === 'string' ? leg.driverId : null,
    statusAt: typeof leg.statusAt === 'string' ? leg.statusAt : (typeof leg.assignedAt === 'string' ? leg.assignedAt : (booking.updatedAt || booking.createdAt || new Date().toISOString())),
    acknowledged: Boolean(leg.acknowledged),
    accepted: Boolean(leg.accepted),
    driverCoordinates: normalizeCoordinates(leg.driverCoordinates)
      || DRIVER_SEEDS.find((driver) => driver.id === leg.driverId)?.currentCoordinates
      || null,
    currentPosition: normalizeCoordinates(leg.currentPosition),
    navigationProgress: Number.isFinite(leg.navigationProgress)
      ? Math.max(0, Math.min(1, leg.navigationProgress))
      : null,
  });
  const appointment = booking.appointment;
  const safeString = (value, fallback = '') => typeof value === 'string' ? value : fallback;
  const savedCentre = LOCATIONS.find((location) => location.id === appointment.locationId)
    || LOCATIONS.find((location) => location.name === appointment.locationName || location.address === appointment.locationAddress);
  return {
    ...defaults,
    ...booking,
    reference: safeString(booking.reference, defaults.reference),
    donorId: safeString(booking.donorId, 'donor-thabo'),
    donorName: safeString(booking.donorName, 'Donor'),
    donorPhone: safeString(booking.donorPhone, ''),
    pickupAddress: safeString(booking.pickupAddress, defaults.pickupAddress),
    pickupCoordinates: normalizeCoordinates(booking.pickupCoordinates),
    pickupNotes: safeString(booking.pickupNotes),
    contactNumber: safeString(booking.contactNumber, safeString(booking.donorPhone)),
    returnRequested: Boolean(booking.returnRequested),
    appointment: {
      ...defaults.appointment,
      ...appointment,
      locationId: safeString(appointment.locationId, defaults.appointment.locationId),
      locationName: safeString(appointment.locationName, defaults.appointment.locationName),
      locationAddress: safeString(appointment.locationAddress, defaults.appointment.locationAddress),
      locationKind: safeString(appointment.locationKind, defaults.appointment.locationKind),
      coordinates: normalizeCoordinates(appointment.coordinates) || savedCentre?.coordinates || null,
      date: safeString(appointment.date, defaults.appointment.date),
      time: safeString(appointment.time, defaults.appointment.time),
    },
    outbound: normalizeLeg(outbound, defaults.outbound, outboundStatuses),
    returnLeg: normalizeLeg(returnLeg, defaults.returnLeg, returnStatuses),
    exceptions: Array.isArray(booking.exceptions) ? booking.exceptions.filter(isRecord).map((item) => ({
      ...item,
      id: safeString(item.id, safeId('exception')),
      category: safeString(item.category, 'Transport issue'),
      details: safeString(item.details),
      status: item.status === 'resolved' ? 'resolved' : 'open',
    })) : [],
    history: Array.isArray(booking.history) ? booking.history.filter(isRecord).map((item) => ({
      ...item,
      id: safeString(item.id, safeId('event')),
      label: safeString(item.label, 'Journey update'),
      by: safeString(item.by, 'SANBS RIDE'),
      note: safeString(item.note),
      at: safeString(item.at, new Date().toISOString()),
    })) : [],
  };
}

export function normalizeState(parsed) {
  const initial = createInitialState();
  if (!isRecord(parsed)) return initial;
  const bookings = Array.isArray(parsed.bookings)
    ? parsed.bookings.map(normalizeBooking).filter(Boolean)
    : initial.bookings;
  const savedDrivers = Array.isArray(parsed.drivers) ? parsed.drivers.filter((item) => isRecord(item) && typeof item.id === 'string') : [];
  const drivers = DRIVER_SEEDS.map((seed) => ({ ...seed, ...(savedDrivers.find((item) => item.id === seed.id) || {}) }));
  savedDrivers.forEach((driver) => {
    if (!drivers.some((item) => item.id === driver.id)) drivers.push(driver);
  });
  const notifications = Array.isArray(parsed.notifications)
    ? parsed.notifications.filter(isRecord).map((item) => ({
      ...item,
      id: typeof item.id === 'string' ? item.id : safeId('notice'),
      title: typeof item.title === 'string' ? item.title : 'Journey update',
      message: typeof item.message === 'string' ? item.message : '',
      roles: Array.isArray(item.roles) ? item.roles.filter((role) => typeof role === 'string') : [],
      readBy: Array.isArray(item.readBy) ? item.readBy.filter((role) => typeof role === 'string') : [],
    }))
    : initial.notifications;
  const profile = isRecord(parsed.donorProfile) ? parsed.donorProfile : {};
  const validRoles = ['donor', 'driver', 'staff', 'operations'];
  const validModels = ['fleet', 'independent', 'partner', 'hybrid'];
  return {
    ...initial,
    ...parsed,
    schemaVersion: 2,
    role: validRoles.includes(parsed.role) ? parsed.role : initial.role,
    donorProfile: {
      ...initial.donorProfile,
      ...profile,
      id: typeof profile.id === 'string' ? profile.id : 'donor-thabo',
      name: typeof profile.name === 'string' ? profile.name : initial.donorProfile.name,
      phone: typeof profile.phone === 'string' ? profile.phone : initial.donorProfile.phone,
      pickupAddress: typeof profile.pickupAddress === 'string' ? profile.pickupAddress : initial.donorProfile.pickupAddress,
      pickupCoordinates: normalizeCoordinates(profile.pickupCoordinates)
        || (profile.pickupAddress === initial.donorProfile.pickupAddress ? initial.donorProfile.pickupCoordinates : null),
    },
    selectedDriverId: typeof parsed.selectedDriverId === 'string' ? parsed.selectedDriverId : initial.selectedDriverId,
    operatingModel: validModels.includes(parsed.operatingModel) ? parsed.operatingModel : initial.operatingModel,
    bookings,
    drivers,
    notifications,
    nextReference: Number.isSafeInteger(parsed.nextReference) && parsed.nextReference > 0 ? parsed.nextReference : initial.nextReference,
  };
}

/* On app open only: if the sample approach has already finished, restart it so the
   presentation begins with the driver on the road. Never run during cross-tab sync. */
function restartStaleSampleApproach(state) {
  const now = Date.now();
  const bookings = state.bookings.map((booking) => {
    /* Older saved demos attached the sample trip to a different donor; rebuild it for the signed-in donor. */
    if (booking.id === 'booking-demo-live' && booking.donorId !== 'donor-thabo') return makeSeedBooking();
    if (booking.id !== 'booking-demo-live' || booking.outbound?.status !== 'driver_on_the_way') return booking;
    const statusAt = Date.parse(booking.outbound.statusAt || '');
    if (Number.isFinite(statusAt) && now - statusAt < APPROACH_MS) return booking;
    return { ...booking, outbound: { ...booking.outbound, statusAt: new Date(now).toISOString() } };
  });
  return { ...state, bookings };
}

export function loadInitialState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return restartStaleSampleApproach(normalizeState(JSON.parse(stored)));
  } catch (error) {
    console.warn('Could not restore the SANBS RIDE demo state.', error);
  }
  return restartStaleSampleApproach(createInitialState());
}

export function makeBooking(fields, origin, referenceNumber) {
  const date = fields.appointmentDate || localDateString();
  const sequence = String(referenceNumber).padStart(3, '0');
  const reference = `SR-${date.slice(2).replaceAll('-', '')}-${sequence}`;
  const selectedLocation = LOCATIONS.find((location) => location.id === fields.locationId) || LOCATIONS[0];
  const event = {
    id: safeId('event'),
    label: 'Transport request submitted',
    by: origin === 'staff' ? 'SANBS staff' : 'Donor app',
    note: origin === 'staff' ? 'Booking created with the donor’s consent.' : 'Donor requested a ride to their appointment.',
    at: new Date().toISOString(),
  };
  return {
    id: safeId('booking'),
    reference,
    donorId: fields.donorId || 'donor-thabo',
    donorName: fields.donorName || 'Thabo Mokoena',
    donorPhone: fields.donorPhone || '082 555 0142',
    origin,
    appointment: {
      locationId: selectedLocation.id,
      locationName: selectedLocation.name,
      locationAddress: selectedLocation.address,
      locationKind: selectedLocation.kind,
      coordinates: selectedLocation.coordinates,
      date,
      time: fields.appointmentTime || '10:00',
    },
    pickupAddress: fields.pickupAddress || '22 West Street, Sandown, Sandton, Johannesburg',
    pickupCoordinates: normalizeCoordinates(fields.pickupCoordinates),
    pickupNotes: fields.pickupNotes || '',
    contactNumber: fields.contactNumber || fields.donorPhone || '082 555 0142',
    pickupTime: fields.pickupTime || '08:45',
    returnRequested: Boolean(fields.returnRequested),
    requirements: Array.isArray(fields.requirements) ? fields.requirements : [],
    notes: fields.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    outbound: {
      status: 'awaiting_assignment',
      driverId: null,
      acknowledged: false,
      accepted: false,
      assignedAt: null,
      statusAt: new Date().toISOString(),
    },
    returnLeg: {
      status: fields.returnRequested ? 'waiting_authorisation' : 'not_required',
      driverId: null,
      acknowledged: false,
      accepted: false,
      authorizedAt: null,
      authorizedBy: null,
      statusAt: new Date().toISOString(),
    },
    exceptions: [],
    history: [event],
  };
}

export function getDriver(state, driverId) {
  return state.drivers.find((driver) => driver.id === driverId) || null;
}

export function getDriverAvailability(state, driverId) {
  const driver = getDriver(state, driverId);
  if (!driver) return 'offline';
  const active = state.bookings.some((booking) => {
    const outboundActive = booking.outbound?.driverId === driverId && !['arrived_at_site', 'cancelled', 'completed'].includes(booking.outbound.status);
    const returnActive = booking.returnLeg?.driverId === driverId && ['driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_on_the_way_home'].includes(booking.returnLeg.status);
    return outboundActive || returnActive;
  });
  if (active) return 'on_trip';
  return driver.online ? 'available' : 'offline';
}

export function formatCoordinates(value) {
  const point = normalizeCoordinates(value);
  if (!point) return '';
  const latHemisphere = point.lat < 0 ? 'S' : 'N';
  const lonHemisphere = point.lon < 0 ? 'W' : 'E';
  return `${Math.abs(point.lat).toFixed(5)}° ${latHemisphere}, ${Math.abs(point.lon).toFixed(5)}° ${lonHemisphere}`;
}

export function distanceBetweenCoordinates(first, second) {
  const a = normalizeCoordinates(first);
  const b = normalizeCoordinates(second);
  if (!a || !b) return Infinity;
  const radians = (degrees) => degrees * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

/** Conservative urban pickup estimate: account for a 25% road detour at 30 km/h. */
export function estimateDriverPickupMinutes(driverCoordinates, pickupCoordinates) {
  const directDistanceKm = distanceBetweenCoordinates(driverCoordinates, pickupCoordinates);
  if (!Number.isFinite(directDistanceKm)) return Infinity;
  return (directDistanceKm * 1.25 / 30) * 60;
}

export function getEligibleDrivers(state, leg = 'outbound', booking = null) {
  const model = state.operatingModel || 'fleet';
  const candidates = state.drivers.filter((driver) => {
    const availability = getDriverAvailability(state, driver.id);
    if (availability !== 'available') return false;
    if (model === 'fleet') return driver.type === 'sanbs';
    if (model === 'independent') return driver.type === 'independent';
    if (model === 'partner') return driver.type === 'partner';
    return ['sanbs', 'independent', 'partner'].includes(driver.type);
  });
  const destination = leg === 'return'
    ? booking?.appointment?.coordinates
    : booking?.pickupCoordinates;
  if (!destination) return candidates;
  return candidates.map((driver, index) => ({
    driver,
    index,
    distance: distanceBetweenCoordinates(driver.currentCoordinates, destination),
  })).sort((a, b) => a.distance - b.distance || a.index - b.index).map(({ driver }) => driver);
}

export function getLeg(booking, leg = 'outbound') {
  return leg === 'return' ? booking.returnLeg : booking.outbound;
}

export function getLegStatus(booking, leg = 'outbound') {
  return getLeg(booking, leg)?.status || 'awaiting_assignment';
}

export function getBookingStatus(booking) {
  const returned = booking.returnLeg?.status;
  if (returned === 'completed') return 'completed';
  if (returned === 'donor_on_the_way_home') return 'donor_on_the_way_home';
  if (returned === 'driver_arrived') return 'return_driver_arrived';
  if (returned === 'driver_on_the_way') return 'return_driver_on_the_way';
  if (returned === 'driver_assigned') return 'return_driver_assigned';
  if (returned === 'awaiting_dispatch') return 'return_awaiting_dispatch';
  if (booking.outbound?.status === 'arrived_at_site') {
    return booking.returnRequested ? 'awaiting_return_authorisation' : 'completed';
  }
  if (booking.outbound?.status === 'donor_picked_up') return 'donor_picked_up';
  if (booking.outbound?.status === 'driver_arrived') return 'driver_arrived';
  if (booking.outbound?.status === 'driver_on_the_way') return 'driver_on_the_way';
  if (booking.outbound?.status === 'driver_assigned') return 'driver_assigned';
  if (booking.outbound?.status === 'cancelled') return 'cancelled';
  return 'awaiting_assignment';
}

export const STATUS_META = {
  awaiting_assignment: { label: 'Awaiting driver', tone: 'amber' },
  driver_assigned: { label: 'Driver assigned', tone: 'blue' },
  driver_on_the_way: { label: 'Driver on the way', tone: 'blue' },
  driver_arrived: { label: 'Driver at pickup', tone: 'violet' },
  donor_picked_up: { label: 'Donor on board', tone: 'violet' },
  awaiting_return_authorisation: { label: 'Donation in progress', tone: 'green' },
  return_waiting_authorisation: { label: 'Awaiting SANBS authorisation', tone: 'amber' },
  return_awaiting_dispatch: { label: 'Return ready to dispatch', tone: 'amber' },
  return_driver_assigned: { label: 'Return driver assigned', tone: 'blue' },
  return_driver_on_the_way: { label: 'Return driver on the way', tone: 'blue' },
  return_driver_arrived: { label: 'Return driver at pickup', tone: 'violet' },
  donor_on_the_way_home: { label: 'Returning home', tone: 'violet' },
  completed: { label: 'Journey completed', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'grey' },
};

export function getStatusMeta(booking) {
  const key = typeof booking === 'string' ? booking : getBookingStatus(booking);
  return STATUS_META[key] || STATUS_META.awaiting_assignment;
}

export function getReturnStatusLabel(status) {
  const labels = {
    not_required: 'Not requested',
    waiting_authorisation: 'Awaiting return authorisation',
    awaiting_dispatch: 'Authorised · awaiting driver',
    driver_assigned: 'Driver assigned',
    driver_on_the_way: 'Driver en route',
    driver_arrived: 'Driver at centre',
    donor_on_the_way_home: 'Donor returning home',
    completed: 'Complete',
  };
  return labels[status] || '—';
}

export function getLocation(locationId) {
  return LOCATIONS.find((location) => location.id === locationId) || LOCATIONS[0];
}

/* ==========================================================================
   Journey state engine — the single source of truth for "how far along is
   this journey?". Donor, driver, staff and operations all read these
   functions, so a stage label, a step index and a map percentage can never
   disagree with each other again.
   ========================================================================== */

/* The outbound journey, in order. `arrived` and `onboard` are distinct steps:
   collapsing them hid "driver at pickup" from the donor timeline. */
const OUTBOUND_STAGES = [
  { key: 'requested',   status: 'awaiting_assignment', title: 'Request received',      short: 'Requested', driverTitle: 'Awaiting your acceptance' },
  { key: 'assigned',    status: 'driver_assigned',     title: 'Driver assigned',       short: 'Assigned',  driverTitle: 'Trip assigned to you' },
  { key: 'en_route',    status: 'driver_on_the_way',   title: 'Driver on the way',     short: 'En route',  driverTitle: 'Drive to the pickup' },
  { key: 'at_pickup',   status: 'driver_arrived',      title: 'Driver at pickup',      short: 'At pickup', driverTitle: 'Donor pickup' },
  { key: 'onboard',     status: 'donor_picked_up',     title: 'On the way to SANBS',   short: 'Onboard',   driverTitle: 'Drive to the centre' },
  { key: 'at_site',     status: 'arrived_at_site',     title: 'At donation centre',    short: 'At centre', driverTitle: 'Donation drop-off' },
];

const RETURN_STAGES = [
  { key: 'authorised',  status: 'awaiting_dispatch',      title: 'Return authorised',        short: 'Authorised', driverTitle: 'Return authorised' },
  { key: 'assigned',    status: 'driver_assigned',        title: 'Driver assigned',          short: 'Assigned',   driverTitle: 'Trip assigned to you' },
  { key: 'en_route',    status: 'driver_on_the_way',      title: 'Driver heading to centre', short: 'En route',   driverTitle: 'Drive to the centre' },
  { key: 'at_pickup',   status: 'driver_arrived',         title: 'Driver at the centre',     short: 'At centre',  driverTitle: 'Collect the donor' },
  { key: 'onboard',     status: 'donor_on_the_way_home',  title: 'On the way home',          short: 'Homeward',   driverTitle: 'Drive the donor home' },
  { key: 'complete',    status: 'completed',              title: 'Journey complete',         short: 'Complete',   driverTitle: 'Journey complete' },
];

/* Statuses that map onto a stage, including the pre-stage states. */
const STATUS_TO_STAGE = {
  outbound: {
    awaiting_assignment: 0,
    driver_assigned: 1,
    driver_on_the_way: 2,
    driver_arrived: 3,
    donor_picked_up: 4,
    arrived_at_site: 5,
  },
  return: {
    waiting_authorisation: -1,   // authorised is not yet given
    awaiting_dispatch: 0,
    driver_assigned: 1,
    driver_on_the_way: 2,
    driver_arrived: 3,
    donor_on_the_way_home: 4,
    completed: 5,
  },
};

export function getJourneyStages(leg = 'outbound') {
  return leg === 'return' ? RETURN_STAGES : OUTBOUND_STAGES;
}

/**
 * Canonical journey state for one leg.
 * Returns everything a surface needs, derived from one status value.
 */
export function getJourneyState(booking, leg = 'outbound') {
  const isReturn = leg === 'return';
  const stages = getJourneyStages(leg);
  const status = getLegStatus(booking, leg);
  const rawIndex = STATUS_TO_STAGE[isReturn ? 'return' : 'outbound'][status];
  const index = rawIndex === undefined ? 0 : rawIndex;
  const lastIndex = stages.length - 1;

  // A journey that has not started still sits on stage 0; a completed one is at the end.
  const clamped = Math.max(0, Math.min(index, lastIndex));
  const stage = stages[clamped] || stages[0];
  const done = clamped === lastIndex && (status === 'completed' || status === 'arrived_at_site');
  const pendingAuthorisation = isReturn && status === 'waiting_authorisation';

  // Percentage is derived from the SAME index as the step list, never hand-tuned.
  const percent = pendingAuthorisation ? 0 : done ? 1 : clamped / lastIndex;

  return {
    leg,
    status,
    stages,
    index: clamped,
    lastIndex,
    stage,
    percent,
    done,
    pendingAuthorisation,
    title: pendingAuthorisation ? 'Awaiting authorisation' : stage.title,
    shortTitle: pendingAuthorisation ? 'Pending' : stage.short,
    driverTitle: stage.driverTitle,
    current: clamped,
  };
}

/**
 * Map movement prefers the driver's persisted GPS projection; a timestamp-based
 * fallback remains only for older demo records. Every role reads the same leg
 * fields, so donor, driver, staff and operations stay on the same route point.
 */
/* One shared timeline per leg, read by the donor, driver and staff views.
   Outbound: the driver's approach to the donor (APPROACH_MS), then the trip (TRIP_MS).
   Demo timings are deliberately slower than real driving so the movement is visible. */
export const APPROACH_MS = 90_000;
export const TRIP_MS = 120_000;

export function getJourneyMapState(booking, leg = 'outbound', now = Date.now()) {
  const status = getLegStatus(booking, leg);
  const isReturn = leg === 'return';
  let phase = 'to_pickup';
  let duration = 0;
  let fixedProgress = 0;
  let moving = false;

  if (status === 'driver_on_the_way') {
    duration = APPROACH_MS;
    moving = true;
  } else if (status === 'driver_arrived') {
    fixedProgress = 1;
  } else if ((!isReturn && status === 'donor_picked_up') || (isReturn && status === 'donor_on_the_way_home')) {
    phase = 'to_destination';
    duration = TRIP_MS;
    moving = true;
  } else if ((!isReturn && status === 'arrived_at_site') || (isReturn && status === 'completed')) {
    phase = 'to_destination';
    fixedProgress = 1;
  } else if (isReturn && status === 'waiting_authorisation') {
    fixedProgress = 1;
  }

  if (moving) {
    const activeLeg = getLeg(booking, leg);
    if (Number.isFinite(activeLeg?.navigationProgress)) {
      fixedProgress = Math.max(0, Math.min(activeLeg.navigationProgress, 1));
    } else {
      const statusAt = Date.parse(activeLeg?.statusAt || '');
      const elapsed = Number.isFinite(statusAt) ? Math.max(0, now - statusAt) : 0;
      fixedProgress = Math.min(elapsed / duration, 0.98);
    }
  }

  return {
    leg,
    status,
    phase,
    progress: fixedProgress,
    moving: moving && fixedProgress < 0.98,
    fillProgress: isReturn
      ? (phase === 'to_destination' ? 1 - fixedProgress : 1)
      : (phase === 'to_destination' ? 0.5 + 0.5 * fixedProgress : 0.5 * fixedProgress),
  };
}

/* Back-compat: map progress for the route artwork from the canonical engine. */
export function legProgress(booking, leg = 'outbound') {
  const state = getJourneyState(booking, leg);
  // Keep the marker just off the origin so it is always visible.
  return state.done ? 1 : Math.max(0.03, state.percent);
}

/**
 * One line describing the whole journey across both legs — used by every
 * role so the wording matches everywhere.
 */
export function getJourneySummary(booking) {
  const outbound = getJourneyState(booking, 'outbound');
  const returns = Boolean(booking.returnRequested);
  const ret = returns ? getJourneyState(booking, 'return') : null;

  if (booking.outbound.status === 'cancelled') {
    return { key: 'cancelled', label: 'Cancelled', detail: 'This journey was cancelled.', leg: 'outbound', ...outbound };
  }
  if (outbound.done && returns && ret.status === 'waiting_authorisation') {
    return {
      key: 'awaiting_return_authorisation',
      label: 'At the centre',
      detail: 'Return transport is held until SANBS confirms the donor is ready.',
      leg: 'return',
      ...ret,
      title: 'Awaiting return authorisation',
      shortTitle: 'At centre',
    };
  }
  if (outbound.done && (!returns || ret.done)) {
    return {
      key: 'completed',
      label: 'Journey complete',
      detail: returns ? 'Donor is home safely.' : 'Donor reached the donation centre.',
      leg: returns ? 'return' : 'outbound',
      ...(returns ? ret : outbound),
      done: true,
      percent: 1,
      title: 'Journey complete',
      shortTitle: 'Complete',
      index: (returns ? ret : outbound).lastIndex,
    };
  }
  if (outbound.done && returns) {
    return {
      key: `return_${ret.status}`,
      label: ret.title,
      detail: `Return journey · ${ret.shortTitle.toLowerCase()}.`,
      leg: 'return',
      ...ret,
    };
  }
  const detailMap = {
    awaiting_assignment: 'Waiting for transport operations to assign a driver.',
    driver_assigned: 'A driver has been assigned to this pickup.',
    driver_on_the_way: 'The driver is on the way to the pickup.',
    driver_arrived: 'The driver is waiting at the pickup point.',
    donor_picked_up: 'The donor is on the way to the donation centre.',
    arrived_at_site: 'The donor has reached the donation centre.',
  };
  return {
    key: outbound.status,
    label: outbound.title,
    detail: detailMap[outbound.status] || outbound.title,
    leg: 'outbound',
    ...outbound,
  };
}

/* Total journey completion across outbound + return, for cross-team progress bars. */
export function getOverallProgress(booking) {
  const outbound = getJourneyState(booking, 'outbound');
  if (!booking.returnRequested) return outbound.percent;
  const ret = getJourneyState(booking, 'return');
  return (outbound.percent + ret.percent) / 2;
}

export function isBookingActive(booking) {
  return getBookingStatus(booking) !== 'completed' && getBookingStatus(booking) !== 'cancelled';
}
