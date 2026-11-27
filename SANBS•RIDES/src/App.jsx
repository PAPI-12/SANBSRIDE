import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, ChevronDown, Car, Heart, LifeBuoy, LogOut, RotateCcw, ShieldCheck, X } from 'lucide-react';
import {
  STORAGE_KEY,
  createInitialState,
  distanceBetweenCoordinates,
  estimateDriverPickupMinutes,
  getDriver,
  getEligibleDrivers,
  getJourneySummary,
  isBookingActive,
  getLeg,
  loadInitialState,
  makeBooking,
  normalizeState,
  safeId,
} from './domain.js';
/* Each role is code-split and mounted only while it is the active workspace.
   Hidden roles no longer run effects, timers or network requests. */
const DonorApp = lazy(() => import('./roles/DonorApp.jsx').then((m) => ({ default: m.DonorApp })));
const DriverApp = lazy(() => import('./roles/DriverApp.jsx').then((m) => ({ default: m.DriverApp })));
const StaffApp = lazy(() => import('./roles/StaffApp.jsx').then((m) => ({ default: m.StaffApp })));
const OperationsApp = lazy(() => import('./roles/OperationsApp.jsx').then((m) => ({ default: m.OperationsApp })));
import { BrandDefs, RelativeStamp, SanbsBrand } from './components/Shared.jsx';
import { AuthFlow } from './components/AuthFlow.jsx';

const ROLE_ORDER = ['donor', 'driver', 'staff', 'operations'];
const WORKSPACE_ROLE_KEY = `${STORAGE_KEY}:workspace-role`;
const AUTH_SESSION_KEY = `${STORAGE_KEY}:auth-session`;
const AUTH_ACCOUNTS_KEY = `${STORAGE_KEY}:accounts`;
const MAX_DRIVER_PICKUP_ETA_MINUTES = 5;
const WORKSPACE_LABELS = {
  donor: 'Donor',
  driver: 'Driver',
  staff: 'SANBS Staff',
  operations: 'Transport Ops',
};
const ROLE_HINTS = {
  donor: 'Book and track your ride',
  driver: 'Run today’s trips',
  staff: 'Coordinate collections',
  operations: 'Dispatch the fleet',
};
const ROLE_ACCOUNTS = {
  donor: 'Thabo Mokoena',
  driver: 'James Peterson',
  staff: 'Sam Ndlovu',
  operations: 'Thandi Nkosi',
};

function RoleIcon({ role, size = 17 }) {
  const Icon = role === 'donor' ? Heart : role === 'driver' ? Car : role === 'staff' ? LifeBuoy : ShieldCheck;
  return <Icon size={size} />;
}

function notificationFor(title, message, roles, bookingId, at = new Date().toISOString()) {
  return {
    id: safeId('notice'),
    title,
    message,
    roles,
    readBy: [],
    bookingId: bookingId || null,
    at,
  };
}

function appendNotification(state, notification) {
  return {
    ...state,
    notifications: [notification, ...(state.notifications || [])].slice(0, 40),
  };
}

function loadAuthSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.authenticated && ROLE_ORDER.includes(parsed.role)) return parsed;
  } catch (error) {
    // Ignore storage read failures and start on the opening screen.
  }
  return null;
}

function loadRegisteredAccounts() {
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function formatDisplayName(identifier = '', fallback = 'SANBS Member') {
  const clean = String(identifier).trim();
  if (!clean) return fallback;
  if (clean.includes('@')) {
    const local = clean.split('@')[0].replace(/[._-]+/g, ' ').trim();
    if (!local) return fallback;
    return local.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  if (/^[\d\s+()-]+$/.test(clean)) return fallback;
  return clean;
}

export default function App() {
  const [data, setData] = useState(() => {
    const initial = loadInitialState();
    try {
      const tabRole = sessionStorage.getItem(WORKSPACE_ROLE_KEY);
      if (ROLE_ORDER.includes(tabRole)) initial.role = tabRole;
    } catch (error) {
      // The shared local storage role remains a safe fallback when session storage is disabled.
    }
    return initial;
  });
  const [authSession, setAuthSession] = useState(() => loadAuthSession());
  const [authScreen, setAuthScreen] = useState(() => (loadAuthSession() ? 'authenticated' : 'welcome'));
  const [registeredAccounts, setRegisteredAccounts] = useState(() => loadRegisteredAccounts());
  const [toast, setToast] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const timer = useRef(null);
  const skipStorageWriteRef = useRef(false);
  const accountTriggerRef = useRef(null);
  const notificationTriggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (skipStorageWriteRef.current) {
      skipStorageWriteRef.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('SANBS RIDE could not save these workspace changes in this browser.', error);
    }
  }, [data]);

  useEffect(() => {
    const syncWorkspaceData = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const incoming = JSON.parse(event.newValue);
        if (incoming && Array.isArray(incoming.bookings) && Array.isArray(incoming.drivers)) {
          try { sessionStorage.setItem(WORKSPACE_ROLE_KEY, data.role); } catch (storageError) { /* optional per-tab role memory */ }
          skipStorageWriteRef.current = true;
          setData((current) => ({ ...normalizeState(incoming), role: current.role }));
        }
      } catch (error) {
        console.warn('A workspace update could not be read.', error);
      }
    };
    window.addEventListener('storage', syncWorkspaceData);
    return () => window.removeEventListener('storage', syncWorkspaceData);
  }, [data.role]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* Escape closes the open menu or popover and returns focus to its trigger. */
  useEffect(() => {
    if (!accountOpen && !notificationsOpen) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (accountOpen) {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
      } else {
        setNotificationsOpen(false);
        notificationTriggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [accountOpen, notificationsOpen]);

  /* Move focus into the account menu when it opens; arrow keys move between items. */
  useEffect(() => {
    if (accountOpen) menuRef.current?.querySelector('[aria-checked="true"], [role="menuitemradio"]')?.focus();
  }, [accountOpen]);

  const onMenuKeyDown = useCallback((event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitemradio"], [role="menuitem"]') || []);
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? items.length - 1
        : event.key === 'ArrowDown' ? (index + 1) % items.length
          : (index - 1 + items.length) % items.length;
    items[next].focus();
  }, []);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ id: Date.now(), message, tone });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 3600);
  }, []);

  const setRole = useCallback((role) => {
    try { sessionStorage.setItem(WORKSPACE_ROLE_KEY, role); } catch (error) { /* optional per-tab role memory */ }
    setData((previous) => ({ ...previous, role }));
    setNotificationsOpen(false);
  }, []);

  const persistAuthSession = useCallback((session) => {
    setAuthSession(session);
    try {
      if (session) sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch (error) { /* optional session persistence */ }
  }, []);

  const enterDemo = useCallback((targetRole) => {
    const chosenRole = ROLE_ORDER.includes(targetRole) ? targetRole : 'donor';
    try { sessionStorage.setItem(WORKSPACE_ROLE_KEY, chosenRole); } catch (error) { /* optional per-tab role memory */ }
    setData((previous) => {
      const next = { ...previous, role: chosenRole };
      if (chosenRole === 'donor' && previous.donorProfile?.id !== 'donor-thabo') {
        next.donorProfile = {
          id: 'donor-thabo',
          name: 'Thabo Mokoena',
          phone: '082 555 0142',
          pickupAddress: '22 West Street, Sandown, Sandton, Johannesburg',
          pickupCoordinates: { lat: -26.1072, lon: 28.0546, label: '22 West Street, Sandown, Sandton, Johannesburg' },
        };
      }
      if (chosenRole === 'driver') {
        next.selectedDriverId = 'driver-james';
      }
      return next;
    });
    persistAuthSession({ authenticated: true, role: chosenRole, userName: null });
    setAuthScreen('authenticated');
    setNotificationsOpen(false);
    setAccountOpen(false);
    showToast(`Entered ${WORKSPACE_LABELS[chosenRole]} workspace`);
  }, [persistAuthSession, showToast]);

  const handleLogin = useCallback(({ role: chosenRole, identifier, account }) => {
    const nextRole = ROLE_ORDER.includes(chosenRole) ? chosenRole : 'donor';
    const userName = account?.name || formatDisplayName(identifier, ROLE_ACCOUNTS[nextRole]);
    try { sessionStorage.setItem(WORKSPACE_ROLE_KEY, nextRole); } catch (error) { /* optional per-tab role memory */ }
    setData((previous) => {
      const next = { ...previous, role: nextRole };
      if (account?.role === 'donor') {
        next.donorProfile = {
          ...previous.donorProfile,
          id: account.donorId || previous.donorProfile?.id || 'donor-thabo',
          name: account.name,
          phone: account.phone || previous.donorProfile?.phone,
          pickupAddress: account.pickupAddress || previous.donorProfile?.pickupAddress,
          pickupCoordinates: {
            ...(previous.donorProfile?.pickupCoordinates || { lat: -26.1072, lon: 28.0546 }),
            label: account.pickupAddress || previous.donorProfile?.pickupAddress,
          },
        };
      } else if (account?.role === 'driver' && account.driverId) {
        next.selectedDriverId = account.driverId;
      }
      return next;
    });
    persistAuthSession({ authenticated: true, role: nextRole, userName });
    setAuthScreen('authenticated');
    setNotificationsOpen(false);
    setAccountOpen(false);
    showToast(`Signed in as ${userName}`);
  }, [persistAuthSession, showToast]);

  const handleSignup = useCallback((payload) => {
    const nextRole = payload.role === 'driver' ? 'driver' : 'donor';
    const initials = payload.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'SR';
    const donorId = nextRole === 'donor' ? safeId('donor') : null;
    const driverId = nextRole === 'driver' ? safeId('driver') : null;
    const account = {
      id: safeId('acct'),
      role: nextRole,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      pickupAddress: payload.pickupAddress || '',
      donorId,
      driverId,
      password: payload.password,
      createdAt: new Date().toISOString(),
    };
    setRegisteredAccounts((previous) => {
      const nextAccounts = [account, ...previous.filter((item) => item.email?.toLowerCase() !== payload.email.toLowerCase())];
      try { localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(nextAccounts)); } catch (error) { /* optional */ }
      return nextAccounts;
    });
    try { sessionStorage.setItem(WORKSPACE_ROLE_KEY, nextRole); } catch (error) { /* optional */ }
    setData((previous) => {
      if (nextRole === 'donor') {
        return {
          ...previous,
          role: 'donor',
          donorProfile: {
            id: donorId,
            name: payload.name,
            phone: payload.phone,
            pickupAddress: payload.pickupAddress,
            pickupCoordinates: {
              ...(previous.donorProfile?.pickupCoordinates || { lat: -26.1072, lon: 28.0546 }),
              label: payload.pickupAddress,
            },
          },
        };
      }
      const newDriver = {
        id: driverId,
        name: payload.name,
        firstName: payload.name.split(/\s+/)[0] || payload.name,
        type: payload.driverType === 'sanbs' ? 'sanbs' : 'independent',
        typeLabel: payload.driverType === 'sanbs' ? 'SANBS employed' : 'Independent approved',
        phone: payload.phone,
        vehicle: payload.vehicle,
        registration: payload.registration,
        verification: 'Verified',
        online: true,
        initials,
        color: 'red',
        currentCoordinates: { lat: -26.1095, lon: 28.0558 },
      };
      return {
        ...previous,
        role: 'driver',
        selectedDriverId: driverId,
        drivers: [newDriver, ...previous.drivers],
      };
    });
    persistAuthSession({ authenticated: true, role: nextRole, userName: payload.name });
    setAuthScreen('authenticated');
    setNotificationsOpen(false);
    setAccountOpen(false);
    showToast(`Account created · welcome, ${payload.name.split(/\s+/)[0]}`);
  }, [persistAuthSession, showToast]);

  const signOut = useCallback(() => {
    persistAuthSession(null);
    setAccountOpen(false);
    setNotificationsOpen(false);
    setAuthScreen('welcome');
  }, [persistAuthSession]);

  const resetDemo = useCallback(() => {
    if (!window.confirm('Reset all demo bookings, drivers and notifications to the sample state?')) return;
    setData(createInitialState());
    setNotificationsOpen(false);
    setAccountOpen(false);
    showToast('Demo workspace restored to the sample state');
  }, [showToast]);

  const setSelectedDriver = useCallback((driverId) => {
    setData((previous) => ({ ...previous, selectedDriverId: driverId }));
  }, []);

  const updateDriverLocation = useCallback((driverId, coordinates) => {
    const lat = Number(coordinates?.lat);
    const lon = Number(coordinates?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return;
    const nextPosition = { lat, lon, updatedAt: coordinates.updatedAt || new Date().toISOString() };
    setData((previous) => {
      const currentDriver = previous.drivers.find((driver) => driver.id === driverId);
      if (!currentDriver) return previous;
      const movedKm = distanceBetweenCoordinates(currentDriver.currentCoordinates, nextPosition);
      const lastUpdate = Date.parse(currentDriver.currentCoordinates?.updatedAt || '');
      if (movedKm < 0.02 && Number.isFinite(lastUpdate) && Date.now() - lastUpdate < 15_000) return previous;
      return {
        ...previous,
        drivers: previous.drivers.map((driver) => driver.id === driverId
          ? { ...driver, currentCoordinates: nextPosition }
          : driver),
        bookings: previous.bookings.map((booking) => {
          const updateLeg = (leg) => leg?.driverId === driverId && leg.status === 'driver_assigned'
            ? { ...leg, driverCoordinates: nextPosition }
            : leg;
          const outbound = updateLeg(booking.outbound);
          const returnLeg = updateLeg(booking.returnLeg);
          return outbound === booking.outbound && returnLeg === booking.returnLeg
            ? booking
            : { ...booking, outbound, returnLeg };
        }),
      };
    });
  }, []);

  const updateDriverNavigation = useCallback((bookingId, legName, driverId, coordinates, progress) => {
    const lat = Number(coordinates?.lat);
    const lon = Number(coordinates?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || !Number.isFinite(progress)) return;
    const position = { lat, lon, updatedAt: new Date().toISOString() };
    setData((previous) => {
      const booking = previous.bookings.find((item) => item.id === bookingId);
      if (!booking) return previous;
      const key = legName === 'return' ? 'returnLeg' : 'outbound';
      const leg = booking[key];
      if (leg?.driverId !== driverId || !['driver_on_the_way', 'donor_picked_up', 'donor_on_the_way_home'].includes(leg.status)) return previous;
      const navigationProgress = Math.max(Number(leg.navigationProgress) || 0, Math.min(1, Math.max(0, progress)));
      const nextBooking = { ...booking, [key]: { ...leg, currentPosition: position, navigationProgress, navigationMode: 'live' } };
      return {
        ...previous,
        bookings: previous.bookings.map((item) => item.id === bookingId ? nextBooking : item),
        drivers: previous.drivers.map((driver) => driver.id === driverId ? { ...driver, currentCoordinates: position } : driver),
      };
    });
  }, []);

  const updateDonorProfile = useCallback((profile) => {
    setData((previous) => ({
      ...previous,
      donorProfile: { ...previous.donorProfile, ...profile },
    }));
  }, []);

  const commitBooking = useCallback((bookingId, change) => {
    const at = new Date().toISOString();
    setData((previous) => {
      const current = previous.bookings.find((booking) => booking.id === bookingId);
      if (!current) return previous;
      const updated = change.transform({ ...current }, previous) || { ...current };
      const event = {
        id: safeId('event'),
        label: change.event,
        by: change.actor || 'SANBS RIDE',
        note: change.note || '',
        at,
      };
      updated.history = [...(current.history || []), event];
      updated.updatedAt = at;
      let next = {
        ...previous,
        bookings: previous.bookings.map((booking) => booking.id === bookingId ? updated : booking),
        lastActivity: { message: change.message || change.event, at },
      };
      if (change.roles?.length) {
        next = appendNotification(next, notificationFor(
          change.noticeTitle || change.event,
          change.noticeMessage || change.message || change.event,
          change.roles,
          bookingId,
          at,
        ));
      }
      return next;
    });
    if (change.message) showToast(change.message);
  }, [showToast]);

  const createBooking = useCallback((fields, origin = 'donor') => {
    const number = data.nextReference || 1;
    const submitted = makeBooking(fields, origin, number);
    const at = new Date().toISOString();
    const nearest = submitted.pickupCoordinates
      ? getEligibleDrivers(data, 'outbound', submitted)[0] || null
      : null;
    const nearestDistance = nearest
      ? distanceBetweenCoordinates(nearest.currentCoordinates, submitted.pickupCoordinates)
      : Infinity;
    const nearestEtaMinutes = nearest
      ? estimateDriverPickupMinutes(nearest.currentCoordinates, submitted.pickupCoordinates)
      : Infinity;
    const assignedDriver = Number.isFinite(nearestEtaMinutes) && nearestEtaMinutes <= MAX_DRIVER_PICKUP_ETA_MINUTES ? nearest : null;
    const booking = assignedDriver ? {
      ...submitted,
      outbound: {
        ...submitted.outbound,
        status: 'driver_assigned',
        driverId: assignedDriver.id,
        driverCoordinates: assignedDriver.currentCoordinates,
        etaMinutes: Math.max(1, Math.ceil(nearestEtaMinutes)),
        assignedAt: at,
        statusAt: at,
      },
      history: [...submitted.history, {
        id: safeId('event'),
        label: `${assignedDriver.name} assigned as nearest available driver`,
        by: 'SANBS RIDE dispatch',
        note: `Estimated ${nearestEtaMinutes.toFixed(1)} minutes from the verified pickup (${nearestDistance.toFixed(1)} km straight-line), based on the driver's last-known GPS position. The nearest-driver auto-assignment threshold is five minutes.`,
        at,
      }],
    } : submitted;
    setData((previous) => {
      const referenceNumber = previous.nextReference || number;
      const newBooking = {
        ...booking,
        reference: makeBooking(fields, origin, referenceNumber).reference,
      };
      let next = {
        ...previous,
        bookings: [newBooking, ...previous.bookings],
        donorProfile: origin === 'staff' ? {
          ...previous.donorProfile,
          id: newBooking.donorId,
          name: newBooking.donorName,
          phone: newBooking.donorPhone,
          pickupAddress: newBooking.pickupAddress,
          pickupCoordinates: newBooking.pickupCoordinates,
        } : newBooking.donorId === previous.donorProfile?.id ? {
          ...previous.donorProfile,
          pickupAddress: newBooking.pickupAddress,
          pickupCoordinates: newBooking.pickupCoordinates,
        } : previous.donorProfile,
        selectedDriverId: assignedDriver?.id || previous.selectedDriverId,
        nextReference: Math.max(referenceNumber + 1, number + 1),
        lastActivity: { message: assignedDriver ? `Nearest driver assigned · ${newBooking.reference}` : `New transport request · ${newBooking.reference}`, at },
      };
      next = appendNotification(next, notificationFor(
        assignedDriver ? 'Nearby driver matched' : 'New transport request',
        assignedDriver
            ? `${assignedDriver.firstName} is within an estimated five-minute drive of ${newBooking.pickupAddress}; they have been asked to acknowledge the trip.`
            : `${newBooking.donorName} · ${newBooking.appointment.locationName}. No available driver is estimated within five minutes; dispatch will review.`,
        ['donor', 'driver', 'staff', 'operations'],
        newBooking.id,
        at,
      ));
      return next;
    });
    showToast(assignedDriver
      ? `${assignedDriver.firstName} is within five minutes and has been asked to acknowledge the trip`
      : `Booking ${booking.reference} shared · dispatch will find a driver within five minutes`);
    return booking;
  }, [data, showToast]);

  const assignDriver = useCallback((bookingId, legName, driverId, actor = 'Transport operations') => {
    const candidate = getEligibleDrivers(data, legName).find((driver) => driver.id === driverId);
    if (!candidate) {
      showToast('That resource is no longer available. Refresh the dispatch queue.', 'warning');
      return false;
    }
    const booking = data.bookings.find((item) => item.id === bookingId);
    if (!booking) return false;
    const driverLeg = getLeg(booking, legName);
    const replacing = driverLeg?.driverId && driverLeg.driverId !== driverId;
    const event = `${candidate.name} assigned to ${legName === 'return' ? 'return' : 'outbound'} trip`;
    const message = `${legName === 'return' ? 'Return' : 'Outbound'} trip assigned to ${candidate.name}`;
    commitBooking(bookingId, {
      event,
      message,
      actor,
      note: replacing ? 'Previous resource released back to the availability pool.' : '',
      noticeTitle: legName === 'return' ? 'Return driver assigned' : 'Driver assigned',
      noticeMessage: `${candidate.firstName} is assigned to ${booking.donorName.split(' ')[0]}’s ${legName === 'return' ? 'return' : 'pickup'} trip.`,
      roles: ['donor', 'driver', 'staff', 'operations'],
      transform: (current) => {
        const key = legName === 'return' ? 'returnLeg' : 'outbound';
        current[key] = {
          ...current[key],
          status: 'driver_assigned',
          driverId,
          acknowledged: false,
          accepted: false,
          assignedAt: new Date().toISOString(),
          statusAt: new Date().toISOString(),
          driverCoordinates: candidate.currentCoordinates || null,
          currentPosition: null,
          navigationProgress: null,
          navigationMode: null,
          etaMinutes: null,
        };
        return current;
      },
    });
    // Keep the driver workspace pointed at the driver who was actually given
    // the work, so the trip is never invisible to them after a dispatch.
    setData((previous) => (previous.selectedDriverId === driverId
      ? previous
      : { ...previous, selectedDriverId: driverId }));
    return true;
  }, [commitBooking, data, showToast]);

  const driverAction = useCallback((bookingId, legName, action, currentPosition = null) => {
    const booking = data.bookings.find((item) => item.id === bookingId);
    if (!booking) return false;
    const driverLeg = getLeg(booking, legName);
    const driver = data.drivers.find((item) => item.id === driverLeg?.driverId);
    if (!driver) return false;
    const normalizePosition = (position) => {
      const lat = Number(position?.lat);
      const lon = Number(position?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
      return { lat, lon, updatedAt: position?.updatedAt || new Date().toISOString() };
    };
    const startPosition = normalizePosition(currentPosition)
      || normalizePosition(driverLeg?.driverCoordinates)
      || normalizePosition(driver.currentCoordinates);
    const canStartNavigation = driverLeg.status === 'driver_assigned' || driverLeg.status === 'donor_picked_up';
    if (action === 'start' && (!canStartNavigation || !startPosition)) return false;
    const actor = driver.type === 'partner' ? `${driver.name} · partner dispatch` : `${driver.name} · driver app`;
    const statusAt = new Date().toISOString();
    let event = '';
    let message = '';
    let noticeTitle = 'Trip update';
    let noticeMessage = '';
    if (action === 'acknowledge') {
      event = 'Driver acknowledged assignment';
      message = 'Assignment acknowledged';
      noticeTitle = 'Driver confirmed';
      noticeMessage = `${driver.firstName} has acknowledged the assignment.`;
    } else if (action === 'accept') {
      event = 'Driver accepted trip offer';
      message = 'Trip accepted';
      noticeTitle = 'Driver accepted';
      noticeMessage = `${driver.firstName} accepted the trip.`;
    } else if (action === 'decline') {
      event = 'Driver declined trip offer';
      message = 'Trip declined · returned to dispatch';
      noticeTitle = 'Trip returned to dispatch';
      noticeMessage = `${driver.firstName} declined the trip. It is available for reassignment.`;
    } else if (action === 'start') {
      const passengerOnboard = driverLeg.status === 'donor_picked_up' || driverLeg.status === 'donor_on_the_way_home';
      event = passengerOnboard ? 'Driver started navigation with donor onboard' : 'Driver started navigation to pickup';
      message = passengerOnboard ? 'Ride navigation started' : 'Pickup navigation started';
      noticeTitle = passengerOnboard ? 'Ride is on the way' : 'Driver is on the way';
      noticeMessage = passengerOnboard
        ? `${driver.firstName} is driving ${booking.donorName.split(' ')[0]} to ${booking.appointment.locationName}.`
        : `${driver.firstName} is heading to the ${legName === 'return' ? 'donation centre' : 'pickup'}.`;
    } else if (action === 'arrived') {
      event = legName === 'return' ? 'Driver arrived at the donation centre' : 'Driver arrived at pickup';
      message = legName === 'return' ? 'Driver arrived at the centre' : 'Driver arrived at pickup';
      noticeTitle = 'Driver has arrived';
      noticeMessage = `${driver.firstName} has arrived at the ${legName === 'return' ? 'donation centre' : 'pickup location'}.`;
    } else if (action === 'picked_up') {
      event = legName === 'return' ? 'Donor picked up for return journey' : 'Donor picked up';
      message = legName === 'return' ? 'Return journey started' : 'Donor picked up';
      noticeTitle = legName === 'return' ? 'Donor is on the way home' : 'Donor picked up';
      noticeMessage = legName === 'return' ? 'The donor has started the return journey.' : `${driver.firstName} confirmed donor pickup.`;
    } else if (action === 'arrived_site') {
      event = 'Donor arrived at donation site';
      message = 'Arrival at donation site confirmed';
      noticeTitle = 'Donor arrived at SANBS';
      noticeMessage = 'The donor reached the donation site. Return transport remains subject to SANBS authorisation.';
    } else if (action === 'complete') {
      event = 'Return journey completed';
      message = 'Return journey completed';
      noticeTitle = 'Journey complete';
      noticeMessage = 'The donor and driver journeys are complete.';
    }
    const roles = ['donor', 'staff', 'operations', 'driver'];
    commitBooking(bookingId, {
      event,
      message,
      actor,
      noticeTitle,
      noticeMessage,
      roles,
      transform: (current) => {
        const key = legName === 'return' ? 'returnLeg' : 'outbound';
        const leg = { ...current[key] };
        if (action === 'acknowledge') leg.acknowledged = true;
        if (action === 'accept') { leg.accepted = true; leg.acknowledged = true; }
        if (action === 'decline') {
          leg.status = legName === 'return' ? 'awaiting_dispatch' : 'awaiting_assignment';
          leg.driverId = null;
          leg.acknowledged = false;
          leg.accepted = false;
          leg.navigationProgress = null;
          leg.navigationMode = null;
          leg.currentPosition = null;
        }
        if (action === 'start') {
          const liveStart = currentPosition && !currentPosition.simulated ? normalizePosition(currentPosition) : null;
          if (leg.status === 'driver_assigned') leg.status = 'driver_on_the_way';
          leg.navigationMode = liveStart ? 'live' : 'simulated';
          leg.navigationProgress = liveStart ? 0 : null;
          leg.etaMinutes = null;
          leg.driverCoordinates = startPosition || normalizePosition(driver.currentCoordinates) || normalizePosition(leg.driverCoordinates);
          leg.currentPosition = liveStart;
        }
        if (action === 'arrived') {
          leg.status = 'driver_arrived';
          leg.navigationProgress = null;
          leg.currentPosition = null;
        }
        if (action === 'picked_up') {
          const liveStart = currentPosition && !currentPosition.simulated ? normalizePosition(currentPosition) : null;
          leg.status = legName === 'return' ? 'donor_on_the_way_home' : 'donor_picked_up';
          if (legName === 'return') {
            leg.navigationMode = liveStart ? 'live' : 'simulated';
            leg.navigationProgress = liveStart ? 0 : null;
            leg.currentPosition = liveStart;
          } else {
            leg.navigationProgress = null;
            leg.navigationMode = null;
            leg.currentPosition = null;
          }
          leg.etaMinutes = null;
        }
        if (action === 'arrived_site') leg.status = 'arrived_at_site';
        if (action === 'complete') leg.status = 'completed';
        leg.statusAt = statusAt;
        current[key] = leg;
        return current;
      },
    });
    return true;
  }, [commitBooking, data]);

  const authorizeReturn = useCallback((bookingId) => {
    const booking = data.bookings.find((item) => item.id === bookingId);
    if (!booking || !booking.returnRequested || booking.outbound.status !== 'arrived_at_site' || booking.returnLeg.status !== 'waiting_authorisation') return;
    const at = new Date().toISOString();
    commitBooking(bookingId, {
      event: 'Return transport authorised by SANBS staff',
      message: 'Return authorised · available in dispatch',
      actor: 'SANBS collection staff',
      note: `Readiness confirmed at ${new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(new Date(at))}. No clinical details recorded.`,
      noticeTitle: 'Return transport authorised',
      noticeMessage: 'SANBS has confirmed the donor is ready. Operations can now dispatch a return driver.',
      roles: ['donor', 'driver', 'staff', 'operations'],
      transform: (current) => {
        current.returnLeg = {
          ...current.returnLeg,
          status: 'awaiting_dispatch',
          authorizedAt: at,
          authorizedBy: 'SANBS collection staff',
          statusAt: at,
        };
        return current;
      },
    });
  }, [commitBooking, data]);

  const confirmDonorArrival = useCallback((bookingId, actor = 'SANBS collection staff') => {
    const booking = data.bookings.find((item) => item.id === bookingId);
    if (!booking || booking.outbound.status !== 'donor_picked_up') return;
    commitBooking(bookingId, {
      event: 'Arrival at donation site confirmed by staff',
      message: 'Arrival confirmed at donation site',
      actor,
      noticeTitle: 'Arrival confirmed',
      noticeMessage: 'SANBS staff confirmed the donor has arrived at the site.',
      roles: ['donor', 'staff', 'operations', 'driver'],
      transform: (current) => {
        current.outbound = { ...current.outbound, status: 'arrived_at_site', statusAt: new Date().toISOString() };
        return current;
      },
    });
  }, [commitBooking, data]);

  const reportException = useCallback((bookingId, exception, actorRole, actorName) => {
    const booking = data.bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    const record = {
      id: safeId('exception'),
      category: exception.category || 'Transport issue',
      details: exception.details || '',
      leg: exception.leg || 'outbound',
      reportedBy: actorName || (actorRole === 'driver' ? 'Driver' : actorRole === 'staff' ? 'SANBS staff' : 'Donor'),
      role: actorRole,
      status: 'open',
      at: new Date().toISOString(),
    };
    commitBooking(bookingId, {
      event: `Exception reported · ${record.category}`,
      message: 'Issue sent to transport operations',
      actor: record.reportedBy,
      note: record.details,
      noticeTitle: 'Transport issue needs attention',
      noticeMessage: `${record.category} · ${booking.donorName} · ${record.details || 'Review the journey record.'}`,
      roles: ['operations', 'staff'],
      transform: (current) => {
        current.exceptions = [...(current.exceptions || []), record];
        return current;
      },
    });
  }, [commitBooking, data]);

  const resolveException = useCallback((bookingId, exceptionId) => {
    const booking = data.bookings.find((item) => item.id === bookingId);
    const exception = booking?.exceptions?.find((item) => item.id === exceptionId);
    if (!exception || exception.status === 'resolved') return;
    commitBooking(bookingId, {
      event: `Exception resolved · ${exception.category}`,
      message: 'Exception marked as resolved',
      actor: 'Transport operations',
      note: 'Resolution recorded in the operational history.',
      noticeTitle: 'Transport issue resolved',
      noticeMessage: `${exception.category} for ${booking.donorName} was marked resolved.`,
      roles: ['operations', 'staff'],
      transform: (current) => {
        current.exceptions = current.exceptions.map((item) => item.id === exceptionId
          ? { ...item, status: 'resolved', resolvedAt: new Date().toISOString() }
          : item);
        return current;
      },
    });
  }, [commitBooking, data]);

  const updatePickup = useCallback((bookingId, pickup) => {
    const address = typeof pickup === 'string' ? pickup.trim() : pickup?.address?.trim();
    const coordinates = typeof pickup === 'string' ? null : pickup?.coordinates || null;
    if (!address || !coordinates) return;
    commitBooking(bookingId, {
      event: 'Pickup location updated by donor',
      message: 'Pickup details updated',
      actor: 'Donor app',
      note: address,
      noticeTitle: 'Pickup details changed',
      noticeMessage: `Pickup updated to ${address}. Check route and driver details.`,
      roles: ['staff', 'operations', 'driver', 'donor'],
      transform: (current) => {
        current.pickupAddress = address;
        current.pickupCoordinates = coordinates;
        return current;
      },
    });
  }, [commitBooking]);

  const simulatePartnerUpdate = useCallback((bookingId, legName) => {
    const booking = data.bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    const leg = getLeg(booking, legName);
    const nextAction = {
      driver_assigned: 'start',
      driver_on_the_way: 'arrived',
      driver_arrived: 'picked_up',
      donor_picked_up: legName === 'return' ? 'complete' : 'arrived_site',
      donor_on_the_way_home: 'complete',
    }[leg?.status];
    if (nextAction) driverAction(bookingId, legName, nextAction);
  }, [data, driverAction]);

  const toggleDriverAvailability = useCallback((driverId) => {
    const availability = data.drivers.find((driver) => driver.id === driverId);
    if (!availability || availability.isProvider) return;
    const active = data.bookings.some((booking) => {
      const outboundActive = booking.outbound.driverId === driverId && !['arrived_at_site', 'cancelled', 'completed'].includes(booking.outbound.status);
      const returnActive = booking.returnLeg.driverId === driverId && ['driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_on_the_way_home'].includes(booking.returnLeg.status);
      return outboundActive || returnActive;
    });
    if (active && availability.online) {
      showToast('Finish the current trip before going offline.', 'warning');
      return;
    }
    const online = !availability.online;
    const at = new Date().toISOString();
    setData((previous) => {
      let next = {
        ...previous,
        drivers: previous.drivers.map((driver) => driver.id === driverId ? { ...driver, online } : driver),
        lastActivity: { message: `${availability.name} went ${online ? 'online' : 'offline'}`, at },
      };
      next = appendNotification(next, notificationFor(
        online ? 'Driver is available' : 'Driver went offline',
        `${availability.name} is ${online ? 'now available for assignment' : 'not available for new assignments'}.`,
        ['operations', 'staff'],
        null,
        at,
      ));
      return next;
    });
    showToast(`${availability.name} is ${online ? 'online' : 'offline'}`);
  }, [data, showToast]);

  const setOperatingModel = useCallback((model) => {
    if (!['fleet', 'independent', 'partner', 'hybrid'].includes(model)) return;
    const at = new Date().toISOString();
    setData((previous) => {
      let next = {
        ...previous,
        operatingModel: model,
        lastActivity: { message: `Operating model changed to ${model}`, at },
      };
      next = appendNotification(next, notificationFor(
        'Operating model updated',
        `New dispatches will use the ${model} model. Existing assignments are unchanged.`,
        ['operations', 'staff'],
        null,
        at,
      ));
      return next;
    });
    showToast('Operating model updated · existing trips are unchanged');
  }, [showToast]);

  const markNotificationsRead = useCallback((role) => {
    setData((previous) => ({
      ...previous,
      notifications: (previous.notifications || []).map((item) => item.roles.includes(role) && !item.readBy.includes(role)
        ? { ...item, readBy: [...item.readBy, role] }
        : item),
    }));
  }, []);

  const openNotifications = useCallback(() => {
    setNotificationsOpen(true);
    markNotificationsRead(data.role);
  }, [data.role, markNotificationsRead]);

  const actions = useMemo(() => ({
    showToast,
    switchWorkspace: setRole,
    openNotifications,
    createBooking,
    assignDriver,
    driverAction,
    authorizeReturn,
    confirmDonorArrival,
    reportException,
    resolveException,
    updatePickup,
    simulatePartnerUpdate,
    toggleDriverAvailability,
    setOperatingModel,
    setSelectedDriver,
    updateDriverLocation,
    updateDriverNavigation,
    updateDonorProfile,
  }), [
    showToast,
    setRole,
    openNotifications,
    createBooking,
    assignDriver,
    driverAction,
    authorizeReturn,
    confirmDonorArrival,
    reportException,
    resolveException,
    updatePickup,
    simulatePartnerUpdate,
    toggleDriverAvailability,
    setOperatingModel,
    setSelectedDriver,
    updateDriverLocation,
    updateDriverNavigation,
    updateDonorProfile,
  ]);

  const accountName = data.role === 'donor'
    ? (data.donorProfile?.name || ROLE_ACCOUNTS.donor)
    : data.role === 'driver'
      ? (getDriver(data, data.selectedDriverId)?.name || ROLE_ACCOUNTS.driver)
      : (authSession?.role === data.role && authSession?.userName) || ROLE_ACCOUNTS[data.role];
  const accountInitials = accountName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const unreadCount = (data.notifications || []).filter((item) => item.roles.includes(data.role) && !item.readBy.includes(data.role)).length;

  /* Live journey awareness — the same derived state every workspace renders,
     so the header can never disagree with the panels below it. */
  const liveJourney = useMemo(() => {
    const list = data.bookings || [];
    let relevant = [];
    if (data.role === 'donor') {
      relevant = list.filter((b) => b.donorId === (data.donorProfile?.id || 'donor-thabo'));
    } else if (data.role === 'driver') {
      const id = data.selectedDriverId;
      relevant = list.filter((b) => b.outbound?.driverId === id || b.returnLeg?.driverId === id);
    } else {
      relevant = list;
    }
    const active = relevant.filter((b) => isBookingActive(b));
    const focus = active[0] || relevant[0] || null;
    return focus ? { booking: focus, summary: getJourneySummary(focus), count: active.length } : null;
  }, [data.bookings, data.role, data.donorProfile, data.selectedDriverId]);

  if (authScreen !== 'authenticated') {
    return (
      <div className="app-root is-auth-flow">
        <BrandDefs />
        <AuthFlow
          screen={authScreen}
          defaultRole={data.role}
          registeredAccounts={registeredAccounts}
          onNavigate={setAuthScreen}
          onEnterDemo={enterDemo}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onToast={showToast}
        />
        {toast && <div className={`toast toast-${toast.tone}`} role="status"><span className="toast-mark">✓</span>{toast.message}<button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={14} /></button></div>}
      </div>
    );
  }

  return (
    <div className={`app-root${data.role === 'donor' || data.role === 'driver' ? ' is-phone-role' : ''}`}>
      <BrandDefs />
      <header className="app-header">
        <div className="app-header-brand"><SanbsBrand light /></div>
        <div className="app-header-context">
          {liveJourney ? <button
            type="button"
            className="header-journey"
            onClick={() => setNotificationsOpen(true)}
            title={liveJourney.summary.detail}
          >
            <span className={`header-journey-dot tone-${liveJourney.summary.done ? 'done' : 'live'}`} />
            <span className="header-journey-ref">{liveJourney.booking.reference}</span>
            <span className="header-journey-divider" />
            <span className="header-journey-label">{liveJourney.summary.label}</span>
            <span className="header-journey-bar" aria-hidden="true">
              <i style={{ width: `${Math.round(liveJourney.summary.percent * 100)}%` }} />
            </span>
            {liveJourney.count > 1 && <span className="header-journey-count">+{liveJourney.count - 1}</span>}
          </button> : <span className="workspace-eyebrow">No active journeys</span>}
        </div>
        <div className="app-header-actions">
          <div className="account-switch">
            <button
              ref={accountTriggerRef}
              className={`account-trigger ${accountOpen ? 'is-open' : ''}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen(!accountOpen)}
            >
              <span className="account-avatar" aria-hidden="true">{accountInitials}</span>
              <span className="account-identity">
                <strong>{accountName}</strong>
                <small>{WORKSPACE_LABELS[data.role]}</small>
              </span>
              <ChevronDown size={16} className="account-chevron" />
            </button>
            {accountOpen && <>
              <button className="account-scrim" type="button" aria-label="Close account menu" onClick={() => setAccountOpen(false)} />
              <div className="account-menu" role="menu" aria-label="Switch workspace" ref={menuRef} onKeyDown={onMenuKeyDown}>
                <div className="account-menu-head"><span className="eyebrow">SIGNED IN AS</span><strong>{accountName}</strong></div>
                {ROLE_ORDER.map((role) => <button
                  key={role}
                  type="button"
                  role="menuitemradio"
                  aria-checked={data.role === role}
                  className={`account-menu-item ${data.role === role ? 'is-current' : ''}`}
                  onClick={() => { setRole(role); setAccountOpen(false); }}
                >
                  <span className="account-menu-icon"><RoleIcon role={role} size={17} /></span>
                  <span><strong>{WORKSPACE_LABELS[role]}</strong><small>{ROLE_HINTS[role]}</small></span>
                  {data.role === role && <Check size={17} />}
                </button>)}
                <div className="account-menu-divider" />
                <button type="button" role="menuitem" className="account-menu-item account-menu-reset" onClick={resetDemo}>
                  <span className="account-menu-icon"><RotateCcw size={16} /></span>
                  <span><strong>Reset demo data</strong><small>Restore the sample journeys</small></span>
                </button>
                <button type="button" role="menuitem" className="account-menu-item account-menu-reset" onClick={signOut}>
                  <span className="account-menu-icon"><LogOut size={16} /></span>
                  <span><strong>Sign out</strong><small>Return to opening screen</small></span>
                </button>
              </div>
            </>}
          </div>
          <div className="toolbar-notifications">
            <button ref={notificationTriggerRef} className={`notification-trigger ${notificationsOpen ? 'is-open' : ''}`} type="button" aria-label={`Notifications for ${WORKSPACE_LABELS[data.role]}${unreadCount ? `, ${unreadCount > 9 ? '9 or more' : unreadCount} unread` : ''}`} aria-expanded={notificationsOpen} onClick={() => {
              const nextOpen = !notificationsOpen;
              setNotificationsOpen(nextOpen);
              if (nextOpen) markNotificationsRead(data.role);
            }}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            {notificationsOpen && <button className="notification-scrim" type="button" tabIndex={-1} aria-label="Close updates" onClick={() => setNotificationsOpen(false)} />}
            {notificationsOpen && <section className="notification-popover" role="dialog" aria-label="Journey updates">
              <div className="notification-popover-head"><div><span className="eyebrow">{WORKSPACE_LABELS[data.role]}</span><strong>Journey updates</strong></div><button type="button" className="bare-icon" onClick={() => setNotificationsOpen(false)} aria-label="Close updates"><X size={16} /></button></div>
              {(data.notifications || []).filter((item) => item.roles.includes(data.role)).length === 0
                ? <p className="notification-empty">Updates for this workspace will appear here.</p>
                : (data.notifications || []).filter((item) => item.roles.includes(data.role)).slice(0, 8).map((item) => <div className="notification-item" key={item.id}>
                    <i className={item.readBy.includes(data.role) ? 'notice-read' : ''} />
                    <div><strong>{item.title}</strong><p>{item.message}</p><small><RelativeStamp stamp={item.at} /></small></div>
                  </div>)}
              <div className="notification-foot"><ShieldCheck size={13} /> Journey updates are shared with the teams involved</div>
            </section>}
          </div>
        </div>
      </header>

      <main className="role-stage">
        <div className={`role-panel role-panel-${data.role}`}>
          <Suspense fallback={<div className="role-loading" role="status">Loading workspace…</div>}>
            {data.role === 'donor' && <DonorApp state={data} actions={actions} />}
            {data.role === 'driver' && <DriverApp state={data} actions={actions} />}
            {data.role === 'staff' && <StaffApp state={data} actions={actions} />}
            {data.role === 'operations' && <OperationsApp state={data} actions={actions} />}
          </Suspense>
        </div>
      </main>

      {toast && <div className={`toast toast-${toast.tone}`} role="status"><span className="toast-mark">✓</span>{toast.message}<button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={14} /></button></div>}
    </div>
  );
}
