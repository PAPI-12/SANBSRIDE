import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePhoneScale } from '../phoneScale';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ArrowRight,
  Check,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Download,
  Clock3,
  MapPin,
  Navigation,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Truck,
  UserRound,
} from 'lucide-react';
import {
  formatCoordinates,
  formatDate,
  formatTime,
  getDriver,
  getDriverAvailability,
  getJourneyMapState,
  localDateString,
} from '../domain.js';
import {
  DriverAvatar,
  EmptyState,
  JourneyTimeline,
  StatusChip,
} from '../components/Shared.jsx';
import { ReportIssueModal } from '../components/WorkflowModals.jsx';
import JourneyMap from '../components/JourneyMap.jsx';
import { getBookingRoute, projectProgressOnRoute } from '../services/routing.js';

const ACTIVE_STATUSES = ['driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_picked_up', 'donor_on_the_way_home'];

function greetingFor(date) {
  const hour = Number(new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', hour12: false, timeZone: 'Africa/Johannesburg' }).format(date));
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DriverApp({ state, actions }) {
  usePhoneScale();
  const [tab, setTab] = useState('today');
  const [issueOpen, setIssueOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const driver = getDriver(state, state.selectedDriverId) || state.drivers.find((item) => !item.isProvider);
  const availableDrivers = state.drivers.filter((item) => !item.isProvider);
  const tasks = useMemo(() => getDriverTasks(state, driver?.id), [state, driver?.id]);
  const currentTask = tasks.find((task) => ACTIVE_STATUSES.includes(task.leg.status)) || null;
  const availability = driver ? getDriverAvailability(state, driver.id) : 'offline';
  const completedTasks = getDriverCompletedTasks(state, driver?.id);
  const locationWatchRef = useRef(null);

  useEffect(() => {
    if (!driver || availability === 'offline' || !navigator.geolocation) return undefined;
    locationWatchRef.current = navigator.geolocation.watchPosition((position) => {
      actions.updateDriverLocation?.(driver.id, {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        updatedAt: new Date(position.timestamp || Date.now()).toISOString(),
      });
    }, () => {
      // Retain the last known position; dispatch labels it as last known rather than live.
    }, { enableHighAccuracy: true, maximumAge: 15_000, timeout: 20_000 });
    return () => {
      if (locationWatchRef.current !== null) navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    };
  }, [driver?.id, availability, actions.updateDriverLocation]);

  const changeDriver = (id) => {
    actions.setSelectedDriver(id);
    setIdentityOpen(false);
  };

  const openSupport = () => {
    if (currentTask) {
      setIssueOpen(true);
      return;
    }
    actions.showToast('No active trip to attach a report to. Contact Transport Ops for shift support.');
  };

  return (
    <div className="mobile-experience-wrap driver-experience">
      <section className="mobile-app-frame driver-frame app-surface">
        <header className={`driver-app-header ${tab === 'profile' ? 'driver-app-header-profile' : ''}`}>
          {tab === 'profile' ? <div className="driver-profile-toolbar">
            <button className="driver-profile-toolbar-button" type="button" onClick={() => setTab('today')} aria-label="Back to today"><ArrowLeft size={17} /></button>
            <span>DRIVER PROFILE<small>{driver?.registration || 'DRIVER ACCOUNT'}</small></span>
          </div> : <>
            <div className="driver-header-top"><span className="driver-workspace-label">DRIVER WORKSPACE</span><button className="driver-help-icon" type="button" onClick={openSupport} aria-label="Help: driver support"><CircleHelp size={18} /><span>Help</span></button></div>
            <div className="driver-identity-row">
              <div className="driver-identity">
                <DriverAvatar driver={driver} />
                <button className="driver-identity-select" type="button" onClick={() => setIdentityOpen((open) => !open)}>
                  <span><small>DRIVING AS</small><strong>{driver?.name}</strong></span><ChevronDown size={15} />
                </button>
                {identityOpen && <div className="driver-identity-menu">{availableDrivers.map((person) => <button key={person.id} type="button" className={person.id === driver?.id ? 'selected' : ''} onClick={() => changeDriver(person.id)}><DriverAvatar driver={person} size="small" /><span><strong>{person.name}</strong><small>{person.typeLabel}</small></span>{person.id === driver?.id && <Check size={15} />}</button>)}</div>}
              </div>
              <button className={`availability-toggle ${availability === 'available' ? 'toggle-online' : availability === 'on_trip' ? 'toggle-busy' : 'toggle-offline'}`} type="button" onClick={() => actions.toggleDriverAvailability(driver.id)} disabled={availability === 'on_trip'} aria-pressed={availability === 'available'}>
                {availability === 'available' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{availability === 'on_trip' ? 'On trip' : availability === 'available' ? 'Online' : 'Offline'}</span>
              </button>
            </div>
          </>}
        </header>
        <div className="driver-app-scroll">
          {tab === 'today' && <DriverToday
            driver={driver}
            state={state}
            task={currentTask}
            taskCount={tasks.length}
            completedCount={completedTasks.length}
            availability={availability}
            actions={actions}
            onReport={() => setIssueOpen(true)}
          />}
          {tab === 'trips' && <DriverTrips
            driver={driver}
            state={state}
            tasks={tasks}
            completed={completedTasks}
            onBack={() => setTab('today')}
          />}
          {tab === 'reports' && <DriverReports driver={driver} state={state} actions={actions} />}
          {tab === 'profile' && <DriverProfile
            driver={driver}
            state={state}
            availability={availability}
            tasks={tasks}
            onOpenToday={() => setTab('today')}
            onSupport={openSupport}
          />}
        </div>
        <nav className="app-rail app-rail-driver" aria-label="Driver navigation">
          <span className="app-rail-label">Driver</span>
          <button className={tab === 'today' ? 'app-rail-item active' : 'app-rail-item'} type="button" onClick={() => setTab('today')} aria-current={tab === 'today' ? 'page' : undefined}><Navigation size={18} /><span>Today</span></button>
          <button className={tab === 'trips' ? 'app-rail-item active' : 'app-rail-item'} type="button" onClick={() => setTab('trips')} aria-current={tab === 'trips' ? 'page' : undefined}><Truck size={18} /><span>Trips</span></button>
          <button className={tab === 'reports' ? 'app-rail-item active' : 'app-rail-item'} type="button" onClick={() => setTab('reports')} aria-current={tab === 'reports' ? 'page' : undefined}><BarChart3 size={18} /><span>Reports</span></button>
          <button className={tab === 'profile' ? 'app-rail-item active' : 'app-rail-item'} type="button" onClick={() => setTab('profile')} aria-current={tab === 'profile' ? 'page' : undefined}><UserRound size={18} /><span>Profile</span></button>
        </nav>
        <nav className="mobile-bottom-nav driver-bottom-nav driver-circular-dock" aria-label="Driver app navigation">
          <button className={`dock-circle-btn${tab === 'today' ? ' active' : ''}`} type="button" onClick={() => setTab('today')} aria-label="Today" aria-current={tab === 'today' ? 'page' : undefined} title="Today"><Navigation size={20} strokeWidth={tab === 'today' ? 2.3 : 1.9} /></button>
          <button className={`dock-circle-btn${tab === 'trips' ? ' active' : ''}`} type="button" onClick={() => setTab('trips')} aria-label="Trips" aria-current={tab === 'trips' ? 'page' : undefined} title="Trips"><Truck size={20} strokeWidth={tab === 'trips' ? 2.3 : 1.9} /></button>
          <button className={`dock-circle-btn${tab === 'reports' ? ' active' : ''}`} type="button" onClick={() => setTab('reports')} aria-label="Reports" aria-current={tab === 'reports' ? 'page' : undefined} title="Reports"><BarChart3 size={20} strokeWidth={tab === 'reports' ? 2.3 : 1.9} /></button>
          <button className={`dock-circle-btn${tab === 'profile' ? ' active' : ''}`} type="button" onClick={() => setTab('profile')} aria-label="Profile" aria-current={tab === 'profile' ? 'page' : undefined} title="Profile"><UserRound size={20} strokeWidth={tab === 'profile' ? 2.3 : 1.9} /></button>
        </nav>
      </section>
      {issueOpen && currentTask && <ReportIssueModal
        title="Report a trip issue"
        subtitle={`${currentTask.booking.reference} · Transport operations will be notified.`}
        leg={currentTask.legName}
        onClose={() => setIssueOpen(false)}
        onSubmit={(payload) => {
          actions.reportException(currentTask.booking.id, payload, 'driver', driver.name);
          setIssueOpen(false);
        }}
      />}
    </div>
  );
}

function getDriverTasks(state, driverId) {
  if (!driverId) return [];
  const tasks = [];
  state.bookings.forEach((booking) => {
    if (booking.outbound?.driverId === driverId && ACTIVE_STATUSES.includes(booking.outbound.status)) {
      tasks.push({ booking, legName: 'outbound', leg: booking.outbound });
    }
    if (booking.returnLeg?.driverId === driverId && ACTIVE_STATUSES.includes(booking.returnLeg.status)) {
      tasks.push({ booking, legName: 'return', leg: booking.returnLeg });
    }
  });
  return tasks.sort((a, b) => new Date(a.booking.appointment.date) - new Date(b.booking.appointment.date));
}

function getDriverCompletedTasks(state, driverId) {
  if (!driverId) return [];
  const tasks = [];
  state.bookings.forEach((booking) => {
    if (booking.outbound?.driverId === driverId && ['arrived_at_site', 'completed'].includes(booking.outbound.status)) tasks.push({ booking, legName: 'outbound', leg: booking.outbound });
    if (booking.returnLeg?.driverId === driverId && booking.returnLeg.status === 'completed') tasks.push({ booking, legName: 'return', leg: booking.returnLeg });
  });
  return tasks;
}

function DriverToday({ driver, state, task, taskCount, completedCount, availability, actions, onReport }) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [navigationActionPending, setNavigationActionPending] = useState(false);
  const navigationActionLock = useRef(false);
  const leg = task?.leg;
  const booking = task?.booking;
  const legName = task?.legName;
  const returnTrip = legName === 'return';
  const tripStatus = leg?.status;
  const donorFirst = booking?.donorName.split(' ')[0] || 'Donor';
  const mapJourney = booking ? getJourneyMapState(booking, legName) : null;
  const approachingPickup = mapJourney?.phase === 'to_pickup';
  const routeFrom = !booking ? 'Driver location' : approachingPickup
    ? (leg?.driverCoordinates?.label || formatCoordinates(leg?.driverCoordinates) || 'Driver position unavailable')
    : (returnTrip ? booking.appointment.locationName : booking.pickupAddress);
  const routeTo = !booking ? 'Pickup' : approachingPickup
    ? (returnTrip ? booking.appointment.locationAddress : booking.pickupAddress)
    : (returnTrip ? booking.pickupAddress : booking.appointment.locationAddress);
  const onLocationFix = useCallback((position) => {
    if (driver?.id) actions.updateDriverLocation?.(driver.id, position);
  }, [actions.updateDriverLocation, driver?.id]);
  const onPositionUpdate = useCallback((position, progress) => {
    if (booking?.id && driver?.id) actions.updateDriverNavigation?.(booking.id, legName, driver.id, position, progress);
  }, [actions.updateDriverNavigation, booking?.id, driver?.id, legName]);

  if (!driver) return null;
  const needsOfferResponse = tripStatus === 'driver_assigned' && driver.type === 'independent' && !leg?.accepted;
  const needsAcknowledgement = tripStatus === 'driver_assigned' && driver.type !== 'independent' && !leg?.acknowledged;
  const primary = getPrimaryAction(tripStatus, returnTrip, needsOfferResponse, needsAcknowledgement);

  if (navigationOpen && task) return <DriverNavigation
    booking={booking}
    leg={leg}
    legName={legName}
    returnTrip={returnTrip}
    driverName={driver.firstName}
    routeFrom={routeFrom}
    routeTo={routeTo}
    approachingPickup={approachingPickup}
    navigationStarted={navigationStarted}
    onLocationFix={onLocationFix}
    onPositionUpdate={onPositionUpdate}
    onBack={() => setNavigationOpen(false)}
    actionPending={navigationActionPending}
    onAction={(action, position) => {
      if (navigationActionLock.current) return false;
      navigationActionLock.current = true;
      setNavigationActionPending(true);
      try {
        if (action === 'start') {
          if (!Number.isFinite(Number(position?.lat)) || !Number.isFinite(Number(position?.lon))) return false;
          if (!actions.driverAction(booking.id, legName, 'start', position)) return false;
          setNavigationStarted(true);
        } else {
          if (!actions.driverAction(booking.id, legName, action)) return false;
          if (action === 'picked_up') setNavigationStarted(false);
          if (action === 'arrived_site' || action === 'complete') setNavigationOpen(false);
        }
        return true;
      } finally {
        navigationActionLock.current = false;
        setNavigationActionPending(false);
      }
    }}
  />;

  return <div className="driver-today-page">
    <div className="driver-greeting"><span className="section-kicker">{formatDate(localDateString(), { weekday: 'long' }).toUpperCase()} · YOUR SHIFT</span><h1>{greetingFor(new Date())}, {driver.firstName}</h1><p>Drive safely. Take your time.</p></div>
    <div className="driver-shift-strip"><div><span className="driver-shift-number">{taskCount}</span><span>Active {taskCount === 1 ? 'trip' : 'trips'}</span></div><span className="shift-divider" /><div><span className="driver-shift-number">{completedCount}</span><span>Completed today</span></div><span className="shift-status"><i className={`availability-dot dot-${availability}`} />{availability === 'on_trip' ? 'On a trip' : availability === 'available' ? 'Available for dispatch' : 'Offline'}</span></div>
    {task ? <>
      <div className="driver-assignment-label"><span className="section-kicker">{tripStatus === 'driver_assigned' ? 'NEW ASSIGNMENT' : 'CURRENT TRIP'}</span><span className="driver-trip-reference">{booking.reference}</span></div>
      <section className="driver-trip-card">
        <div className="driver-trip-heading"><div><span className={`trip-type-pill ${returnTrip ? 'trip-type-return' : ''}`}>{returnTrip ? 'RETURN' : 'OUTBOUND'}</span><h2>{returnTrip ? 'Return to donor' : 'Pickup for donation'}</h2></div><StatusChip booking={booking} compact /></div>
        <div className="driver-trip-meta"><span><Clock3 size={14} />{returnTrip ? 'Ready now' : `${formatTime(booking.pickupTime || '08:45')} pickup`}</span><span className="driver-trip-length">{approachingPickup ? 'To pickup' : 'Donor on board'}</span></div>
        <div className="driver-live-map-frame"><JourneyMap booking={booking} leg={legName} from={routeFrom} to={routeTo} className="driver-live-map-canvas" controls /></div>
        <div className="driver-route-details">
          <div className="driver-route-row"><span className="route-small-dot dot-origin" /><div><small>{approachingPickup ? 'CURRENT ROUTE START' : 'PICKUP'}</small><strong>{routeFrom}</strong></div></div>
          <div className="driver-route-row"><span className="route-small-dot dot-destination" /><div><small>{approachingPickup ? 'DRIVE TO PICKUP' : returnTrip ? 'DROP-OFF' : 'DONATION SITE'}</small><strong>{routeTo}</strong>{!returnTrip && !approachingPickup && <small className="driver-appointment-small">Appointment · {formatTime(booking.appointment.time)}</small>}</div></div>
        </div>
        {!returnTrip && booking.pickupNotes && <div className="pickup-instruction"><span><MapPin size={14} /></span><div><small>PICKUP NOTE</small><strong>{booking.pickupNotes}</strong></div></div>}
        <div className="driver-donor-summary"><span className="donor-summary-avatar">{donorFirst[0]}</span><div><span>DONOR</span><strong>{donorFirst}</strong></div><span className="privacy-mini"><ShieldCheck size={13} />Limited details</span></div>
        <div className="driver-trip-progress"><JourneyTimeline booking={booking} leg={legName} compact /></div>
        {primary.kind === 'offer' ? <div className="driver-response-actions">
          <button className="button button-quiet button-wide" type="button" onClick={() => actions.driverAction(booking.id, legName, 'decline')}>Decline</button>
          <button className="button button-primary button-wide" type="button" onClick={() => { actions.driverAction(booking.id, legName, 'accept'); setNavigationOpen(true); setNavigationStarted(false); }}>Accept trip <ArrowRight size={15} /></button>
        </div> : <button className="button button-primary button-wide driver-primary-action" type="button" onClick={() => {
          if (primary.action === 'acknowledge') { actions.driverAction(booking.id, legName, primary.action); setNavigationOpen(true); setNavigationStarted(false); }
          else if (primary.action === 'start') { setNavigationOpen(true); setNavigationStarted(false); }
          else if (primary.action === 'picked_up') { actions.driverAction(booking.id, legName, primary.action); setNavigationOpen(true); setNavigationStarted(false); }
          else actions.driverAction(booking.id, legName, primary.action);
        }}>
          {primary.icon === 'navigation' ? <Navigation size={16} /> : primary.icon === 'check' ? <Check size={17} /> : <MapPin size={16} />}
          {primary.label}<ArrowRight size={15} />
        </button>}
        {tripStatus !== 'driver_assigned' && <button className="driver-report-link" type="button" onClick={onReport}><AlertTriangle size={14} /> Report a trip issue</button>}
      </section>
    </> : <section className="driver-no-assignment">
      <span className="driver-empty-icon"><Navigation size={19} /></span>
      <span className="section-kicker">NO ACTIVE ASSIGNMENT</span>
      <h2>You’re {availability === 'offline' ? 'offline' : 'ready for dispatch'}.</h2>
      <p>{availability === 'offline' ? 'Go online when you are ready to receive trips.' : 'A new assignment from transport operations will show here.'}</p>
      <button className={`button ${availability === 'offline' ? 'button-primary' : 'button-secondary'} button-wide`} type="button" onClick={() => actions.toggleDriverAvailability(driver.id)}>{availability === 'offline' ? 'Go online' : 'You’re available'}{availability === 'offline' && <ArrowRight size={15} />}</button>
      {completedCount > 0 && <div className="driver-complete-note"><CheckCircle2 size={15} /><span>{completedCount} trip{completedCount === 1 ? '' : 's'} completed today. Thanks for driving safely.</span></div>}
    </section>}
    <div className="driver-safety-note"><ShieldCheck size={14} /><span>Use navigation only when safely parked. Don’t share donor or appointment details.</span></div>
  </div>;
}

function DriverNavigation({ booking, leg, legName, returnTrip, driverName, routeFrom, routeTo, navigationStarted, actionPending, onLocationFix, onPositionUpdate, onBack, onAction }) {
  const status = leg?.status;
  const [clock, setClock] = useState(Date.now());
  const [routeDetails, setRouteDetails] = useState(null);
  const [routeError, setRouteError] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);
  const [gpsMode, setGpsMode] = useState('checking');
  const [gpsError, setGpsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const lastProgressSyncRef = useRef({ at: 0, progress: 0 });
  const toPickup = status === 'driver_assigned' || status === 'driver_on_the_way';
  const target = toPickup ? (returnTrip ? booking.appointment.locationAddress : booking.pickupAddress) : (returnTrip ? booking.pickupAddress : booking.appointment.locationAddress);
  const destinationLabel = toPickup ? (returnTrip ? booking.appointment.locationName : 'Donor pickup') : returnTrip ? 'Donor home' : booking.appointment.locationName;
  const movingToPickup = status === 'driver_on_the_way';
  const waitingAtPickup = status === 'driver_arrived';
  const movingToCentre = status === 'donor_picked_up';
  const movingHome = status === 'donor_on_the_way_home';
  const navigating = movingToPickup || (movingToCentre && navigationStarted) || movingHome;
  const journeyMapState = getJourneyMapState(booking, legName, clock);
  const routePhase = journeyMapState.phase;
  useEffect(() => {
    lastProgressSyncRef.current = { at: 0, progress: 0 };
  }, [routePhase, status]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let live = true;
    setRouteDetails(null);
    setRouteError('');
    getBookingRoute(booking, legName, routePhase).then((route) => {
      if (live) setRouteDetails(route);
    }).catch((error) => {
      if (live) setRouteError(error?.message || 'A verified road route could not be found.');
    });
    return () => { live = false; };
  }, [booking.id, booking.pickupAddress, booking.pickupCoordinates?.lat, booking.pickupCoordinates?.lon, booking.appointment.locationId, booking.appointment.coordinates?.lat, booking.appointment.coordinates?.lon, legName, leg?.driverId, leg?.driverCoordinates?.lat, leg?.driverCoordinates?.lon, routePhase]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsMode('unavailable');
      setGpsError('Location is unavailable. Demo navigation will use the saved route position.');
      return undefined;
    }
    const watchId = navigator.geolocation.watchPosition((position) => {
      const fix = { lat: position.coords.latitude, lon: position.coords.longitude, updatedAt: new Date(position.timestamp || Date.now()).toISOString() };
      setCurrentPosition(fix);
      setGpsMode('live');
      setGpsError('');
      onLocationFix(fix);
      if (navigating && routeDetails?.path) {
        const projection = projectProgressOnRoute(routeDetails.path, fix);
        if (projection && projection.offRouteMeters <= 220) {
          const now = Date.now();
          const last = lastProgressSyncRef.current;
          if (projection.progress - last.progress >= 0.008 || now - last.at >= 8_000) {
            onPositionUpdate(fix, projection.progress);
            lastProgressSyncRef.current = { at: now, progress: projection.progress };
          }
        } else if (projection) {
          setGpsError('You appear to be off the planned road route. Stop safely and check directions.');
        }
      }
    }, (error) => {
      setGpsMode('unavailable');
      setGpsError(error.code === 1
        ? 'Location permission is off. Demo navigation will use the saved route position.'
        : 'An accurate GPS fix is unavailable. Demo navigation will use the saved route position.');
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15_000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [navigating, routeDetails?.path, onLocationFix, onPositionUpdate]);

  const gpsProjection = routeDetails && currentPosition ? projectProgressOnRoute(routeDetails.path, currentPosition) : null;
  const gpsFresh = gpsMode === 'live' && Boolean(currentPosition?.updatedAt)
    && Date.now() - Date.parse(currentPosition.updatedAt) < 15_000;
  const demoNavigation = gpsMode === 'unavailable' || (gpsMode === 'live' && !gpsFresh);
  const routeStart = routeDetails?.from || (routeDetails?.path?.[0]
    ? { lat: routeDetails.path[0][0], lon: routeDetails.path[0][1] }
    : null);
  const actionPosition = gpsFresh ? currentPosition : routeStart ? { ...routeStart, simulated: true } : null;
  /* One source of truth for progress: the shared journey timeline. A fresh, on-road GPS fix
     can only move the car further along the route, never backwards. */
  const progress = navigating && gpsFresh && gpsProjection && gpsProjection.offRouteMeters <= 220
    ? Math.max(journeyMapState.progress, gpsProjection.progress)
    : journeyMapState.progress;
  const remainingMeters = routeDetails ? routeDetails.distance * (1 - progress) : null;
  const nearDestination = demoNavigation
    ? progress >= 0.98
    : remainingMeters !== null && remainingMeters <= 40 && gpsFresh && gpsProjection?.offRouteMeters <= 220;
  const travelledMeters = routeDetails ? routeDetails.distance * progress : 0;
  let covered = 0;
  let routeStepIndex = 0;
  let currentStep = routeDetails?.steps?.[0] || null;
  let distanceToTurn = remainingMeters || 0;
  routeDetails?.steps?.some((step, index) => {
    const end = covered + step.distance;
    if (travelledMeters <= end || index === routeDetails.steps.length - 1) {
      routeStepIndex = index;
      currentStep = step;
      distanceToTurn = Math.max(0, end - travelledMeters);
      return true;
    }
    covered = end;
    return false;
  });
  const formatDistance = (meters) => meters == null ? '—' : meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  const formatEta = (seconds) => !Number.isFinite(seconds) ? '—' : seconds < 60 ? '<1 min' : `${Math.max(1, Math.round(seconds / 60))} min`;
  const directionModifier = currentStep?.modifier || '';
  const direction = directionModifier.includes('right') ? 'TURN RIGHT'
    : directionModifier.includes('left') ? 'TURN LEFT'
      : currentStep?.maneuver === 'arrive' || nearDestination ? 'ARRIVING'
        : 'CONTINUE STRAIGHT';
  const arrivalModifier = routeDetails?.steps?.at(-1)?.modifier || '';
  const arrivalSide = arrivalModifier.includes('right') ? 'right' : arrivalModifier.includes('left') ? 'left' : '';
  let command = currentStep?.instruction || `Follow the route to ${target}`;
  let detail = nearDestination
    ? `In ${Math.max(10, Math.round(remainingMeters / 10) * 10)} m, your destination${arrivalSide ? ` will be on the ${arrivalSide}` : ' is ahead'}.`
    : currentStep?.name || `Continue toward ${target}`;
  if (waitingAtPickup) { command = 'You’ve arrived'; detail = 'Wait for the donor, then confirm pickup when they are in the car.'; }
  else if (movingToCentre && !navigationStarted) { command = 'Pickup confirmed'; detail = `Start navigation to ${booking.appointment.locationName}.`; }
  else if (!routeDetails && routeError) { command = 'Route unavailable'; detail = routeError; }
  else if (!navigating && !waitingAtPickup) { command = 'Route ready'; detail = `Start navigation to ${target}.`; }
  const primaryLabel = movingToPickup ? 'I’ve arrived' : waitingAtPickup ? 'Confirm Pickup'
    : movingToCentre && !navigationStarted ? `Start Navigation to ${booking.appointment.locationName}` : movingToCentre ? 'Arrived at donation site'
      : movingHome ? 'Complete return journey' : 'Start Navigation';
  const action = movingToPickup ? 'arrived' : waitingAtPickup ? 'picked_up'
    : movingToCentre && !navigationStarted ? 'start' : movingToCentre ? 'arrived_site'
      : movingHome ? 'complete' : 'start';
  const subtitle = movingToPickup ? `Picking up ${booking.donorName.split(' ')[0]}`
    : waitingAtPickup ? 'At donor pickup'
      : movingToCentre ? `Taking ${booking.donorName.split(' ')[0]} to ${booking.appointment.locationName}`
        : movingHome ? 'Return trip to donor home' : `Route to ${destinationLabel}`;
  const eta = routeDetails ? formatEta(routeDetails.duration * (1 - progress)) : '—';
  const remainingDistance = routeDetails ? formatDistance(routeDetails.distance * (1 - progress)) : '—';
  const routeStreet = nearDestination ? destinationLabel : currentStep?.name || command;
  const routeChipLabel = routeDetails?.steps?.slice(routeStepIndex + 1).find((step) => step.name && step.name !== currentStep?.name)?.name
    || (nearDestination ? destinationLabel : routeStreet);
  return <div className={`driver-navigation-screen ${navigating ? 'is-guiding' : ''}`}>
    <header className="driver-navigation-top">
      <button type="button" onClick={onBack} aria-label="Back to trip"><ArrowLeft size={19} /></button>
      <span>{navigating ? 'LIVE NAVIGATION' : 'DRIVER NAVIGATION'}</span>
      <span className={`driver-nav-live${gpsFresh ? ' is-live' : demoNavigation ? ' is-simulated' : ' is-route-ready'}`}><i /> {gpsFresh ? 'LIVE' : demoNavigation ? 'SIMULATED' : 'ROUTE READY'}</span>
    </header>
    <div className="driver-navigation-map"><JourneyMap booking={booking} leg={legName} from={routeFrom} to={routeTo} className="driver-navigation-map-canvas" controls liveControl navigationStyle />
      <div className="driver-turn-banner" aria-live="polite">
        <span className="driver-turn-symbol" aria-hidden="true"><svg viewBox="0 0 48 48"><path d={direction === 'TURN RIGHT' ? 'M10 42V19c0-5 4-9 9-9h17M27 2l10 8-10 8' : direction === 'TURN LEFT' ? 'M38 42V19c0-5-4-9-9-9H12M21 2 11 10l10 8' : direction === 'ARRIVING' ? 'M24 42V8M12 20l12-12 12 12' : 'M24 42V8M12 20l12-12 12 12'} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="square" strokeLinejoin="round"/></svg></span>
        <div className="driver-turn-copy"><span>{waitingAtPickup ? 'ARRIVED' : navigating ? (nearDestination ? formatDistance(remainingMeters) : formatDistance(distanceToTurn)) : routeDetails ? formatDistance(routeDetails.distance) : 'Finding road route'}</span><strong>{waitingAtPickup ? 'Pickup' : movingToCentre && !navigationStarted ? 'Pickup confirmed' : routeStreet}</strong></div>
        <span className="driver-turn-route-name">{waitingAtPickup ? 'Confirm when donor is in the car' : currentStep?.instruction || `Navigate to ${target}`}</span>
      </div>
      <span className="driver-navigation-map-chip"><Navigation size={13} /> {routeChipLabel}</span>
    </div>
    <div className={`driver-navigation-bottom${detailsOpen ? ' is-expanded' : ''}`}>
      <button className="driver-nav-sheet-handle" type="button" aria-label={detailsOpen ? 'Close road details' : 'Open road details'} aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}><span /></button>
      <div className="driver-navigation-trip-summary"><span className="driver-nav-settings" aria-hidden="true">≡</span><div className="driver-nav-metrics"><strong>{eta}</strong><i /><strong>{remainingDistance}</strong></div><span className="driver-nav-menu" aria-hidden="true">☷</span></div>
      {detailsOpen && <section className="driver-nav-details-panel" aria-label="Detailed route instructions">
        <div className="driver-nav-details-heading"><strong>Road details</strong><small>{routeDetails?.steps?.length || 0} turns · {formatDistance(routeDetails?.distance)}</small></div>
        <div className="driver-nav-details-endpoints"><span><b>FROM</b>{routeFrom}</span><span><b>TO</b>{target}</span></div>
        {routeDetails?.steps?.length ? <ol className="driver-nav-detail-steps">{routeDetails.steps.map((step, index) => <li key={`${index}-${step.name}`} className={index === routeStepIndex ? 'is-current' : ''}>
          <span>{formatDistance(step.distance)}</span><strong>{step.instruction}</strong>
        </li>)}</ol> : <p className="driver-nav-details-empty">Road instructions will appear when the route is available.</p>}
      </section>}
      {demoNavigation && <span className="driver-demo-navigation-label" role="status">DEMO NAVIGATION — SIMULATED</span>}
      <p className="driver-navigation-subtitle">{subtitle}</p>
      <div className="driver-navigation-address"><MapPin size={15} /><span>{target}</span></div>
      <div className="driver-navigation-command"><strong>{command}</strong><span>{detail}</span></div>
      {navigating && !nearDestination && <p className="driver-nav-safe-note"><ShieldCheck size={14} /> Follow the route. Arrival confirmation appears near your destination.</p>}
      {routeError && !routeDetails && <p className="driver-nav-route-error" role="alert">{routeError}</p>}
      {gpsError && <p className={`driver-nav-route-error${demoNavigation ? ' is-simulated-note' : ''}`} role="status">{gpsError}</p>}
      {gpsMode === 'live' && !gpsFresh && <p className={`driver-nav-route-error${demoNavigation ? ' is-simulated-note' : ''}`} role="status">GPS is stale. Demo navigation is using the saved route position.</p>}
      {actionError && <p className="driver-nav-route-error" role="alert">{actionError}</p>}
      {(!navigating || waitingAtPickup || nearDestination) && <button className="button button-primary button-wide driver-nav-start" type="button" disabled={actionPending || (!routeDetails && !waitingAtPickup)} aria-busy={actionPending} onClick={() => {
        setActionError('');
        if (!onAction(action, actionPosition)) setActionError('This trip could not be updated. Confirm the assignment is still active and try again.');
      }}>{actionPending ? <Navigation size={17} /> : navigating ? <Check size={17} /> : <Navigation size={17} />}{actionPending ? (action === 'start' ? 'Starting navigation…' : 'Updating trip…') : primaryLabel}{!actionPending && <ArrowRight size={15} />}</button>}
      {routeDetails && currentStep && <p className="driver-nav-next-turn">Next: {routeDetails.steps.slice(routeStepIndex + 1, routeStepIndex + 3).map((step) => step.instruction).join(' · ')}</p>}
    </div>
  </div>;
}

const REPORT_PERIODS = [
  { id: 'day', label: 'Day', span: 24 * 60 * 60 * 1000, count: 6 },
  { id: 'week', label: 'Week', span: 7 * 24 * 60 * 60 * 1000, count: 7 },
  { id: 'month', label: 'Month', span: 30 * 24 * 60 * 60 * 1000, count: 4 },
  { id: 'quarter', label: 'Quarter', span: 84 * 24 * 60 * 60 * 1000, count: 12 },
];

function getDriverActivityRows(state, driverId) {
  if (!driverId) return [];
  const rows = [];
  state.bookings.forEach((booking) => {
    const legs = [
      { legName: 'outbound', leg: booking.outbound },
      { legName: 'return', leg: booking.returnLeg },
    ];
    legs.forEach(({ legName, leg }) => {
      if (leg?.driverId !== driverId) return;
      const assignedAt = leg.assignedAt || booking.updatedAt || booking.createdAt;
      const completed = legName === 'return'
        ? leg.status === 'completed'
        : ['arrived_at_site', 'completed'].includes(leg.status);
      rows.push({ booking, legName, leg, assignedAt, completed });
    });
  });
  return rows.sort((a, b) => new Date(a.assignedAt) - new Date(b.assignedAt));
}

function getActivityBuckets(rows, periodId, now = new Date()) {
  const period = REPORT_PERIODS.find((item) => item.id === periodId) || REPORT_PERIODS[1];
  const end = now.getTime();
  const start = end - period.span;
  const bucketSize = period.span / period.count;
  const buckets = Array.from({ length: period.count }, (_, index) => {
    const sample = new Date(start + (index + 0.5) * bucketSize);
    let label;
    if (period.id === 'day') label = new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', hour12: false }).format(sample);
    else if (period.id === 'week') label = new Intl.DateTimeFormat('en-ZA', { weekday: 'short' }).format(sample).slice(0, 1);
    else label = `W${index + 1}`;
    return { label, count: 0 };
  });
  rows.forEach((row) => {
    const at = new Date(row.assignedAt).getTime();
    if (!Number.isFinite(at) || at < start || at > end) return;
    const index = Math.min(period.count - 1, Math.floor((at - start) / bucketSize));
    buckets[index].count += 1;
  });
  return { period, buckets, start, end };
}

function smoothActivityPath(points) {
  if (!points.length) return '';
  const [firstX, firstY] = points[0];
  return points.slice(1).reduce((path, [x, y], index) => {
    const [previousX, previousY] = points[index];
    const controlX = (x - previousX) / 2;
    return `${path} C ${previousX + controlX} ${previousY}, ${x - controlX} ${y}, ${x} ${y}`;
  }, `M ${firstX} ${firstY}`);
}

function DriverActivityChart({ rows, period = 'week', variant = 'bars' }) {
  const { buckets } = getActivityBuckets(rows, period);
  const maximum = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const width = 720;
  const left = 18;
  const right = width - 18;
  const baseline = 94;
  const top = 18;
  const slotWidth = (right - left) / buckets.length;
  const hasActivity = buckets.some((bucket) => bucket.count > 0);
  const labels = buckets.map((bucket, index) => <span key={`${bucket.label}-${index}`}>{bucket.label}</span>);

  if (variant === 'line') {
    const points = buckets.map((bucket, index) => {
      const x = left + slotWidth * (index + 0.5);
      const rise = hasActivity ? Math.max(5, (baseline - top - 7) * bucket.count / maximum) : 2;
      return [x, baseline - rise];
    });
    const line = smoothActivityPath(points);
    const fill = `${line} L ${right} ${baseline + 3} L ${left} ${baseline + 3} Z`;
    return <div className={`driver-activity-chart driver-activity-chart-line ${hasActivity ? 'has-activity' : 'is-empty'}`}>
      <svg viewBox={`0 0 ${width} 112`} preserveAspectRatio="none" role="img" aria-label={hasActivity ? `Trip assignments by period: ${buckets.map((bucket) => `${bucket.label} ${bucket.count}`).join(', ')}` : 'No trip assignments in this period'}>
        <defs><linearGradient id="driver-activity-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FF4D53" stopOpacity=".28" /><stop offset="1" stopColor="#FF4D53" stopOpacity="0" /></linearGradient></defs>
        <line className="driver-chart-gridline" x1={left} y1={baseline} x2={right} y2={baseline} />
        {hasActivity && <path className="driver-chart-fill" d={fill} />}
        <path className={`driver-chart-line${hasActivity ? '' : ' is-empty'}`} d={line} />
        {hasActivity && points.map(([x, y], index) => buckets[index].count > 0 && <circle key={`${buckets[index].label}-${index}`} cx={x} cy={y} r="3.2"><title>{`${buckets[index].label}: ${buckets[index].count} assigned ${buckets[index].count === 1 ? 'trip' : 'trips'}`}</title></circle>)}
      </svg>
      <div className="driver-chart-labels" style={{ '--bucket-count': buckets.length }}>{labels}</div>
      {!hasActivity && <p>No assigned trips in this time period yet.</p>}
    </div>;
  }

  const barWidth = Math.min(42, slotWidth * 0.58);
  const peakIndex = buckets.findIndex((bucket) => bucket.count > 0 && bucket.count === maximum);
  return <div className={`driver-activity-chart driver-activity-chart-bars ${hasActivity ? 'has-activity' : 'is-empty'}`}>
    <svg viewBox={`0 0 ${width} 112`} preserveAspectRatio="none" role="img" aria-label={hasActivity ? 'Trip assignments by period' : 'No trip assignments in this period'}>
      <line className="driver-chart-gridline" x1={left} y1={baseline} x2={right} y2={baseline} />
      {buckets.map((bucket, index) => {
        const height = bucket.count === 0 ? 5 : Math.max(16, (baseline - top) * bucket.count / maximum);
        const x = left + slotWidth * index + (slotWidth - barWidth) / 2;
        const y = baseline - height;
        return <g key={`${bucket.label}-${index}`}>
          <title>{`${bucket.label}: ${bucket.count} assigned ${bucket.count === 1 ? 'trip' : 'trips'}`}</title>
          <rect className={`driver-chart-bar ${bucket.count === 0 ? 'is-empty' : ''} ${index === peakIndex ? 'is-peak' : ''}`} x={x} y={y} width={barWidth} height={height} rx="9" />
        </g>;
      })}
    </svg>
    <div className="driver-chart-labels" style={{ '--bucket-count': buckets.length }}>{labels}</div>
    {!hasActivity && <p>No assigned trips in this time period yet.</p>}
  </div>;
}

function downloadDriverReport(rows, driver) {
  const columns = ['Booking reference', 'Journey leg', 'Appointment date', 'Pickup', 'Destination', 'Trip status', 'Assigned at', 'Completed'];
  const records = rows.map(({ booking, legName, leg, assignedAt, completed }) => [
    booking.reference,
    legName === 'return' ? 'Return' : 'Outbound',
    booking.appointment.date,
    legName === 'return' ? booking.appointment.locationName : booking.pickupAddress,
    legName === 'return' ? booking.pickupAddress : booking.appointment.locationName,
    leg.status,
    assignedAt,
    completed ? 'Yes' : 'No',
  ]);
  const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [columns, ...records].map((row) => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const filename = (driver?.name || 'driver').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  anchor.href = url;
  anchor.download = `sanbs-ride-${filename}-trip-activity.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function DriverReports({ driver, state, actions }) {
  const [periodId, setPeriodId] = useState('week');
  const rows = getDriverActivityRows(state, driver?.id);
  const { period, start, end } = getActivityBuckets(rows, periodId);
  const visibleRows = rows.filter((row) => {
    const at = new Date(row.assignedAt).getTime();
    return Number.isFinite(at) && at >= start && at <= end;
  });
  const completed = visibleRows.filter((row) => row.completed).length;
  const returns = visibleRows.filter((row) => row.legName === 'return').length;
  const active = visibleRows.filter((row) => ACTIVE_STATUSES.includes(row.leg.status)).length;
  const totals = [
    { label: 'Trip legs', value: visibleRows.length, note: 'assigned in period' },
    { label: 'Completed', value: completed, note: 'arrivals recorded' },
    { label: 'Return legs', value: returns, note: 'assigned by operations' },
    { label: 'Active now', value: active, note: 'still in progress', accent: true },
  ];
  return <div className="driver-reports-page">
    <header className="driver-report-heading">
      <div><span className="section-kicker">YOUR TRANSPORT ACTIVITY</span><h1>Reports</h1><p>Only trip activity recorded in this workspace is included.</p></div>
      <button className="driver-report-export" type="button" onClick={() => { downloadDriverReport(visibleRows, driver); actions.showToast('Trip activity downloaded as a CSV file.'); }} aria-label="Download trip activity as CSV"><Download size={17} /></button>
    </header>
    <div className="driver-report-periods" role="group" aria-label="Report time period">
      {REPORT_PERIODS.map((item) => <button key={item.id} type="button" className={periodId === item.id ? 'active' : ''} aria-pressed={periodId === item.id} onClick={() => setPeriodId(item.id)}>{item.label}</button>)}
    </div>
    <section className="driver-report-chart-card">
      <div className="driver-report-chart-head"><div><span>ASSIGNED TRIP LEGS</span><strong>{visibleRows.length}</strong></div><span className="driver-report-range"><CalendarDays size={13} />Last {period.id === 'quarter' ? '12 weeks' : period.id}</span></div>
      <DriverActivityChart rows={visibleRows} period={periodId} variant="line" />
      <div className="driver-report-chart-foot"><span>Transport assignments</span><span>Workspace data</span></div>
    </section>
    <div className="driver-report-metrics">{totals.map((metric) => <article className={`driver-report-metric ${metric.accent ? 'metric-highlight' : ''}`} key={metric.label}><span>{metric.label}</span><div><strong>{String(metric.value).padStart(2, '0')}</strong><small>{metric.note}</small></div></article>)}</div>
    <p className="driver-report-note"><ShieldCheck size={14} /> No ratings, fares or live location data are collected or displayed.</p>
  </div>;
}

function DriverProfile({ driver, state, availability, tasks, onOpenToday, onSupport }) {
  const rows = getDriverActivityRows(state, driver?.id);
  const week = getActivityBuckets(rows, 'week');
  const weekRows = rows.filter((row) => {
    const at = new Date(row.assignedAt).getTime();
    return Number.isFinite(at) && at >= week.start && at <= week.end;
  });
  const completed = rows.filter((row) => row.completed).length;
  const activeTask = tasks[0];
  const tripStats = [
    { label: 'Assigned', value: rows.length },
    { label: 'Completed', value: completed },
    { label: 'Active', value: tasks.length, highlight: true },
  ];
  const statusText = availability === 'on_trip' ? 'On trip' : availability === 'available' ? 'Available' : 'Offline';
  return <div className="driver-profile-page">
    <section className="driver-profile-hero">
      <div className="driver-profile-person">
        <span className={`driver-profile-avatar avatar-${driver?.color || 'blue'}`}><DriverAvatar driver={driver} size="large" /><i className={`availability-dot dot-${availability}`} /></span>
        <div><span className={`driver-profile-status status-${availability}`}>{statusText}</span><h1>{driver?.name}</h1><p>{driver?.vehicle} <i /> {driver?.registration}</p></div>
      </div>
      <div className="driver-profile-stats">{tripStats.map((stat) => <div className={stat.highlight ? 'profile-stat-active' : ''} key={stat.label}><strong>{String(stat.value).padStart(2, '0')}</strong><span>{stat.label}</span></div>)}</div>
    </section>
    <div className="driver-profile-body">
      <section className="driver-profile-week-card">
        <div className="driver-profile-week-head"><span><small>LAST 7 DAYS</small><strong>{weekRows.length} <i>assigned {weekRows.length === 1 ? 'trip' : 'trips'}</i></strong></span><span className="driver-week-status"><i />RECORDED ACTIVITY</span></div>
        <DriverActivityChart rows={weekRows} period="week" variant="line" />
      </section>
      <section className="driver-profile-trip-card">
        <div className="driver-profile-trip-top"><span>CURRENT TRIP</span>{activeTask && <StatusChip booking={activeTask.booking} compact />}</div>
        {activeTask ? <>
          <strong>{activeTask.booking.donorName.split(' ')[0]} · {activeTask.legName === 'return' ? 'Return journey' : 'Donation pickup'}</strong>
          <span className="profile-trip-reference">{activeTask.booking.reference}</span>
          <span className="profile-trip-route"><span>{activeTask.legName === 'return' ? activeTask.booking.appointment.locationName : activeTask.booking.pickupAddress}</span><i /><span>{activeTask.legName === 'return' ? 'Donor home' : activeTask.booking.appointment.locationName}</span></span>
          <button type="button" onClick={onOpenToday}>Open today’s trip <ArrowRight size={14} /></button>
        </> : <><strong>No active trip</strong><span className="profile-trip-empty">An assignment will appear here when transport operations dispatches one.</span></>}
      </section>
      <button type="button" className="driver-profile-support" onClick={onSupport}><span><CircleHelp size={16} /></span><span><strong>Driver support</strong><small>Help with your shift or an assignment</small></span><ChevronRight size={16} /></button>
      <p className="driver-profile-privacy"><ShieldCheck size={13} /> Donor details are limited to the information required for your trip.</p>
    </div>
  </div>;
}

function getPrimaryAction(status, isReturn, needsOfferResponse, needsAcknowledgement) {
  if (status === 'driver_assigned') {
    if (needsOfferResponse) return { kind: 'offer' };
    if (needsAcknowledgement) return { kind: 'single', action: 'acknowledge', label: 'Acknowledge assignment', icon: 'check' };
    return { kind: 'single', action: 'start', label: 'Open navigation', icon: 'navigation' };
  }
  if (status === 'driver_on_the_way') return { kind: 'single', action: 'arrived', label: 'I’ve arrived', icon: 'check' };
  if (status === 'driver_arrived') return { kind: 'single', action: 'picked_up', label: isReturn ? 'Donor picked up · start trip' : 'Donor picked up', icon: 'check' };
  if (status === 'donor_picked_up') return { kind: 'single', action: 'arrived_site', label: 'Arrived at donation site', icon: 'map' };
  if (status === 'donor_on_the_way_home') return { kind: 'single', action: 'complete', label: 'Complete return journey', icon: 'check' };
  return { kind: 'single', action: 'start', label: 'Continue trip', icon: 'navigation' };
}

function driverTripStatus(task) {
  if (task.legName !== 'return') return task.leg.status === 'arrived_at_site' ? 'completed' : task.leg.status;
  const statuses = {
    waiting_authorisation: 'return_waiting_authorisation',
    awaiting_dispatch: 'return_awaiting_dispatch',
    driver_assigned: 'return_driver_assigned',
    driver_on_the_way: 'return_driver_on_the_way',
    driver_arrived: 'return_driver_arrived',
    donor_on_the_way_home: 'donor_on_the_way_home',
    completed: 'completed',
  };
  return statuses[task.leg.status] || task.leg.status;
}

function DriverTrips({ driver, state, tasks, completed, onBack }) {
  const [filter, setFilter] = useState('all');
  const allRows = [
    ...tasks.map((task) => ({ ...task, isComplete: false })),
    ...completed.map((task) => ({ ...task, isComplete: true })),
  ];
  const rows = allRows.filter((row) => {
    if (filter === 'active') return !row.isComplete;
    if (filter === 'completed') return row.isComplete;
    return true;
  });
  return <div className="driver-trips-page">
    <button className="screen-back-link" type="button" onClick={onBack}><ArrowLeft size={16} /> Today</button>
    <div className="driver-trips-title"><span className="section-kicker">YOUR WORK</span><h1>Today’s trips</h1><p>{driver?.name} · {formatDate(localDateString(), { weekday: 'long', day: 'numeric', month: 'long' })}</p></div>
    <div className="trips-filter-circles" role="tablist" aria-label="Filter driver trips">
      {[
        { id: 'all', label: 'All', icon: Truck },
        { id: 'active', label: 'Active', icon: Navigation },
        { id: 'completed', label: 'Done', icon: Check },
      ].map(({ id, label, icon: Icon }) => <button
        key={id}
        type="button"
        role="tab"
        aria-selected={filter === id}
        className={`trips-circle-filter${filter === id ? ' is-active' : ''}`}
        onClick={() => setFilter(id)}
      >
        <span className="trips-circle-disc"><Icon size={17} strokeWidth={2.2} /></span>
        <small>{label}</small>
      </button>)}
    </div>
    {rows.length === 0 ? <EmptyState icon={Truck} title="No trips on your list" description="Assigned journeys will appear here with pickup details and status." compact /> : <div className="driver-trip-list">{rows.map((task, index) => <div className="driver-trip-list-row" key={`${task.booking.id}-${task.legName}-${index}`}>
      <div className="driver-list-time"><span>{task.legName === 'return' ? 'RETURN' : formatTime(task.booking.pickupTime || '08:45')}</span><i className={task.isComplete ? 'trip-list-done' : ''} /></div>
      <div className="driver-list-copy"><div><strong>{task.booking.donorName.split(' ')[0]} · {task.legName === 'return' ? 'Return' : 'Donation ride'}</strong><small>{task.legName === 'return' ? task.booking.appointment.locationName : task.booking.pickupAddress}</small></div><StatusChip status={driverTripStatus(task)} compact /></div>
    </div>)}</div>}
    <div className="driver-trips-footer"><ShieldCheck size={14} /> Only operational information needed for the ride is shown.</div>
  </div>;
}
