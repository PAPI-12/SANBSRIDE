import React, { useEffect, useMemo, useState } from 'react';
import { usePhoneScale } from '../phoneScale';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock3,
  HeartHandshake,
  History,
  Home,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import {
  LOCATIONS,
  distanceBetweenCoordinates,
  formatCoordinates,
  formatDate,
  formatLongDate,
  formatTime,
  getBookingStatus,
  getDriver,
  getJourneyMapState,
  getJourneyState,
  getStatusMeta,
  isBookingActive,
  localDateString,
} from '../domain.js';
import {
  ModalFrame,
  RouteMap,
  StatusChip,
} from '../components/Shared.jsx';
import { ReportIssueModal } from '../components/WorkflowModals.jsx';
import JourneyMap from '../components/JourneyMap.jsx';
import DonationCentrePickerMap from '../components/DonationCentrePickerMap.jsx';
import { searchPickupAddresses } from '../services/geocoding.js';

const DEFAULT_PICKUP = '22 West Street, Sandown, Sandton, Johannesburg';
const DEFAULT_PHONE = '082 555 0142';
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'My journey', icon: Navigation },
  { id: 'trips', label: 'Trips', icon: History },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

export function DonorApp({ state, actions }) {
  usePhoneScale();
  const profile = state.donorProfile || { name: 'Thabo Mokoena', phone: DEFAULT_PHONE, pickupAddress: DEFAULT_PICKUP };
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState('main');
  const [step, setStep] = useState(0);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [helpModal, setHelpModal] = useState(null);
  const [helpOrigin, setHelpOrigin] = useState('main');
  const [reportOpen, setReportOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(() => ({
    donorId: profile.id || 'donor-thabo',
    donorName: profile.name,
    donorPhone: profile.phone,
    locationId: 'sandton-centre',
    appointmentDate: localDateString(),
    appointmentTime: '10:00',
    pickupTime: '08:45',
    pickupAddress: profile.pickupAddress,
    pickupCoordinates: profile.pickupCoordinates || null,
    pickupNotes: '',
    contactNumber: profile.phone,
    returnRequested: true,
    requirements: [],
    notes: '',
  }));

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      donorId: profile.id || 'donor-thabo',
      donorName: profile.name,
      donorPhone: profile.phone,
      contactNumber: profile.phone,
      pickupAddress: profile.pickupAddress,
      pickupCoordinates: profile.pickupCoordinates || null,
    }));
  }, [profile.id, profile.name, profile.phone, profile.pickupAddress, profile.pickupCoordinates]);

  const donorBookings = useMemo(() => state.bookings
    .filter((item) => item.donorId === (profile.id || 'donor-thabo'))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [state.bookings, profile.id]);
  const latestBooking = donorBookings[0] || null;
  const booking = (selectedBookingId && donorBookings.find((item) => item.id === selectedBookingId)) || latestBooking;
  const activeBooking = latestBooking && isBookingActive(latestBooking) ? latestBooking : null;
  const helpBooking = activeBooking || booking;
  const homeDriver = useMemo(() => {
    if (!activeBooking) return null;
    const leg = activeBooking.returnRequested && !['not_required', 'waiting_authorisation'].includes(activeBooking.returnLeg.status)
      ? activeBooking.returnLeg
      : activeBooking.outbound;
    return getDriver(state, leg?.driverId) || null;
  }, [activeBooking, state]);
  const location = LOCATIONS.find((item) => item.id === form.locationId) || LOCATIONS[0];

  const startRequest = () => {
    setForm((previous) => ({ ...previous, appointmentDate: localDateString() }));
    setStep(0);
    setFormError('');
    setScreen('request');
  };

  const updateField = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const nextStep = () => {
    if (!form.appointmentDate || form.appointmentDate < localDateString()) {
      setFormError('Choose an appointment date that is today or later.');
      return;
    }
    if (!form.pickupAddress.trim()) {
      setFormError('Add a pickup address so your driver knows where to meet you.');
      return;
    }
    if (!form.pickupCoordinates || !Number.isFinite(Number(form.pickupCoordinates.lat)) || !Number.isFinite(Number(form.pickupCoordinates.lon))) {
      setFormError('Choose the exact pickup address from the verified address suggestions so your driver is routed to the right place.');
      return;
    }
    setFormError('');
    if (step < 1) {
      setStep(1);
      return;
    }
    const created = actions.createBooking({ ...form, locationId: location.id }, 'donor');
    setSelectedBookingId(created.id);
    setConfirmation(created);
    setScreen('confirmation');
  };

  const closeFlow = () => {
    setScreen('main');
    setStep(0);
    setFormError('');
  };

  const openHelp = () => {
    setHelpOrigin(screen);
    setScreen('help');
  };

  const navigateTab = (nextTab) => {
    setTab(nextTab);
    setScreen('main');
  };

  const openTripJourney = (tripId) => {
    setSelectedBookingId(tripId);
    navigateTab('journey');
  };

  return (
    <div className="mobile-experience-wrap donor-experience">
      <section className="mobile-app-frame donor-frame app-surface">
        {screen === 'request' ? <RequestFlow
          form={form}
          location={location}
          step={step}
          error={formError}
          updateField={updateField}
          onNext={nextStep}
          onBack={() => (step > 0 ? setStep((previous) => previous - 1) : closeFlow())}
          onCancel={closeFlow}
          onHelp={openHelp}
        /> : screen === 'confirmation' ? <ConfirmationScreen
          booking={confirmation}
          onViewJourney={() => { setTab('journey'); setScreen('main'); }}
          onDone={() => { setTab('home'); setScreen('main'); }}
        /> : screen === 'help' ? <HelpScreen
          booking={helpBooking}
          donorName={profile.name}
          actions={actions}
          onBack={() => setScreen(helpOrigin)}
          onReport={() => setReportOpen(true)}
          onChangePickup={() => setHelpModal('pickup')}
        /> : <>
          <nav className="app-rail" aria-label="Donor navigation">
            <span className="app-rail-label">Donor</span>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => <button
              type="button"
              key={id}
              className={tab === id ? 'app-rail-item active' : 'app-rail-item'}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => navigateTab(id)}
            >
              <Icon size={18} strokeWidth={tab === id ? 2.2 : 1.8} />
              <span>{label}</span>
            </button>)}
          </nav>
          <div className="mobile-app-scroll donor-main-scroll">
            {tab === 'home' && <DonorHome
              booking={activeBooking}
              lastBooking={latestBooking}
              totalTrips={donorBookings.length}
              donorName={profile.name}
              pickupAddress={profile.pickupAddress}
              driver={homeDriver}
              onRequest={startRequest}
              onJourney={() => navigateTab('journey')}
              onTrips={() => navigateTab('trips')}
              onProfile={() => navigateTab('profile')}
              onHelp={openHelp}
            />}
            {tab === 'trips' && <DonorTrips
              bookings={donorBookings}
              onOpenTrip={openTripJourney}
              onRequest={startRequest}
            />}
            {tab === 'profile' && <DonorProfile
              name={profile.name}
              phone={profile.phone}
              pickupAddress={profile.pickupAddress}
              totalTrips={donorBookings.length}
              activeBooking={activeBooking}
              onHelp={openHelp}
              onEdit={() => setProfileEditOpen(true)}
              onRequest={startRequest}
            />}
          </div>
          {tab === 'journey' && <DonorJourney
            booking={booking}
            state={state}
            onRequest={startRequest}
            onHelp={openHelp}
            onBack={() => navigateTab('home')}
            onViewTrips={() => navigateTab('trips')}
          />}
          {tab !== 'journey' && <nav className="mobile-bottom-nav donor-circular-dock" aria-label="Donor app navigation">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => <button
              type="button"
              key={id}
              className={`dock-circle-btn${tab === id ? ' active' : ''}`}
              aria-label={label}
              aria-current={tab === id ? 'page' : undefined}
              title={label}
              onClick={() => navigateTab(id)}
            >
              <Icon size={20} strokeWidth={tab === id ? 2.3 : 1.9} />
            </button>)}
          </nav>}
        </>}
      </section>
      {reportOpen && <ReportIssueModal
        title="Report a journey issue"
        subtitle="Your message goes to SANBS transport support, not your driver alone."
        categories={['Driver unable to find me', 'Missed pickup', 'Pickup location needs changing', 'Driver delay', 'Other transport issue']}
        leg={helpBooking?.returnRequested && !['not_required', 'waiting_authorisation'].includes(helpBooking.returnLeg.status) ? 'return' : 'outbound'}
        onClose={() => setReportOpen(false)}
        onSubmit={(payload) => {
          if (helpBooking) actions.reportException(helpBooking.id, payload, 'donor', profile.name);
          else actions.showToast('Support request noted · there is no journey to attach it to yet.');
          setReportOpen(false);
        }}
      />}
      {helpModal === 'pickup' && <ChangePickupModal
        booking={activeBooking}
        onClose={() => setHelpModal(null)}
        savedAddress={profile.pickupAddress}
        savedCoordinates={profile.pickupCoordinates}
        onSave={(address, coordinates) => {
          if (activeBooking) actions.updatePickup(activeBooking.id, { address, coordinates });
          else {
            updateField('pickupAddress', address);
            updateField('pickupCoordinates', coordinates);
            actions.updateDonorProfile({ pickupAddress: address, pickupCoordinates: coordinates });
          }
          setHelpModal(null);
        }}
      />}
      {profileEditOpen && <EditDonorProfileModal
        name={form.donorName}
        phone={form.donorPhone}
        onClose={() => setProfileEditOpen(false)}
        onSave={({ name, phone }) => {
          setForm((previous) => ({ ...previous, donorName: name, donorPhone: phone, contactNumber: phone }));
          actions.updateDonorProfile({ name, phone });
          setProfileEditOpen(false);
          actions.showToast('Contact details saved for your next transport request');
        }}
      />}
    </div>
  );
}

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good\nmorning,';
  if (hour < 18) return 'Good\nafternoon,';
  return 'Good\nevening,';
}

function DonorHome({
  booking,
  lastBooking,
  totalTrips,
  donorName,
  pickupAddress,
  onRequest,
  onJourney,
  onTrips,
  onProfile,
  onHelp,
  driver,
}) {
  const firstName = donorName.split(' ')[0] || 'Donor';
  const appointment = booking?.appointment || lastBooking?.appointment || {
    locationName: 'SANBS Sandton Donor Centre',
    locationAddress: 'Rivonia Road, Sandton, Johannesburg',
    locationKind: 'Permanent donation centre',
    date: localDateString(),
    time: '10:00',
  };
  const statusMeta = booking ? getStatusMeta(booking) : null;
  const returnActive = Boolean(booking?.returnRequested && !['not_required', 'waiting_authorisation'].includes(booking.returnLeg.status));
  const activeMapState = booking ? getJourneyMapState(booking, returnActive ? 'return' : 'outbound') : null;
  const gaugeFill = activeMapState ? Math.max(0, Math.min(1, activeMapState.fillProgress)) : 0;
  const [, setDropClock] = useState(0);
  useEffect(() => {
    if (!activeMapState?.moving) return undefined;
    const timer = window.setInterval(() => setDropClock(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [activeMapState?.moving]);

  /* ---- pre-booking state: matches Home reference 00.03.36 ---- */
  if (!booking) {
    return <div className="donor-home-page">
      <header className="donor-greeting-row">
        <div className="donor-greeting-copy">
          <h1>{timeGreeting()}<br /><span>{firstName}</span></h1>
        </div>
        <button className="donor-profile-initials" type="button" onClick={onProfile} aria-label={`${donorName} profile`}>
          {initialsOf(donorName)}
        </button>
      </header>

      <section className="donor-stealth-map-card" aria-label="Upcoming pickup route preview">
        <RouteMap
          from={pickupAddress || DEFAULT_PICKUP}
          to={appointment.locationName}
          progress={0.22}
          dark
          hideChrome
          actionLabel="Confirm"
          onAction={onRequest}
        />
      </section>

      <button className="donor-cta-banner" type="button" onClick={onRequest}>
        <span className="donor-cta-copy">
          <strong>Book a ride</strong>
          <small>{shortPlace(appointment.locationName)} · {formatTime(appointment.time)}</small>
        </span>
        <span className="donor-cta-disc" aria-hidden="true"><ArrowRight size={18} /></span>
      </button>

      <div className="donor-bento-stats" aria-label="Donor summary">
        <button type="button" className="donor-stat-tile is-light" onClick={onTrips}>
          <span className="stat-kicker">DONOR TRIPS</span>
          <strong className="stat-figure">{totalTrips}</strong>
          <small>View ride history</small>
        </button>
        <button type="button" className="donor-stat-tile is-dark" onClick={onRequest}>
          <span className="stat-kicker">NEXT SLOT</span>
          <strong className="stat-figure is-accent">{formatTime(appointment.time)}</strong>
          <small>Free donor return</small>
        </button>
      </div>

      <div className="donor-home-shortcuts" aria-label="Quick actions">
        <button type="button" onClick={onTrips}>
          <span className="shortcut-icon"><History size={17} /></span>
          <span><strong>My Trips</strong><small>{totalTrips ? `${totalTrips} logged in account` : 'Receipt log & past journeys'}</small></span>
          <ChevronRight size={16} />
        </button>
        <button type="button" onClick={onHelp}>
          <span className="shortcut-icon"><CircleHelp size={17} /></span>
          <span><strong>Transport support</strong><small>Pickup updates & dispatch help</small></span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>;
  }

  /* ---- active ride state: carbon telemetry hero card ---- */
  const liveReadout = gaugeReadout(booking, returnActive);
  const progressPct = Math.round(gaugeFill * 100);
  return <div className="donor-home-page">
    <header className="donor-greeting-row">
      <div className="donor-greeting-copy">
        <span className="eyebrow">{booking.reference} · {returnActive ? 'RETURN' : 'OUTBOUND'}</span>
        <h1>{statusMeta.label}</h1>
      </div>
      <button className="donor-profile-initials" type="button" onClick={onProfile} aria-label={`${donorName} profile`}>
        {initialsOf(donorName)}
      </button>
    </header>

    <section className="donor-telemetry-hero" aria-label="Live ride telemetry">
      <div className="telemetry-hero-head">
        <StatusChip booking={booking} compact />
        <span className="telemetry-leg-tag">{returnActive ? 'Homebound' : 'To SANBS'}</span>
      </div>

      <div className="telemetry-route-stack">
        <div className="telemetry-stop">
          <span className="telemetry-dot is-origin" aria-hidden="true" />
          <div><small>PICKUP</small><strong>{returnActive ? appointment.locationName : (booking.pickupAddress || DEFAULT_PICKUP)}</strong></div>
        </div>
        <div className="telemetry-stop">
          <span className="telemetry-dot is-dest" aria-hidden="true" />
          <div><small>DESTINATION</small><strong>{returnActive ? booking.pickupAddress : appointment.locationName}</strong></div>
        </div>
      </div>

      <div className="telemetry-metrics-grid">
        <div>
          <span>ETA</span>
          <strong className="is-accent">{liveReadout.big}{/^\d+$/.test(String(liveReadout.big)) ? 'm' : ''}</strong>
        </div>
        <div>
          <span>PROGRESS</span>
          <strong>{progressPct}%</strong>
        </div>
        <div>
          <span>APPOINTMENT</span>
          <strong>{formatTime(appointment.time)}</strong>
        </div>
      </div>

      <div className="telemetry-bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${Math.max(progressPct, 6)}%` }} />
      </div>

      {driver && <div className="telemetry-driver-pill">
        <span className="telemetry-driver-avatar">{driver.initials}</span>
        <div><strong>{driver.name}</strong><small>{driver.vehicle} · {driver.registration}</small></div>
        <span className="telemetry-live-badge">Live</span>
      </div>}

      <button className="donor-cta-banner is-compact" type="button" onClick={onJourney}>
        <span className="donor-cta-copy">
          <strong>Track live ride</strong>
          <small>{liveReadout.caption}</small>
        </span>
        <span className="donor-cta-disc" aria-hidden="true"><ArrowRight size={18} /></span>
      </button>
    </section>

    <div className="donor-bento-stats" aria-label="Journey metrics">
      <button type="button" className="donor-stat-tile is-light" onClick={onTrips}>
        <span className="stat-kicker">TRIPS</span>
        <strong className="stat-figure">{totalTrips}</strong>
        <small>View receipts</small>
      </button>
      <button type="button" className="donor-stat-tile is-dark" onClick={onHelp}>
        <span className="stat-kicker">SUPPORT</span>
        <strong className="stat-figure is-accent">24/7</strong>
        <small>SANBS Ops link</small>
      </button>
    </div>
  </div>;
}

/* ==========================================================================
   My Trips Screen — matches 00.26.35 receipt list + 4 circular status filters
   ========================================================================== */
function DonorTrips({ bookings, onOpenTrip, onRequest }) {
  const [filter, setFilter] = useState('all');
  const filters = [
    { id: 'all', label: 'All', icon: History },
    { id: 'active', label: 'Active', icon: Navigation },
    { id: 'completed', label: 'Done', icon: Check },
    { id: 'cancelled', label: 'Cancelled', icon: X },
  ];

  const filtered = useMemo(() => bookings.filter((item) => {
    const status = getBookingStatus(item);
    if (filter === 'active') return isBookingActive(item);
    if (filter === 'completed') return status === 'completed';
    if (filter === 'cancelled') return status === 'cancelled';
    return true;
  }), [bookings, filter]);

  return <div className="donor-trips-page">
    <header className="donor-trips-header">
      <div>
        <span className="eyebrow">HISTORY</span>
        <h1>My Trips</h1>
      </div>
      <span className="trips-count-pill">{bookings.length} {bookings.length === 1 ? 'ride' : 'rides'}</span>
    </header>

    <div className="trips-filter-circles" role="tablist" aria-label="Filter trips">
      {filters.map(({ id, label, icon: Icon }) => <button
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

    {filtered.length ? <div className="trips-receipt-list">
      {filtered.map((item) => {
        const returnActive = Boolean(item.returnRequested && !['not_required', 'waiting_authorisation'].includes(item.returnLeg?.status));
        const fromLabel = shortPlace(item.pickupAddress);
        const toLabel = shortPlace(item.appointment?.locationName);
        return <button key={item.id} type="button" className="trip-receipt-card" onClick={() => onOpenTrip(item.id)}>
          <div className="trip-receipt-top">
            <span>{item.returnRequested ? 'ROUND TRIP' : 'ONE-WAY'} · {item.reference}</span>
            <StatusChip booking={item} compact />
          </div>
          <strong className="trip-receipt-route">{fromLabel} → {toLabel}</strong>
          <div className="trip-receipt-bottom">
            <span>{formatDate(item.appointment?.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {formatTime(item.appointment?.time)}</span>
            <b>{returnActive ? 'Return leg' : 'Free · SANBS'}</b>
          </div>
        </button>;
      })}
    </div> : <div className="trips-empty-card">
      <span className="trips-empty-icon"><CarFront size={20} /></span>
      <strong>No {filter === 'all' ? '' : `${filter} `}trips found</strong>
      <p>Your SANBS donor transport receipts and active rides appear here.</p>
      <button type="button" className="button button-primary" onClick={onRequest}>Book a ride <ArrowRight size={15} /></button>
    </div>}
  </div>;
}

function shortPlace(value = '') {
  const clean = String(value).trim();
  const firstPart = clean.split(',')[0].trim();
  return firstPart.replace(/^SANBS\s+/i, '').replace(/\s+Donor Centre$/i, '') || clean;
}

function initialsOf(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

const READOUT_BY_LEG = {
  driver_assigned: { big: '6', caption: 'min away' },
  driver_on_the_way: { big: '8', caption: 'min away' },
  driver_arrived: { big: 'Now', caption: 'at your door' },
  donor_picked_up: { big: 'En route', caption: 'to the centre' },
  arrived_at_site: { big: 'Here', caption: 'at the centre' },
  donor_on_the_way_home: { big: 'En route', caption: 'homeward' },
  completed: { big: 'Done', caption: 'journey complete' },
  waiting_authorisation: { big: 'Next', caption: 'return authorised' },
  not_required: { big: '—', caption: 'one-way ride' },
};

function gaugeReadout(booking, returnActive) {
  const leg = returnActive ? booking.returnLeg : booking.outbound;
  const minutes = leg?.etaMinutes ?? leg?.eta ?? null;
  if (minutes) return { big: String(minutes), caption: 'min away' };
  return READOUT_BY_LEG[leg?.status] || { big: '—', caption: 'in progress' };
}

function donorStatusMessage(booking, returnActive = false) {
  const status = getBookingStatus(booking);
  const activeLeg = returnActive ? booking.returnLeg : booking.outbound;
  if (status === 'awaiting_assignment') return 'We’ve received your request. We’ll let you know when a driver is assigned.';
  if (status === 'driver_assigned') {
    if (activeLeg?.accepted) return 'Your driver accepted the ride and is heading to your pickup.';
    if (activeLeg?.acknowledged) return 'Your driver acknowledged the assignment and is preparing for pickup.';
    return 'A driver is assigned. We’ll update you when they confirm.';
  }
  if (status === 'driver_on_the_way') return 'Your driver is heading to your pickup address.';
  if (status === 'driver_arrived') return 'Your driver is waiting at your pickup location.';
  if (status === 'donor_picked_up') return 'You’re on your way to the donation centre.';
  if (status === 'awaiting_return_authorisation') return 'You’ve arrived at SANBS. Your return will be arranged once the team confirms you’re ready.';
  if (status === 'return_awaiting_dispatch') return 'SANBS has confirmed you’re ready. We’re arranging your return driver.';
  if (status === 'return_driver_assigned') {
    if (activeLeg?.accepted) return 'Your return driver accepted the ride and is preparing to head to the centre.';
    if (activeLeg?.acknowledged) return 'Your return driver acknowledged the assignment.';
    return 'A return driver is assigned. We’ll update you when they confirm.';
  }
  if (status.startsWith('return_driver')) return 'Your return driver details and progress are shown below.';
  if (status === 'donor_on_the_way_home') return 'You’re on your way home. Your driver will confirm when you arrive.';
  if (status === 'completed') return 'Your transport journey is complete. Thank you for donating.';
  return 'Your booking is being coordinated with SANBS transport.';
}

function JourneyStops({ booking, leg = 'outbound' }) {
  const journey = getJourneyState(booking, leg);
  return <ol className="journey-stops" aria-label="Trip stops">
    {journey.stages.map((stage, i) => {
      const done = journey.done ? i <= journey.index : i < journey.index;
      const current = !journey.done && i === journey.index;
      const state = done ? 'is-done' : current ? 'is-current' : 'is-next';
      return <li key={stage.key} className={`journey-stop ${state}`} aria-current={current ? 'step' : undefined}>
        <span className="journey-stop-icon">{done ? <Check size={14} strokeWidth={3} /> : <MapPin size={14} />}</span>
        <span className="journey-stop-copy"><strong>{stage.title}</strong><small>{done ? 'Done' : current ? 'Happening now' : 'Next'}</small></span>
        <span className="journey-stop-count">{i + 1}/{journey.stages.length}</span>
        <span className="journey-stop-go" aria-hidden="true"><ChevronRight size={15} /></span>
      </li>;
    })}
  </ol>;
}

/* ==========================================================================
   My Journey Screen — Two-layer drawer + Stealth Map + Completed Arrival card
   ========================================================================== */
function DonorJourney({ booking, state, onRequest, onHelp, onBack, onViewTrips }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState(null);
  const [focusToken, setFocusToken] = useState(0);

  if (!booking) return <div className="donor-empty-journey">
    <span className="donor-empty-glyph" aria-hidden="true"><Navigation size={24} /></span>
    <span className="section-kicker">MY JOURNEY</span>
    <h1>No ride booked yet</h1>
    <p>Your live route, driver telemetry, and trip progress appear here once a ride is requested.</p>
    <button className="button button-primary button-wide" type="button" onClick={onRequest}>Book a ride <ArrowRight size={15} /></button>
    <button className="text-button help-text-button" type="button" onClick={onHelp}>Need help? Contact support</button>
  </div>;

  const status = getBookingStatus(booking);

  /* Completed arrival view — matches 00.26.20 ("You arrived!") */
  if (status === 'completed') {
    return <div className="donor-arrived-screen">
      <header className="arrived-dark-header">
        <button className="arrived-back-btn" type="button" onClick={onBack} aria-label="Back to home"><ArrowLeft size={18} /></button>
        <div>
          <span className="eyebrow">TRIP COMPLETE · {booking.reference}</span>
          <h1>You arrived!</h1>
          <p>Thank you for donating with SANBS.</p>
        </div>
      </header>
      <div className="arrived-body">
        <div className="arrived-dark-metrics">
          <div><span>STATUS</span><strong className="is-accent">Done</strong></div>
          <div><span>RETURN</span><strong>{booking.returnRequested ? 'Included' : 'One-way'}</strong></div>
          <div><span>FARE</span><strong>Free</strong></div>
        </div>
        <div className="arrived-route-card">
          <div className="arrived-route-point"><span className="dot is-origin" /><div><small>PICKUP</small><strong>{booking.pickupAddress}</strong></div></div>
          <div className="arrived-route-point"><span className="dot is-dest" /><div><small>DONATION SITE</small><strong>{booking.appointment.locationName}</strong></div></div>
        </div>
        <div className="arrived-pill-actions">
          <button type="button" className="button button-quiet" onClick={onViewTrips}>View receipt</button>
          <button type="button" className="button button-quiet" onClick={onHelp}>Trip support</button>
        </div>
        <button type="button" className="button button-primary button-wide" onClick={onBack}>Done <Check size={16} /></button>
      </div>
    </div>;
  }

  const returnActive = booking.returnRequested && !['not_required', 'waiting_authorisation'].includes(booking.returnLeg.status);
  const driverId = returnActive ? booking.returnLeg.driverId : booking.outbound.driverId;
  const driver = getDriver(state, driverId) || null;
  const legName = returnActive ? 'return' : 'outbound';
  const journey = getJourneyState(booking, legName);
  const mapJourney = getJourneyMapState(booking, legName);
  const percent = journey.done ? 100 : Math.round(mapJourney.phase === 'to_pickup'
    ? mapJourney.progress * 35
    : 35 + mapJourney.progress * 65);
  const liveReadout = gaugeReadout(booking, returnActive);

  const onPageTouchStart = (event) => setTouchStartY(event.touches[0].clientY);
  const onPageTouchEnd = (event) => {
    if (touchStartY === null) return;
    const delta = touchStartY - event.changedTouches[0].clientY;
    if (delta > 36) setSheetOpen(true);
    setTouchStartY(null);
  };
  const onHandleTouchEnd = (event) => {
    if (touchStartY === null) return;
    const delta = touchStartY - event.changedTouches[0].clientY;
    if (delta < -36) setSheetOpen(false);
    else if (delta > 36) setSheetOpen(true);
    setTouchStartY(null);
  };

  const routeFrom = mapJourney.phase === 'to_pickup'
    ? (driver?.currentCoordinates?.label || formatCoordinates(driver?.currentCoordinates) || 'Driver position unavailable')
    : (returnActive ? booking.appointment.locationName : booking.pickupAddress);
  const routeTo = mapJourney.phase === 'to_pickup'
    ? (returnActive ? booking.appointment.locationAddress : booking.pickupAddress)
    : (returnActive ? booking.pickupAddress : booking.appointment.locationAddress);

  return <div className={`donor-journey-page${sheetOpen ? ' is-sheet-open' : ''}`} onTouchStart={onPageTouchStart} onTouchEnd={onPageTouchEnd}>
    <button className="journey-back" type="button" onClick={onBack} aria-label="Back to home"><ArrowLeft size={19} /></button>
    <div className="journey-map-wrap">
      <JourneyMap booking={booking} leg={legName} focusToken={focusToken} from={routeFrom} to={routeTo} controls />
      <span className="journey-route-chip"><MapPin size={12} /> {shortPlace(routeFrom)} → {shortPlace(routeTo)}</span>
    </div>
    <button className="journey-locate" type="button" onClick={() => setFocusToken((count) => count + 1)} aria-label="Show my car's live location"><LocateFixed size={20} /><span>Live</span></button>
    <div className={`journey-sheet${sheetOpen ? ' is-open' : ''}`} onTouchEnd={onHandleTouchEnd}>
      <button
        className="journey-sheet-tab"
        type="button"
        aria-expanded={sheetOpen}
        aria-label={sheetOpen ? 'Minimize trip details' : 'Open trip details'}
        onClick={() => setSheetOpen((open) => !open)}
      >
        <span className="sheet-grab-bar" aria-hidden="true" />
        <span className="journey-sheet-tab-label">{sheetOpen ? 'Hide details' : 'Trip details'}</span>
        {sheetOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Two-layer summary card always visible in the drawer */}
      <div className="journey-sheet-body">
        <div className="journey-two-layer-card">
          <div className="layer-soft-top">
            <div className="layer-status-row">
              <div>
                <span className="section-kicker">{booking.reference} · {returnActive ? 'RETURN' : 'OUTBOUND'}</span>
                <h2>{getStatusMeta(booking).label}</h2>
              </div>
              <StatusChip booking={booking} compact />
            </div>
            <p className="layer-subtitle">{donorStatusMessage(booking, returnActive)}</p>
            <div className="layer-route-connector">
              <div className="layer-point"><span className="dot is-origin" /><strong>{shortPlace(returnActive ? booking.appointment.locationName : booking.pickupAddress)}</strong></div>
              <div className="layer-point"><span className="dot is-dest" /><strong>{shortPlace(returnActive ? booking.pickupAddress : booking.appointment.locationName)}</strong></div>
            </div>
          </div>

          <div className="layer-dark-pill">
            <div className="layer-dark-metrics">
              <div><span>ETA</span><strong className="is-accent">{liveReadout.big}{/^\d+$/.test(String(liveReadout.big)) ? 'm' : ''}</strong></div>
              <div><span>PROGRESS</span><strong>{percent}%</strong></div>
              <div><span>STEP</span><strong>{journey.index + 1}/{journey.stages.length}</strong></div>
            </div>
            <div className="layer-dark-bar"><span style={{ width: `${Math.max(percent, 6)}%` }} /></div>
            {driver && <div className="layer-vehicle-row">
              <div className="layer-vehicle-copy">
                <strong>{driver.firstName} · {driver.vehicle}</strong>
                <small>{driver.registration}</small>
              </div>
              <button type="button" className="layer-live-pill" onClick={() => setFocusToken((count) => count + 1)}>
                <LocateFixed size={13} /> Live Track
              </button>
            </div>}
          </div>
        </div>

        <section className="donor-progress-section">
          <div className="journey-block-title"><h3>{returnActive ? 'Return stops' : 'Trip stops'}</h3><span>{journey.index + 1}/{journey.stages.length}</span></div>
          <JourneyStops booking={booking} leg={legName} />
        </section>

        <section className="journey-detail-block">
          <div className="journey-block-title"><h3>Trip details</h3><span>{formatTime(returnActive ? booking.appointment.time : booking.pickupTime || '08:45')}</span></div>
          <dl className="journey-facts">
            <div><dt>Journey</dt><dd>{returnActive ? 'Return to home' : 'To your appointment'}</dd></div>
            <div><dt>{returnActive ? 'Pickup' : 'Pickup address'}</dt><dd>{returnActive ? booking.appointment.locationName : booking.pickupAddress}</dd></div>
            <div><dt>{returnActive ? 'Destination' : 'Donation site'}</dt><dd>{returnActive ? booking.pickupAddress : booking.appointment.locationName}</dd></div>
            {!returnActive && <div><dt>Appointment</dt><dd>{formatDate(booking.appointment.date)} · {formatTime(booking.appointment.time)}</dd></div>}
          </dl>
          {!returnActive && booking.pickupNotes && <p className="journey-note">{booking.pickupNotes}</p>}
        </section>

        {booking.returnRequested && (!returnActive || booking.returnLeg.status === 'awaiting_dispatch') && <div className={`return-message ${booking.returnLeg.status === 'awaiting_dispatch' ? 'return-message-ready' : ''}`}>
          <ShieldCheck size={16} /><div><strong>{booking.returnLeg.status === 'awaiting_dispatch' ? 'Return authorised' : 'Return transport is not automatic'}</strong><p>{booking.returnLeg.status === 'awaiting_dispatch' ? 'SANBS has confirmed you are ready. A return driver will be arranged shortly.' : 'Your return journey will be arranged once the SANBS team confirms you’re ready.'}</p></div>
        </div>}

        {!driver && booking.returnLeg.status === 'awaiting_dispatch' && <section className="donor-driver-card">
          <span className="section-kicker">RETURN JOURNEY</span>
          <div className="donor-driver-wait"><Clock3 size={15} /><span>Waiting for operations to assign a return driver.</span></div>
        </section>}

        <button className="donor-help-row" type="button" onClick={onHelp}><CircleHelp size={16} /><span>Need help with your ride?</span><ChevronRight size={16} /></button>
      </div>
    </div>
  </div>;
}

/* ==========================================================================
   Booking Sheet ("Where to?") — matches 00.03.42 & 00.24.44
   ========================================================================== */
function RequestFlow({ form, location, step, error, updateField, onNext, onBack, onCancel, onHelp }) {
  const steps = ['Where to?', 'Confirm ride'];
  return <div className="request-flow-screen">
    <div className="request-flow-map-header">
      {step === 0
        ? <DonationCentrePickerMap locations={LOCATIONS} selectedLocationId={form.locationId} onSelect={(locationId) => updateField('locationId', locationId)} />
        : <RouteMap from={form.pickupAddress} to={location.name} progress={0.14} dark hideChrome />}
      <button className="flow-floating-back" type="button" aria-label="Go back" onClick={onBack}><ArrowLeft size={19} /></button>
      <button className="flow-floating-close" type="button" onClick={onCancel} aria-label="Cancel booking"><X size={18} /></button>
    </div>

    <div className="request-sheet-surface">
      <div className="sheet-grab-bar" aria-hidden="true" />
      <div className="request-sheet-head">
        <span className="section-kicker">{step === 0 ? 'BOOK A RIDE · STEP 1 OF 2' : 'CONFIRM · STEP 2 OF 2'}</span>
        <h1>{steps[step]}</h1>
      </div>

      <div className="request-flow-content">
        {step === 0 && <RideStep form={form} location={location} updateField={updateField} />}
        {step === 1 && <ConfirmStep form={form} location={location} />}
        {error && <div className="form-error"><X size={14} />{error}</div>}
      </div>

      <footer className="request-flow-footer">
        <div className="request-footer-cta-row">
          <button className="button button-primary button-wide" type="button" onClick={onNext}>
            {step === 1 ? 'Request ride' : 'Continue'} <ArrowRight size={17} />
          </button>
          <button className="button-circle-outline" type="button" onClick={onHelp} aria-label="Transport help" title="Transport help">
            <CircleHelp size={18} />
          </button>
        </div>
        <span className="secure-line"><ShieldCheck size={13} /> Free for SANBS donors · no payment</span>
      </footer>
    </div>
  </div>;
}

function PickupAddressField({ form, updateField }) {
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  useEffect(() => {
    const query = form.pickupAddress.trim();
    if (form.pickupCoordinates?.label === query || query.length < 4) {
      setSuggestions([]);
      setSearching(false);
      setSearchError('');
      return undefined;
    }
    const controller = new AbortController();
    setSuggestions([]);
    setSearching(true);
    setSearchError('');
    const timer = window.setTimeout(async () => {
      try {
        const found = await searchPickupAddresses(query, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setSuggestions(found);
          setSearching(false);
          if (!found.length) setSearchError('No matching pickup address found. Add a nearby street or suburb and search again.');
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setSearching(false);
          setSearchError('Address search is temporarily unavailable. Please retry before requesting a ride.');
        }
      }
    }, 900);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [form.pickupAddress, form.pickupCoordinates]);

  const selectSuggestion = (place) => {
    updateField('pickupAddress', place.label);
    updateField('pickupCoordinates', { lat: place.lat, lon: place.lon, label: place.label, placeId: place.id });
    setSuggestions([]);
    setSearchError('');
  };
  const verified = form.pickupCoordinates?.label === form.pickupAddress;
  return <div className="field pickup-address-field">
    <label className="field-label" htmlFor="verified-pickup-address">Pickup address</label>
    <input
      id="verified-pickup-address"
      className="text-input"
      type="text"
      autoComplete="street-address"
      aria-autocomplete="list"
      aria-expanded={suggestions.length > 0}
      aria-controls="pickup-address-suggestions"
      value={form.pickupAddress}
      onChange={(event) => {
        const nextAddress = event.target.value;
        updateField('pickupAddress', nextAddress);
        if (nextAddress !== form.pickupCoordinates?.label) updateField('pickupCoordinates', null);
      }}
      placeholder="Start typing your street address"
    />
    {searching && <small className="pickup-address-status">Searching Gauteng addresses…</small>}
    {verified && <small className="pickup-address-verified"><CheckCircle2 size={13} /> Exact pickup point verified on the map</small>}
    {searchError && !verified && <small className="pickup-address-status is-error">{searchError}</small>}
    {suggestions.length > 0 && <div className="pickup-address-suggestions" id="pickup-address-suggestions" role="listbox" aria-label="Verified pickup locations">
      {suggestions.map((place) => <button key={place.id} type="button" role="option" aria-selected="false" onClick={() => selectSuggestion(place)}>
        <MapPin size={15} /><span>{place.label}</span><small>Select</small>
      </button>)}
    </div>}
    <small className="pickup-address-hint">Choose a verified result so navigation targets this exact location.</small>
  </div>;
}

function RideStep({ form, location, updateField }) {
  const [centrePickerOpen, setCentrePickerOpen] = useState(false);
  const [centreSearch, setCentreSearch] = useState('');
  const filteredCentres = LOCATIONS.filter((centre) => `${centre.name} ${centre.address} ${centre.area}`
    .toLowerCase().includes(centreSearch.trim().toLowerCase()));
  const closestCentre = form.pickupCoordinates
    ? LOCATIONS.map((centre) => ({
      centre,
      distance: distanceBetweenCoordinates(form.pickupCoordinates, centre.coordinates),
    })).sort((a, b) => a.distance - b.distance)[0]
    : null;

  return <div className="flow-step-content">
    <div className="quick-centre-chips" role="group" aria-label="Quick select SANBS centre">
      {LOCATIONS.slice(0, 3).map((centre) => <button
        key={centre.id}
        type="button"
        className={`quick-centre-chip${form.locationId === centre.id ? ' is-selected' : ''}`}
        onClick={() => updateField('locationId', centre.id)}
      >
        {shortPlace(centre.name)}
      </button>)}
    </div>

    <div className="donor-centre-dropdown">
      <button
        className="donor-centre-dropdown-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={centrePickerOpen}
        aria-controls="donor-centre-options"
        onClick={() => {
          setCentrePickerOpen((open) => !open);
          setCentreSearch('');
        }}
      >
        <span className="donor-centre-option-pin" aria-hidden="true"><MapPin size={16} /></span>
        <span><small>Donation centre ({LOCATIONS.length} Gauteng locations)</small><strong>{location.shortName}</strong></span>
        <ChevronDown size={18} className={centrePickerOpen ? 'is-rotated' : ''} />
      </button>
      {centrePickerOpen && <div className="donor-centre-dropdown-panel">
        <label className="donor-centre-search">
          <Search size={16} aria-hidden="true" />
          <input
            autoFocus
            type="search"
            value={centreSearch}
            onChange={(event) => setCentreSearch(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Escape') setCentrePickerOpen(false); }}
            placeholder="Search Gauteng donor centres"
            aria-label="Search Gauteng donor centres"
          />
          <span>{filteredCentres.length}</span>
        </label>
        <div className="donor-centre-options" id="donor-centre-options" role="listbox" aria-label="Gauteng donor centres">
          {filteredCentres.length ? filteredCentres.map((item) => <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={form.locationId === item.id}
            className={`donor-centre-option${form.locationId === item.id ? ' is-selected' : ''}`}
            onClick={() => {
              updateField('locationId', item.id);
              setCentrePickerOpen(false);
              setCentreSearch('');
            }}
          >
            <span className="donor-centre-option-pin" aria-hidden="true"><MapPin size={16} /></span>
            <span className="donor-centre-option-copy"><strong>{item.name}</strong><small>{item.address}</small><em>{item.kind} · {item.area}</em></span>
            <span className="donor-centre-option-check" aria-hidden="true">{form.locationId === item.id ? <Check size={16} /> : null}</span>
          </button>) : <p className="donor-centre-no-results">No Gauteng centres match “{centreSearch}”.</p>}
        </div>
      </div>}
    </div>

    <PickupAddressField form={form} updateField={updateField} />
    {closestCentre && Number.isFinite(closestCentre.distance) && <div className="closest-centre-note"><MapPin size={14} /><span><strong>{closestCentre.centre.name}</strong> is closest ({closestCentre.distance.toFixed(1)} km straight line).</span></div>}

    <div className="form-two-columns">
      <label className="field"><span className="field-label">Date</span><input className="text-input" type="date" min={localDateString()} value={form.appointmentDate} onChange={(event) => updateField('appointmentDate', event.target.value)} /></label>
      <label className="field"><span className="field-label">Time</span><select className="text-input" value={form.appointmentTime} onChange={(event) => updateField('appointmentTime', event.target.value)}>{['09:00', '10:00', '11:00', '12:00', '13:30', '14:30', '15:30'].map((time) => <option key={time} value={time}>{formatTime(time)}</option>)}</select></label>
    </div>

    <button type="button" className={`return-toggle-row ${form.returnRequested ? 'selected' : ''}`} onClick={() => updateField('returnRequested', !form.returnRequested)}>
      <span className="check-box">{form.returnRequested && <Check size={13} />}</span>
      <span><strong>Include free return ride home</strong><small>SANBS confirms when you’re ready to leave.</small></span>
    </button>
  </div>;
}

function ConfirmStep({ form, location }) {
  return <div className="flow-step-content">
    <div className="confirm-route-card">
      <div className="confirm-route-row">
        <span className="route-small-dot dot-origin" />
        <div><small>PICKUP</small><strong>{form.pickupAddress}</strong></div>
      </div>
      <div className="donor-route-connector" />
      <div className="confirm-route-row">
        <span className="route-small-dot dot-destination" />
        <div><small>DONATION SITE</small><strong>{location.name}</strong><span>{formatDate(form.appointmentDate, { weekday: 'long', day: 'numeric', month: 'long' })} · {formatTime(form.appointmentTime)}</span></div>
      </div>
    </div>
    <div className="confirm-facts">
      <div><span>Return ride</span><strong className="is-accent">{form.returnRequested ? 'Included' : 'One-way'}</strong></div>
      <div><span>Contact</span><strong>{form.contactNumber}</strong></div>
    </div>
    <div className="review-note"><ShieldCheck size={16} /><p>We’ll offer the trip to the closest available driver estimated to be within five minutes of your verified pickup. If none is close enough, Transport Ops will dispatch one.</p></div>
  </div>;
}

function ConfirmationScreen({ booking, onViewJourney, onDone }) {
  if (!booking) return null;
  return <div className="confirmation-screen">
    <button className="confirmation-close" type="button" onClick={onDone} aria-label="Close confirmation"><X size={18} /></button>
    <span className="confirmation-check"><Check size={25} strokeWidth={2.8} /></span>
    <span className="section-kicker">REQUEST SENT</span>
    <h1>Your ride request is in.</h1>
    <p>{booking.outbound?.driverId ? `A nearby driver has been asked to acknowledge your ride. The estimated pickup drive is about ${booking.outbound.etaMinutes || 5} minutes. Your verified pickup point and selected SANBS centre are shared with all journey roles.` : 'No available driver is estimated to be within five minutes, so Transport Ops will review and dispatch one. Your verified pickup point and selected centre are shared with all journey roles.'}</p>
    <div className="confirmation-ref"><span>BOOKING REFERENCE</span><strong>{booking.reference}</strong><StatusChip booking={booking} compact /></div>
    <div className="confirmation-appointment"><span className="site-pin"><CalendarDays size={16} /></span><div><strong>{booking.appointment.locationName}</strong><small>{formatLongDate(booking.appointment.date)} · {formatTime(booking.appointment.time)}</small></div></div>
    <div className="confirmation-next"><Clock3 size={16} /><span><strong>What happens next</strong><small>{booking.outbound?.driverId ? 'Your driver has been asked to acknowledge the assignment. Track their approach in My journey.' : 'Transport Ops will dispatch a driver estimated within five minutes. You can check updates in My journey.'}</small></span></div>
    <button className="button button-primary button-wide" type="button" onClick={onViewJourney}>View my journey <ArrowRight size={16} /></button>
    <button className="text-button" type="button" onClick={onDone}>Back to home</button>
  </div>;
}

function HelpScreen({ booking, donorName, actions, onBack, onReport, onChangePickup }) {
  const returnJourney = Boolean(booking?.returnRequested && !['not_required', 'waiting_authorisation'].includes(booking.returnLeg.status));
  const incidentLeg = returnJourney ? 'return' : 'outbound';
  const reportQuickIssue = (category, details) => booking
    ? actions.reportException(booking.id, { category, details, leg: incidentLeg }, 'donor', donorName)
    : actions.showToast('There is no journey to attach this report to yet.', 'warning');
  return <div className="donor-help-screen">
    <button className="screen-back-link" type="button" onClick={onBack}><ArrowLeft size={16} /> Back</button>
    <div className="help-screen-title"><span className="flow-step-icon"><HeartHandshake size={18} /></span><div><span className="section-kicker">HERE TO HELP</span><h1>How can we help?</h1><p>Send a transport issue to the coordinating team.</p></div></div>
    <div className="support-contact-block"><span className="support-phone-icon"><Phone size={18} /></span><div><strong>SANBS transport support</strong><small>{booking ? `${booking.reference} · shared with Transport Ops` : 'Book a ride to link a support request'}</small></div><button type="button" className="button button-secondary button-small" onClick={onReport} disabled={!booking}>Report issue</button></div>
    <div className="help-action-list">
      <HelpAction icon={MapPin} title="My driver can’t find me" text="Notify Transport Ops about the pickup." onClick={() => reportQuickIssue('Driver unable to find me', 'Donor asked for help at their pickup location.')} />
      <HelpAction icon={Navigation} title="Change my pickup location" text={booking ? 'Update the address for this journey.' : 'Set a different address for your next ride.'} onClick={onChangePickup} />
      <HelpAction icon={Clock3} title="I’ve missed my pickup" text="Let the transport team know as soon as possible." onClick={() => reportQuickIssue('Missed pickup', 'Donor reported that they missed the scheduled pickup.')} />
      <HelpAction icon={CircleHelp} title="Report another issue" text="Send a note about your transport experience." onClick={onReport} />
    </div>
    <p className="help-privacy-note"><ShieldCheck size={13} /> Please don’t include health or donation details in a transport issue.</p>
  </div>;
}

function HelpAction({ icon: Icon, title, text, onClick }) {
  return <button type="button" className="help-action-row" onClick={() => { onClick?.(); }}><span className="help-action-icon"><Icon size={16} /></span><span><strong>{title}</strong><small>{text}</small></span><ChevronRight size={17} /></button>;
}

/* ==========================================================================
   Profile & Settings — matches 00.25.22 & 00.25.37
   ========================================================================== */
function DonorProfile({ name, phone, pickupAddress, totalTrips, activeBooking, onHelp, onEdit, onRequest }) {
  const initials = initialsOf(name);
  return <div className="donor-profile-page">
    <div className="profile-hero-top">
      <span className="donor-profile-large">{initials}</span>
      <h1>{name}</h1>
      <p>{phone} · SANBS Donor</p>
      <div className="profile-twin-pills">
        <button type="button" className="button button-primary" onClick={onEdit}>Edit profile</button>
        <button type="button" className="button button-carbon" onClick={onRequest}>Book a ride</button>
      </div>
    </div>

    <div className="profile-dark-metrics">
      <div className="profile-dark-grid">
        <div><span>TRIPS</span><strong className="is-accent">{totalTrips}</strong></div>
        <div><span>STATUS</span><strong>{activeBooking ? 'Active' : 'Ready'}</strong></div>
        <div><span>DONOR FARE</span><strong>Free</strong></div>
      </div>
      <div className="profile-dark-bar"><span style={{ width: activeBooking ? '68%' : '100%' }} /></div>
    </div>

    <div className="profile-settings-stack">
      <div className="profile-group-label">SAVED SETTINGS</div>
      <button type="button" className="profile-pill-row" onClick={onEdit}>
        <div><small>Mobile number</small><strong>{phone}</strong></div>
        <ArrowRight size={16} />
      </button>
      <div className="profile-pill-row is-static">
        <div><small>Saved pickup</small><strong>{pickupAddress}</strong></div>
      </div>
      <div className="profile-pill-row is-static">
        <div><small>In-app status updates</small><strong>On · synced with SANBS Ops</strong></div>
      </div>
      <button className="profile-pill-row" type="button" onClick={onHelp}>
        <div><small>Support & dispatch</small><strong>Transport help</strong></div>
        <ArrowRight size={16} />
      </button>
    </div>

    <div className="donor-profile-foot"><ShieldCheck size={14} /><span>Only transport details needed for your ride are shared with coordinating teams.</span></div>
  </div>;
}

function EditDonorProfileModal({ name, phone, onClose, onSave }) {
  const [draftName, setDraftName] = useState(name);
  const [draftPhone, setDraftPhone] = useState(phone);
  const [error, setError] = useState('');
  const save = () => {
    if (!draftName.trim()) { setError('Enter your name.'); return; }
    if (!/^[+0-9() -]{7,20}$/.test(draftPhone.trim())) { setError('Enter a valid contact number.'); return; }
    onSave({ name: draftName.trim(), phone: draftPhone.trim() });
  };
  return <ModalFrame
    title="Edit contact details"
    subtitle="These details will be used for future transport requests. Existing trips keep their booking record."
    onClose={onClose}
    size="small"
    footer={<><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="button" onClick={save}>Save details <Check size={15} /></button></>}
  >
    <label className="field"><span className="field-label">Full name</span><input className="text-input" autoComplete="name" value={draftName} onChange={(event) => { setDraftName(event.target.value); setError(''); }} /></label>
    <label className="field"><span className="field-label">Mobile number</span><input className="text-input" type="tel" autoComplete="tel" value={draftPhone} onChange={(event) => { setDraftPhone(event.target.value); setError(''); }} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
  </ModalFrame>;
}

function ChangePickupModal({ booking, savedAddress, savedCoordinates, onClose, onSave }) {
  const [draft, setDraft] = useState(() => ({
    pickupAddress: booking?.pickupAddress || savedAddress || DEFAULT_PICKUP,
    pickupCoordinates: booking?.pickupCoordinates || savedCoordinates || null,
  }));
  const [error, setError] = useState('');
  const updateDraft = (key, value) => setDraft((previous) => ({ ...previous, [key]: value }));
  const verified = draft.pickupCoordinates?.label === draft.pickupAddress;
  return <ModalFrame
    title="Change pickup location"
    subtitle={booking ? `This updates ${booking.reference} and notifies all journey roles.` : 'Choose the exact address to use for your next ride.'}
    onClose={onClose}
    size="small"
    footer={<><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="button" onClick={() => { if (!verified) { setError('Select a verified pickup suggestion before saving.'); return; } onSave(draft.pickupAddress, draft.pickupCoordinates); }}>Save location <Check size={15} /></button></>}
  >
    <PickupAddressField form={draft} updateField={updateDraft} />
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="pickup-suggestion-row"><span><MapPin size={13} /> Saved home address</span><button type="button" onClick={() => { setDraft({ pickupAddress: savedAddress || DEFAULT_PICKUP, pickupCoordinates: savedCoordinates || null }); setError(''); }}>Use saved address</button></div>
    <RouteMap from={draft.pickupAddress} to={booking?.appointment.locationName || 'Selected SANBS centre'} compact progress={0.08} dark helper="Route overview" />
    <div className="flow-info-note"><ShieldCheck size={14} /><span>Navigation uses the selected map position, not a guessed suburb centre.</span></div>
  </ModalFrame>;
}
