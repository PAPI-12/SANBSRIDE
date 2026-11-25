import React, { useEffect, useMemo, useState } from 'react';
import { usePhoneScale } from '../phoneScale';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  HeartHandshake,
  Home,
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
  getJourneyState,
  getJourneyMapState,
  getStatusMeta,
  isBookingActive,
  legProgress,
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
import donorDropShell from '../assets/donor-drop-shell.png';
import donorDropBody from '../assets/donor-drop-body.png';

const DEFAULT_PICKUP = '22 West Street, Sandown, Sandton, Johannesburg';
const DEFAULT_PHONE = '082 555 0142';
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'My journey', icon: Navigation },
  { id: 'profile', label: 'Profile', icon: UserRound },
];

export function DonorApp({ state, actions }) {
  usePhoneScale();
  const profile = state.donorProfile || { name: 'Thabo Mokoena', phone: DEFAULT_PHONE, pickupAddress: DEFAULT_PICKUP };
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState('main');
  const [step, setStep] = useState(0);
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
      donorId: profile.id || 'donor-thabo',
      donorName: profile.name,
      donorPhone: profile.phone,
      contactNumber: profile.phone,
      pickupAddress: profile.pickupAddress,
      pickupCoordinates: profile.pickupCoordinates || null,
    }));
  }, [profile.id, profile.name, profile.phone, profile.pickupAddress, profile.pickupCoordinates]);

  const booking = useMemo(() => state.bookings
    .filter((item) => item.donorId === (profile.id || 'donor-thabo'))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null, [state.bookings]);
  const activeBooking = booking && isBookingActive(booking) ? booking : null;
  const helpBooking = activeBooking || booking;
  const homeDriver = useMemo(() => {
    if (!activeBooking) return null;
    const leg = activeBooking.returnRequested && !['not_required', 'waiting_authorisation'].includes(activeBooking.returnLeg.status)
      ? activeBooking.returnLeg : activeBooking.outbound;
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
  const toggleRequirement = (value) => setForm((previous) => ({
    ...previous,
    requirements: previous.requirements.includes(value)
      ? previous.requirements.filter((item) => item !== value)
      : [...previous.requirements, value],
  }));

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
          onBack={() => step > 0 ? setStep((previous) => previous - 1) : closeFlow()}
          onCancel={closeFlow}
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
              lastBooking={booking}
              donorName={profile.name}
              driver={homeDriver}
              onRequest={startRequest}
              onJourney={() => navigateTab('journey')}
              onHelp={openHelp}
            />}
            {tab === 'profile' && <DonorProfile
              name={profile.name}
              phone={profile.phone}
              pickupAddress={profile.pickupAddress}
              onHelp={openHelp}
              onEdit={() => setProfileEditOpen(true)}
            />}
          </div>
          {/* The journey sits on the phone screen itself, not in the scrolling content, so its
              map covers the whole screen and the handle starts at the bottom edge. */}
          {tab === 'journey' && <DonorJourney booking={booking} state={state} onRequest={startRequest} onHelp={openHelp} onBack={() => setTab('home')} />}
          {tab !== 'journey' && <nav className="mobile-bottom-nav" aria-label="Donor app navigation">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => navigateTab(id)}>
              <Icon size={19} strokeWidth={tab === id ? 2.2 : 1.8} /><span>{label}</span>
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

function DonorHome({ booking, lastBooking, donorName, onRequest, onJourney, onHelp, driver }) {
  const appointment = booking?.appointment || lastBooking?.appointment || {
    locationName: 'SANBS Sandton Donor Centre',
    locationAddress: 'Rivonia Road, Sandton, Johannesburg',
    locationKind: 'Permanent donation centre',
    date: localDateString(),
    time: '10:00',
  };
  const statusMeta = booking ? getStatusMeta(booking) : null;
  const returnActive = Boolean(booking?.returnRequested && !['not_required', 'waiting_authorisation'].includes(booking.returnLeg.status));
  const routeFrom = returnActive ? appointment.locationName : booking?.pickupAddress || DEFAULT_PICKUP;
  const routeTo = returnActive ? booking.pickupAddress : appointment.locationName;
  const activeMapState = booking ? getJourneyMapState(booking, returnActive ? 'return' : 'outbound') : null;
  /* The drop follows the whole journey on the shared timeline: it fills while the driver
     approaches the donor (first half) and while the trip runs to the centre (second half). */
  const gaugeFill = activeMapState ? Math.max(0, Math.min(1, activeMapState.fillProgress)) : 0;
  /* Keep the drop live: re-render while a journey is moving so the fill follows the driver. */
  const [, setDropClock] = useState(0);
  useEffect(() => {
    if (!activeMapState?.moving) return undefined;
    const timer = window.setInterval(() => setDropClock(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [activeMapState?.moving]);
  /* Stage index of the active leg: 4 = donor picked up, 5 = arrived at the destination. */
  const stage = booking ? stepIndexFor(getBookingStatus(booking), Boolean(returnActive)) : -1;

  /* ---- no ride yet: book-first state, the reference's pre-booking screen ---- */
  if (!booking) {
    return <div className="donor-home-page">
      <div className="donor-greeting-row">
        <div>
          <span className="eyebrow">{formatDate(localDateString(), { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()} · JOHANNESBURG</span>
          <h1>Where do you<br />want to go?</h1>
        </div>
        <span className="donor-profile-initials" aria-label={donorName}>{initialsOf(donorName)}</span>
      </div>

      <section className="donor-ride-hero donor-map-hero" aria-label="Your donation trip">
        <div className="donor-hero-topline"><span>YOUR DONATION TRIP</span><span>{appointment.locationKind || 'DONATION CENTRE'}</span></div>
        <div className="donor-empty-drop">
          <DonorCharacterDrop empty />
          <span className="donor-empty-readout" aria-hidden="true"><b>—</b><em>No ride booked</em></span>
        </div>
        <div className="donor-route-fields">
          <div className="donor-route-field">
            <span className="donor-field-pin donor-field-pin-start" aria-hidden="true" />
            <span><small>PICKUP · YOUR ADDRESS</small><b>{booking?.pickupAddress || DEFAULT_PICKUP}</b></span>
          </div>
          <span className="donor-field-swap" aria-hidden="true"><ArrowLeftRight size={13} /></span>
          <div className="donor-route-field">
            <span className="donor-field-pin donor-field-pin-end" aria-hidden="true" />
            <span><small>DESTINATION · APPOINTMENT</small><b>{appointment.locationName}</b></span>
          </div>
        </div>
        <div className="donor-hero-appointment">
          <strong>{formatTime(appointment.time)}</strong>
          <span><b>{formatDate(appointment.date, { weekday: 'long', day: 'numeric', month: 'long' })}</b><small>Return trip included · free for donors</small></span>
        </div>
        <button className="button donor-hero-button" type="button" onClick={onRequest}>
          <span className="donor-cta-disc"><ArrowRight size={14} /></span>
          Request this ride
        </button>
      </section>

      <div className="donor-home-shortcuts" aria-label="Quick actions">
        <button type="button" onClick={onJourney}><span className="shortcut-icon"><Navigation size={17} /></span><span><strong>Ride options</strong><small>Both ways, driver waits</small></span><ChevronRight size={16} /></button>
        <button type="button" onClick={onHelp}><span className="shortcut-icon"><CircleHelp size={17} /></span><span><strong>Get help</strong><small>Support and pickup changes</small></span><ChevronRight size={16} /></button>
      </div>

      <section className="donor-home-activity">
        <div className="donor-activity-heading"><span className="section-kicker">YOUR IMPACT</span><span>{lastBooking ? '1 PREVIOUS RIDE' : 'FIRST RIDE'}</span></div>
        <div className="donor-impact-card">
          <span className="donor-impact-heart" aria-hidden="true"><HeartHandshake size={17} /></span>
          <span><strong>Every ride keeps a donor appointment</strong><small>Missed transport is the main reason donations are cancelled.</small></span>
        </div>
        <p className="donor-activity-empty">No ride requested yet. Your appointment above is already set as the destination.</p>
      </section>
    </div>;
  }

  /* ---- active ride: the reference's tracking screen ---- */
  const liveReadout = gaugeReadout(booking, returnActive);
  const readoutIsWord = !/^\d+$/.test(String(liveReadout.big));
  const legSteps = returnActive ? RETURN_STEPS : OUTBOUND_STEPS;
  return <div className="donor-home-page">
    <div className="donor-greeting-row">
      <div>
        <span className="eyebrow">{booking.reference} · {returnActive ? 'RETURN JOURNEY' : 'OUTBOUND'}</span>
        <h1>{statusMeta.label}</h1>
      </div>
      <span className="donor-profile-initials" aria-label={donorName}>{initialsOf(donorName)}</span>
    </div>

    <section className={`donor-drop-hero${returnActive ? ' is-return' : ''}`} aria-label="Your live ride">
      <div className="donor-fill">
        <div className="donor-fill-drop">
          <DonorCharacterDrop fill={gaugeFill} />
        </div>

        <div className="donor-fill-read">
          <div className="donor-drop-caption">
            <b className="donor-drop-pct">{Math.round(gaugeFill * 100)}%</b>
            <span className="donor-drop-label">{returnActive ? 'to your home' : activeMapState?.phase === 'to_pickup' ? 'driver is on the way' : 'to the donor centre'}</span>
            <span className="donor-progress-chip">{gaugeFill >= 1 ? 'Completed' : 'In progress'}</span>
          </div>
          <ol className="donor-car-track" aria-label="Journey progress">
            {legSteps.map((label, index) => <li
              key={label}
              className={index < stage ? 'done' : index === stage ? 'now' : ''}
              aria-current={index === stage ? 'step' : undefined}
            ><i /><span>{label}</span></li>)}
            <span
              className="donor-car"
              style={{ left: `${((Math.min(Math.max(stage, 0), legSteps.length - 1) + 0.5) / legSteps.length) * 100}%` }}
              aria-hidden="true"
            ><CarFront size={18} /></span>
          </ol>
        </div>
      </div>

      <div className="donor-strip" role="region" tabIndex={0} aria-label="Ride details">
        {driver && <div className="donor-strip-card is-assigned">
          <span className="k">Driver</span>
          <b>{driver.name}</b>
          <small>{driver.vehicle} · {driver.registration}</small>
        </div>}
        <div className={`donor-strip-card${stage >= 4 ? ' is-picked' : ''}`}>
          <span className="k">Pickup</span>
          <b>{booking.pickupAddress || DEFAULT_PICKUP}</b>
        </div>
        <div className={`donor-strip-card${stage >= 5 ? ' is-arrived' : ''}`}>
          <span className="k">Destination</span>
          <b>{appointment.locationName}</b>
          <small>{formatTime(appointment.time)} · {formatDate(appointment.date, { weekday: 'short', day: 'numeric', month: 'short' })}</small>
        </div>
      </div>

      <button className="button donor-hero-button" type="button" onClick={onJourney}>
        <span className="donor-cta-disc"><ArrowRight size={14} /></span>
        Open live journey
      </button>
    </section>

    <div className="donor-home-shortcuts" aria-label="Quick actions">
      <button type="button" onClick={onJourney}><span className="shortcut-icon"><Navigation size={17} /></span><span><strong>My journey</strong><small>{booking.reference} · {booking.returnRequested ? 'Return requested' : 'One-way ride'}</small></span><ChevronRight size={16} /></button>
      <button type="button" onClick={onHelp}><span className="shortcut-icon"><CircleHelp size={17} /></span><span><strong>Get help</strong><small>Support and pickup changes</small></span><ChevronRight size={16} /></button>
    </div>

    <section className="donor-home-activity">
      <div className="donor-activity-heading"><span className="section-kicker">JOURNEY ACTIVITY</span><span>1 ACTIVE</span></div>
      <button className="donor-activity-row" type="button" onClick={onJourney}>
        <span className="donor-activity-mark"><CarFront size={18} /></span>
        <span><strong>{returnActive ? 'Return journey' : `Ride to ${appointment.locationName}`}</strong><small>{booking.reference} · {booking.returnRequested ? 'Return requested' : 'One-way ride'}</small></span>
        <StatusChip booking={booking} compact /><ChevronRight size={15} />
      </button>
    </section>
  </div>;
}

/* The stepper reads the real booking status so the dots never disagree with
   the status chip or the shared journey timeline. Two legs, two labellings. */
const DONATION_FACTS = [
  'A single blood donation can help save up to three lives.',
  'Your body replaces donated plasma within about 24 to 48 hours.',
  'Red blood cells are used to help patients after surgery or serious injury.',
  'Every donation is carefully tested before it can help a patient.',
  'Blood platelets can help people being treated for cancer.',
];

const OUTBOUND_STEPS = ['Assigned', 'On the way', 'On board', 'At centre'];
const RETURN_STEPS = ['Authorised', 'Assigned', 'On the way', 'Home'];

function stepIndexFor(status, returnLeg) {
  if (returnLeg) {
    if (status === 'return_awaiting_dispatch') return 0;
    if (status === 'return_driver_assigned') return 1;
    if (status === 'return_driver_on_the_way' || status === 'return_driver_arrived') return 2;
    if (status === 'donor_on_the_way_home') return 3;
    if (status === 'completed') return 4;
    return 0;
  }
  if (status === 'awaiting_assignment') return 0;
  if (status === 'driver_assigned') return 0;
  if (status === 'driver_on_the_way') return 1;
  if (status === 'driver_arrived') return 1;
  if (status === 'donor_picked_up') return 2;
  if (status === 'arrived_at_site') return 3;
  return 0;
}

function initialsOf(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

/* The gauge readout: a big figure and its caption, always in agreement.
   No duplication is possible because they are two different strings. */
const READOUT_BY_LEG = {
  driver_assigned:      { big: '6',  caption: 'min away' },
  driver_on_the_way:    { big: '8',  caption: 'min away' },
  driver_arrived:       { big: 'Now', caption: 'at your door' },
  donor_picked_up:      { big: 'En route', caption: 'to the centre' },
  arrived_at_site:      { big: 'Here', caption: 'at the centre' },
  donor_on_the_way_home: { big: 'En route', caption: 'homeward' },
  completed:            { big: 'Done', caption: 'journey complete' },
  waiting_authorisation: { big: 'Next', caption: 'return authorised' },
  not_required:         { big: '—', caption: 'one-way ride' },
};

function gaugeReadout(booking, returnActive) {
  const leg = returnActive ? booking.returnLeg : booking.outbound;
  const minutes = leg?.etaMinutes ?? leg?.eta ?? null;
  if (minutes) return { big: String(minutes), caption: 'min away' };
  return READOUT_BY_LEG[leg?.status] || { big: '—', caption: 'in progress' };
}

/* The drop is a drawn character. Its body is a separate mask (donor-drop-body.png)
   so the liquid rises inside the body while the face, outline and highlight stay
   on top (donor-drop-shell.png). BODY_TOP and BODY_BOTTOM are fractions of the
   cropped image box (its height) where the body starts and ends. */
const BODY_TOP = 0.0417, BODY_BOTTOM = 0.869;
/* One crest every 50 units; the svg holds two copies of the wave pattern, so moving
   the wave by half its width (-50%) loops seamlessly. */
const WAVE_TOP = ['M0 20 Q12.5 2 25 20', ...Array.from({ length: 15 }, (_, i) => `T${50 + i * 25} 20`)].join(' ');
const WAVE_D = `${WAVE_TOP} V40 H0 Z`;

function DonorCharacterDrop({ fill = 0, empty = false }) {
  const level = empty ? 0 : Math.max(0, Math.min(1, fill));
  const mask = `url(${donorDropBody})`;
  return <div className="donor-character" role="img" aria-label={empty ? 'No ride booked' : `Journey ${Math.round(level * 100)} percent complete`}>
    <div className="donor-character-body" style={{ WebkitMaskImage: mask, maskImage: mask }}>
      {level > 0 && <div
        className="donor-character-liquid"
        style={{ bottom: `${(1 - BODY_BOTTOM) * 100}%`, height: `${level * (BODY_BOTTOM - BODY_TOP) * 100}%` }}
      ><span className="donor-wave is-back" aria-hidden="true"><svg viewBox="0 0 400 40" preserveAspectRatio="none"><path fill="#F0676C" d={WAVE_D} /></svg></span><span className="donor-wave" aria-hidden="true"><svg viewBox="0 0 400 40" preserveAspectRatio="none"><path fill="#E23A3F" d={WAVE_D} /><path fill="none" stroke="#FFFFFF" strokeOpacity=".6" strokeWidth="2.5" d={WAVE_TOP} /></svg></span><i className="donor-bubble b1" /><i className="donor-bubble b2" /><i className="donor-bubble b3" /></div>}
    </div>
    <img className="donor-character-shell" src={donorDropShell} alt="" aria-hidden="true" />
  </div>;
}

function DonorRouteArtwork({ from, to, progress, reverse = false }) {
  const stage = Math.max(0, Math.min(progress, 1));
  const markerX = 36 + stage * 276;
  const markerY = reverse ? 22 + stage * 82 + Math.sin(stage * Math.PI) * 9 : 106 - stage * 82 - Math.sin(stage * Math.PI) * 9;
  return <div className={`donor-route-art${reverse ? ' donor-route-art-reverse' : ''}`} role="img" aria-label={`Route from ${from} to ${to}`}>
    <div className="donor-route-art-meta"><span>ROUTE PREVIEW</span><span>JOHANNESBURG</span></div>
    <svg viewBox="0 0 360 128" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <g className="donor-map-buildings">
        <path d="M8 11h43v24H8zM65 8h25v35H65zM102 18h48v22h-48zM287 10h42v30h-42zM322 56h31v19h-31zM13 89h42v28H13zM76 94h33v22H76zM294 95h49v21h-49z" />
      </g>
      <path d="M18 107 C62 91 68 48 115 56 S171 102 213 78 260 37 342 21" fill="none" stroke="#7f1a24" strokeWidth="15" strokeLinecap="round" />
      <path d="M18 107 C62 91 68 48 115 56 S171 102 213 78 260 37 342 21" fill="none" stroke="#f7dfe1" strokeWidth="8" strokeLinecap="round" />
      <path d="M18 107 C62 91 68 48 115 56 S171 102 213 78 260 37 342 21" fill="none" stroke="#b51f2d" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 8" />
      <circle cx="18" cy="107" r="7" fill="#fff" stroke="#b51f2d" strokeWidth="3" />
      <circle cx="342" cy="21" r="8" fill="#fff" stroke="#b51f2d" strokeWidth="3" />
      <g transform={`translate(${markerX - 12} ${markerY - 8})`}>
        <path d="M1 8h4l3-5h8l4 5h3v7H1z" fill="#fff" stroke="#202224" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M9 4h6v4H7z" fill="#b51f2d" />
        <circle cx="6" cy="15" r="2.5" fill="#202224" stroke="#fff" strokeWidth="1" />
        <circle cx="19" cy="15" r="2.5" fill="#202224" stroke="#fff" strokeWidth="1" />
      </g>
    </svg>
  </div>;
}

function donorStatusMessage(booking, returnActive = false) {
  const status = getBookingStatus(booking);
  const activeLeg = returnActive ? booking.returnLeg : booking.outbound;
  if (status === 'awaiting_assignment') return 'We’ve received your request. We’ll let you know when a driver is assigned.';
  if (status === 'driver_assigned') {
    if (activeLeg?.accepted) return 'Your driver accepted the ride and is preparing to head to your pickup.';
    if (activeLeg?.acknowledged) return 'Your driver acknowledged the assignment and is preparing for pickup.';
    return 'A driver is assigned. We’ll update you when they confirm.';
  }
  if (status === 'driver_on_the_way') return 'Your driver is heading to your pickup address.';
  if (status === 'driver_arrived') return 'Your driver is at the pickup location.';
  if (status === 'donor_picked_up') return 'You’re on your way to the donation centre.';
  if (status === 'awaiting_return_authorisation') return 'You’ve arrived at SANBS. Your return will be arranged once the team confirms you’re ready.';
  if (status === 'return_awaiting_dispatch') return 'SANBS has confirmed you’re ready. We’re arranging your return driver.';
  if (status === 'return_driver_assigned') {
    if (activeLeg?.accepted) return 'Your return driver accepted the ride and is preparing to head to the donation centre.';
    if (activeLeg?.acknowledged) return 'Your return driver acknowledged the assignment.';
    return 'A return driver is assigned. We’ll update you when they confirm.';
  }
  if (status.startsWith('return_driver')) return 'Your return driver details and progress are shown below.';
  if (status === 'donor_on_the_way_home') return 'You’re on your way home. Your driver will confirm when you arrive.';
  if (status === 'completed') return 'Your transport journey is complete. Thank you for donating.';
  return 'Your booking is being coordinated with SANBS transport.';
}

/* Trip stops, drawn like the mission list: round icon, title, count and an arrow.
   Done stops are ink, the current stop is the red accent, upcoming stops are outlined. */
function JourneyStops({ booking, leg = 'outbound' }) {
  const journey = getJourneyState(booking, leg);
  return <ol className="journey-stops" aria-label="Trip stops">
    {journey.stages.map((stage, i) => {
      const done = journey.done ? i <= journey.index : i < journey.index;
      const current = !journey.done && i === journey.index;
      const state = done ? 'is-done' : current ? 'is-current' : 'is-next';
      return <li key={stage.key} className={`journey-stop ${state}`} aria-current={current ? 'step' : undefined}>
        <span className="journey-stop-icon">{done ? <Check size={15} strokeWidth={3} /> : <MapPin size={15} />}</span>
        <span className="journey-stop-copy"><strong>{stage.title}</strong><small>{done ? 'Done' : current ? 'Happening now' : 'Next'}</small></span>
        <span className="journey-stop-count">{i + 1}/{journey.stages.length}</span>
        <span className="journey-stop-go" aria-hidden="true"><ChevronRight size={16} /></span>
      </li>;
    })}
  </ol>;
}

function DonorJourney({ booking, state, onRequest, onHelp, onBack }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState(null);
  const [focusToken, setFocusToken] = useState(0);
  if (!booking) return <div className="donor-empty-journey">
    <span className="donor-journey-character"><DonorCharacterDrop empty /></span>
    <span className="section-kicker">MY JOURNEY</span>
    <h1>No ride booked yet</h1>
    <p>Your transport request, assigned driver and trip progress will appear here.</p>
    <button className="button button-primary button-wide" type="button" onClick={onRequest}>Request transport <ArrowRight size={15} /></button>
    <button className="text-button help-text-button" type="button" onClick={onHelp}>Need help? Contact support</button>
  </div>;

  const returnActive = booking.returnRequested && !['not_required', 'waiting_authorisation'].includes(booking.returnLeg.status);
  const driverId = returnActive ? booking.returnLeg.driverId : booking.outbound.driverId;
  const driver = getDriver(state, driverId) || null;
  const legName = returnActive ? 'return' : 'outbound';
  const journey = getJourneyState(booking, legName);
  const mapJourney = getJourneyMapState(booking, legName);
  const percent = journey.done ? 100 : Math.round(mapJourney.phase === 'to_pickup'
    ? mapJourney.progress * 35
    : 35 + mapJourney.progress * 65);

  /* Swipe up anywhere on the map opens the sheet; swipe down on the handle closes it. */
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
    <button className="journey-back" type="button" onClick={onBack} aria-label="Back to home"><ArrowLeft size={20} /></button>
    <div className="journey-map-wrap">
      <JourneyMap booking={booking} leg={legName} focusToken={focusToken} from={routeFrom} to={routeTo} controls />
      <span className="journey-route-chip"><MapPin size={12} /> {routeFrom} → {routeTo}</span>
    </div>
    <button className="journey-locate" type="button" onClick={() => setFocusToken((count) => count + 1)} aria-label="Show my car's live location"><Navigation size={22} /><span>Live</span></button>
    <div className={`journey-sheet${sheetOpen ? ' is-open' : ''}`} onTouchEnd={onHandleTouchEnd}>
      <button
        className="journey-sheet-tab"
        type="button"
        aria-expanded={sheetOpen}
        aria-label={sheetOpen ? 'Minimize trip details' : 'Open trip details'}
        onClick={() => setSheetOpen((open) => !open)}
      >
        <span className="journey-sheet-tab-label">Trip details</span>
        {sheetOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      <div className="journey-sheet-body">
        <button className="journey-sheet-close" type="button" onClick={() => setSheetOpen(false)} aria-label="Minimize Journey Info">Minimize <ChevronDown size={14} /></button>
        <div className="journey-page-heading"><span className="section-kicker">MY JOURNEY</span><h1>Ride details</h1><p>Ref {booking.reference}</p></div>
        <div className="journey-status-card">
          <div>
            <StatusChip booking={booking} />
            <h2>{getStatusMeta(booking).label}</h2>
            <p>{donorStatusMessage(booking, returnActive)}</p>
            <div className="journey-progress-line"><span>Progress</span><b>{percent}%</b></div>
            {percent > 0 && percent < 100 && <p className="donation-fact" key={percent}><strong>Did you know?</strong> {DONATION_FACTS[percent % DONATION_FACTS.length]}</p>}
            <div className="journey-segments" style={{ gridTemplateColumns: `repeat(${journey.stages.length}, 1fr)` }} aria-hidden="true">
              {journey.stages.map((stage, i) => <i
                key={stage.key}
                className={journey.done || i < journey.index ? 'is-done' : i === journey.index ? 'is-now' : ''}
              />)}
            </div>
          </div>
          <span className="journey-status-icon"><Navigation size={18} /></span>
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
        {(driver || booking.returnLeg.status === 'awaiting_dispatch') && <section className="donor-driver-card">
          <span className="section-kicker">{driver ? (returnActive ? 'YOUR RETURN DRIVER' : 'YOUR DRIVER') : 'RETURN JOURNEY'}</span>
          {driver ? <div className="donor-driver-detail"><span className="donor-driver-avatar">{driver.initials}</span><div><strong>{driver.firstName}</strong><small>{driver.vehicle}</small></div><span className="vehicle-verified"><CheckCircle2 size={14} />Verified</span></div> : <div className="donor-driver-wait"><Clock3 size={15} /><span>Waiting for operations to assign a return driver.</span></div>}
        </section>}
        <p className="journey-helper">Driver location, route progress and trip status sync as the journey updates.</p>
        <button className="donor-help-row" type="button" onClick={onHelp}><CircleHelp size={16} /><span>Need help with your ride?</span><ChevronRight size={16} /></button>
      </div>
    </div>
  </div>;
}

function RequestFlow({ form, location, step, error, updateField, onNext, onBack, onCancel }) {
  const steps = ['Your ride', 'Confirm'];
  return <div className="request-flow-screen">
    <header className="request-flow-header">
      <button className="flow-back-button" type="button" aria-label="Go back" onClick={onBack}><ArrowLeft size={19} /></button>
      <div><span className="section-kicker">{step === 0 ? 'BOOK A RIDE' : 'CONFIRM'}</span><strong>{steps[step]}</strong></div>
      <button className="flow-close-button" type="button" onClick={onCancel} aria-label="Cancel booking"><X size={18} /></button>
    </header>
    <div className="request-progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
      {steps.map((label, index) => <div className={`request-progress-item ${index <= step ? 'progress-active' : ''}`} key={label}><i /></div>)}
    </div>
    <div className="request-flow-content">
      {step === 0 && <RideStep form={form} location={location} updateField={updateField} />}
      {step === 1 && <ConfirmStep form={form} location={location} />}
      {error && <div className="form-error"><X size={14} />{error}</div>}
    </div>
    <footer className="request-flow-footer">
      <button className="button button-primary button-wide" type="button" onClick={onNext}>
        {step === 1 ? 'Request ride' : 'Continue'} <ArrowRight size={17} />
      </button>
      <span className="secure-line"><ShieldCheck size={13} /> Free for SANBS donors · no payment</span>
    </footer>
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
    <label className="field-label" htmlFor="verified-pickup-address">Pick us up at</label>
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
      placeholder="Start typing your exact street address"
    />
    {searching && <small className="pickup-address-status">Searching Gauteng addresses…</small>}
    {verified && <small className="pickup-address-verified"><CheckCircle2 size={13} /> Exact pickup point verified on the map</small>}
    {searchError && !verified && <small className="pickup-address-status is-error">{searchError}</small>}
    {suggestions.length > 0 && <div className="pickup-address-suggestions" id="pickup-address-suggestions" role="listbox" aria-label="Verified pickup locations">
      {suggestions.map((place) => <button key={place.id} type="button" role="option" aria-selected="false" onClick={() => selectSuggestion(place)}>
        <MapPin size={15} /><span>{place.label}</span><small>Select</small>
      </button>)}
    </div>}
    <small className="pickup-address-hint">Choose the matching result so navigation targets this precise point.</small>
  </div>;
}

/* Step 1 — everything that matters, on one screen. No optional fields up front. */
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
    <div className="flow-step-title"><h1>Where are we taking you?</h1><p>Your appointment details are filled in — just check them.</p></div>

    <section className="donor-centre-picker" aria-labelledby="donor-centre-picker-title">
      <div className="donor-centre-picker-heading">
        <div><span className="field-label">Donation centre</span><h2 id="donor-centre-picker-title">Choose a donor centre</h2></div>
        <span>{LOCATIONS.length} Gauteng locations</span>
      </div>
      <DonationCentrePickerMap
        locations={LOCATIONS}
        selectedLocationId={form.locationId}
        onSelect={(locationId) => updateField('locationId', locationId)}
      />
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
          <span><small>Selected donation centre</small><strong>{location.shortName}</strong></span>
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
    </section>

    <div className="form-two-columns">
      <label className="field"><span className="field-label">Date</span><input className="text-input" type="date" min={localDateString()} value={form.appointmentDate} onChange={(event) => updateField('appointmentDate', event.target.value)} /></label>
      <label className="field"><span className="field-label">Time</span><select className="text-input" value={form.appointmentTime} onChange={(event) => updateField('appointmentTime', event.target.value)}>{['09:00', '10:00', '11:00', '12:00', '13:30', '14:30', '15:30'].map((time) => <option key={time} value={time}>{formatTime(time)}</option>)}</select></label>
    </div>

    <PickupAddressField form={form} updateField={updateField} />
    {closestCentre && Number.isFinite(closestCentre.distance) && <div className="closest-centre-note"><MapPin size={14} /><span><strong>{closestCentre.centre.name}</strong> is the closest listed centre, about {closestCentre.distance.toFixed(1)} km away by straight line. The centre you selected remains the route destination.</span></div>}

    <div className="ride-summary-strip">
      <span className="site-pin"><MapPin size={17} /></span>
      <div><strong>{location.shortName}</strong><small>{location.address}</small></div>
    </div>

    <button type="button" className={`return-toggle-row ${form.returnRequested ? 'selected' : ''}`} onClick={() => updateField('returnRequested', !form.returnRequested)}>
      <span className="check-box">{form.returnRequested && <Check size={13} />}</span>
      <span><strong>I need a ride home too</strong><small>SANBS confirms when you’re ready to leave.</small></span>
    </button>
  </div>;
}

/* Step 2 — one glanceable confirmation card. */
function ConfirmStep({ form, location }) {
  return <div className="flow-step-content">
    <div className="flow-step-title"><h1>Confirm your ride</h1><p>Check the details, then request.</p></div>
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
      <div><span>Return ride</span><strong>{form.returnRequested ? 'Requested' : 'Not needed'}</strong></div>
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

function DonorProfile({ name, phone, pickupAddress, onHelp, onEdit }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <div className="donor-profile-page">
    <span className="section-kicker">YOUR ACCOUNT</span><h1>Profile</h1>
    <div className="donor-profile-card"><span className="donor-profile-large">{initials}</span><div><strong>{name}</strong><small>Donor account</small></div><button className="text-action" type="button" onClick={onEdit}>Edit details</button></div>
    <div className="profile-group-label">CONTACT DETAILS</div>
    <div className="profile-detail-row"><span>Mobile</span><strong>{phone}</strong></div>
    <div className="profile-detail-row"><span>Saved pickup</span><strong>{pickupAddress}</strong></div>
    <div className="profile-group-label">JOURNEY UPDATES</div>
    <div className="profile-link-row"><span>In-app status updates</span><strong>On · shared with the transport team</strong></div>
    <button className="donor-help-row" type="button" onClick={onHelp}><span className="help-row-icon"><CircleHelp size={17} /></span><span><strong>Support & help</strong><small>Get help with a transport booking</small></span><ChevronRight size={17} /></button>
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
    <RouteMap from={draft.pickupAddress} to={booking?.appointment.locationName || 'Selected SANBS centre'} compact progress={0.08} helper="Route overview" />
    <div className="flow-info-note"><ShieldCheck size={14} /><span>Navigation uses the selected map position, not a guessed suburb centre.</span></div>
  </ModalFrame>;
}
