import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react';
import {
  LOCATIONS,
  dateAfter,
  formatDate,
  formatTime,
  getBookingStatus,
  getDriver,
  getReturnStatusLabel,
  isBookingActive,
  localDateString,
} from '../domain.js';
import {
  DriverAvatar,
  EmptyState,
  StatusChip,
  useDialogA11y,
} from '../components/Shared.jsx';
import { AssignDriverModal, BookingDetailPanel } from '../components/WorkflowModals.jsx';

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'journeys', label: 'Donor journeys', icon: ClipboardList },
];

export function StaffApp({ state, actions }) {
  const [view, setView] = useState('overview');
  const [detailId, setDetailId] = useState(null);
  const [assistedOpen, setAssistedOpen] = useState(false);
  const [assignContext, setAssignContext] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const booking = state.bookings.find((item) => item.id === detailId) || null;

  const visibleBookings = useMemo(() => filterBookings(state.bookings, { search, statusFilter, siteFilter, dateFilter }), [state.bookings, search, statusFilter, siteFilter, dateFilter]);
  const activeBookings = state.bookings.filter(isBookingActive);
  const pendingPickups = activeBookings.filter((item) => ['awaiting_assignment', 'driver_assigned', 'driver_on_the_way'].includes(item.outbound.status));
  const inTransit = activeBookings.filter((item) => item.outbound.status === 'donor_picked_up' || item.returnLeg?.status === 'donor_on_the_way_home');
  const atCentre = activeBookings.filter((item) => item.outbound.status === 'arrived_at_site' && item.returnRequested && item.returnLeg.status === 'waiting_authorisation');
  const openExceptions = state.bookings.reduce((total, item) => total + item.exceptions.filter((exception) => exception.status === 'open').length, 0);
  const today = localDateString();

  const handleCreated = (fields) => {
    const created = actions.createBooking(fields, 'staff');
    setAssistedOpen(false);
    setView('journeys');
    setDetailId(created.id);
  };

  const openAssignment = (item, leg) => setAssignContext({ bookingId: item.id, leg });
  const assignBooking = state.bookings.find((item) => item.id === assignContext?.bookingId);

  return (
    <div className="console-layout staff-console">
      <aside className="console-sidebar staff-sidebar">
        <div className="staff-sidebar-brand"><span className="console-workspace-title">Collection<small>SANBS staff</small></span></div>
        <div className="sidebar-section-label">SANBS COLLECTION</div>
        <nav className="console-nav" aria-label="Staff navigation">
          {NAV.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={view === id ? 'console-nav-item active' : 'console-nav-item'} onClick={() => setView(id)}><Icon size={17} /><span>{label}</span>{id === 'journeys' && <span className="nav-count">{activeBookings.length}</span>}</button>)}
        </nav>
        <div className="sidebar-rule" />
        <button className="sidebar-create-button" type="button" onClick={() => setAssistedOpen(true)}><Plus size={16} /> Book transport</button>
        <div className="sidebar-site-card"><span className="site-status-dot" /><div><small>WORKING SITE</small><strong>Sandton Donor Centre</strong><span>Johannesburg · Gauteng</span></div></div>
        <div className="sidebar-help"><ShieldCheck size={15} /><span>Operational view only<br />No clinical information</span></div>
        <div className="sidebar-user"><span className="staff-user-avatar">SN</span><div><strong>Sam Ndlovu</strong><small>Collection staff</small></div><span className="online-indicator" /></div>
      </aside>
      <section className="console-main staff-main">
        <header className="console-topbar">
          <div className="console-breadcrumb"><span>SANBS COLLECTION</span><i>/</i><strong>{view === 'overview' ? 'Staff overview' : 'Donor journeys'}</strong></div>
          <div className="console-topbar-actions"><span className="console-date"><CalendarDays size={14} />{formatDate(today, { weekday: 'short', day: 'numeric', month: 'short' })}</span><span className="console-site-pill"><span />Sandton Donor Centre</span></div>
        </header>
        {view === 'overview' ? <StaffOverview
          state={state}
          pendingPickups={pendingPickups}
          inTransit={inTransit}
          atCentre={atCentre}
          openExceptions={openExceptions}
          onOpenBooking={(item) => setDetailId(item.id)}
          onAuthorize={actions.authorizeReturn}
          onAssign={openAssignment}
          onNewBooking={() => setAssistedOpen(true)}
          onViewAll={() => setView('journeys')}
          onExceptions={() => actions.switchWorkspace('operations')}
        /> : <StaffJourneys
          state={state}
          bookings={visibleBookings}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          siteFilter={siteFilter}
          setSiteFilter={setSiteFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onOpenBooking={(item) => setDetailId(item.id)}
          onNewBooking={() => setAssistedOpen(true)}
        />}
      </section>
      {booking && <BookingDetailPanel booking={booking} state={state} actions={actions} role="staff" onClose={() => setDetailId(null)} onAssign={openAssignment} />}
      {assignContext && assignBooking && <AssignDriverModal
        state={state}
        booking={assignBooking}
        leg={assignContext.leg}
        onClose={() => setAssignContext(null)}
        onAssign={(driverId) => {
          actions.assignDriver(assignBooking.id, assignContext.leg, driverId, 'SANBS collection staff');
          setAssignContext(null);
        }}
      />}
      {assistedOpen && <StaffAssistedBookingModal state={state} onClose={() => setAssistedOpen(false)} onSubmit={handleCreated} />}
    </div>
  );
}

function filterBookings(bookings, { search, statusFilter, siteFilter, dateFilter }) {
  return bookings.filter((booking) => {
    const query = search.trim().toLowerCase();
    const textMatch = !query || [booking.donorName, booking.reference, booking.pickupAddress, booking.appointment.locationName].some((value) => value?.toLowerCase().includes(query));
    const status = getBookingStatus(booking);
    const filterMatch = statusFilter === 'all'
      || (statusFilter === 'active' && isBookingActive(booking))
      || (statusFilter === 'awaiting' && ['awaiting_assignment', 'return_awaiting_dispatch'].includes(status))
      || (statusFilter === 'return' && booking.returnRequested && !['completed', 'cancelled'].includes(status))
      || (statusFilter === 'exceptions' && booking.exceptions.some((item) => item.status === 'open'))
      || (statusFilter === 'completed' && ['completed', 'cancelled'].includes(status));
    const siteMatch = siteFilter === 'all' || booking.appointment.locationId === siteFilter;
    const today = localDateString();
    const dateMatch = dateFilter === 'all'
      || (dateFilter === 'today' && booking.appointment.date === today)
      || (dateFilter === 'upcoming' && booking.appointment.date >= today && booking.appointment.date <= dateAfter(7));
    return textMatch && filterMatch && siteMatch && dateMatch;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function StaffOverview({ state, pendingPickups, inTransit, atCentre, openExceptions, onOpenBooking, onAuthorize, onAssign, onNewBooking, onViewAll, onExceptions }) {
  const active = state.bookings.filter(isBookingActive).sort((a, b) => new Date(a.appointment.date + 'T' + a.appointment.time) - new Date(b.appointment.date + 'T' + b.appointment.time));
  const recent = state.bookings.flatMap((booking) => booking.history.map((event) => ({ ...event, booking }))).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 4);
  const metrics = [
    { label: 'Upcoming pickups', count: pendingPickups.length, icon: Clock3, tone: 'red' },
    { label: 'Donors in transit', count: inTransit.length, icon: NavigationIcon, tone: 'blue' },
    { label: 'At donation centre', count: state.bookings.filter((item) => item.outbound.status === 'arrived_at_site').length, icon: MapPin, tone: 'green' },
    { label: 'Return approvals', count: atCentre.length, icon: CheckCircle2, tone: atCentre.length > 0 ? 'amber' : 'grey' },
  ];
  return <div className="console-page staff-overview-page">
    <header className="staff-page-heading">
      <div><span className="eyebrow">SANBS COLLECTION · SANDTON</span><h1>Transport arrivals</h1><p>{formatDate(localDateString(), { weekday: 'long', day: 'numeric', month: 'long' })} · Donor journeys at your site</p></div>
      <div className="page-title-actions"><button className="button button-secondary" type="button" onClick={onViewAll}><ClipboardList size={15} /> Journey register</button><button className="button button-primary" type="button" onClick={onNewBooking}><Plus size={16} /> Book for a donor</button></div>
    </header>
    <div className="staff-status-band" aria-label="Today’s transport summary">{metrics.map(({ label, count, tone }, idx) => <div className={`staff-status-item${idx === 3 || (idx === 0 && count > 0) ? ' is-contrast' : ''}`} key={label}><strong className={tone === 'red' || tone === 'amber' ? 'is-accent' : ''}>{String(count).padStart(2, '0')}</strong><span>{label}</span></div>)}</div>
    <div className="staff-workbench">
      <section className="staff-arrivals-board">
        <div className="staff-board-heading"><div><span className="eyebrow">SHARED ARRIVAL BOARD</span><h2>Active donor journeys <span>{active.length}</span></h2></div><button className="text-action" type="button" onClick={onViewAll}>Open register <ArrowRight size={14} /></button></div>
        <div className="staff-board-columns"><span>Pickup</span><span>Donor / reference</span><span>Destination</span><span>Driver</span><span>Journey status</span></div>
        {active.length === 0 ? <EmptyState icon={MapPin} title="No arrivals in motion" description="New donor requests and assisted bookings appear here automatically." compact action={<button className="button button-secondary button-small" type="button" onClick={onNewBooking}><Plus size={14} /> Book transport</button>} /> : <div className="staff-journey-list">{active.slice(0, 8).map((booking) => <StaffJourneyRow key={booking.id} booking={booking} state={state} onOpen={() => onOpenBooking(booking)} onAuthorize={() => onAuthorize(booking.id)} onAssign={(leg) => onAssign(booking, leg)} />)}</div>}
      </section>
      <aside className="staff-action-rail">
        <section className="staff-rail-section">
          <div className="staff-rail-heading"><div><span className="eyebrow">ACTION REQUIRED</span><h2>Ready for return</h2></div><span className="staff-rail-count">{String(atCentre.length).padStart(2, '0')}</span></div>
          {atCentre.length === 0 ? <div className="staff-rail-empty"><CheckCircle2 size={15} /><span>Return authorisations appear here after a donor reaches the site.</span></div> : atCentre.map((booking) => <div className="staff-approval-line" key={booking.id}><div><strong>{booking.donorName}</strong><small>{booking.reference} · arrived at centre</small></div><button className="button button-primary button-small" type="button" onClick={() => onAuthorize(booking.id)}>Confirm donor ready for return <ArrowRight size={12} /></button></div>)}
          <p className="privacy-hint"><ShieldCheck size={13} /> Return dispatch waits for this confirmation.</p>
        </section>
        <section className="staff-rail-section staff-feed-section">
          <div className="staff-rail-heading"><div><span className="eyebrow">SHARED JOURNEY LOG</span><h2>Recent updates</h2></div><span className="activity-live-dot" /></div>
          {recent.length === 0 ? <p className="muted-line">Journey updates will appear here.</p> : <div className="staff-recent-list">{recent.map((item) => <button className="recent-update-row" key={item.id} type="button" onClick={() => onOpenBooking(item.booking)}><span className="recent-update-mark"><i /></span><span><strong>{item.label}</strong><small>{item.booking.donorName} · {item.by}</small></span><time>{new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(new Date(item.at))}</time></button>)}</div>}
          {openExceptions > 0 && <button className="exception-attention-row" type="button" onClick={onExceptions}><AlertCircle size={15} /><span>{openExceptions} operational exception{openExceptions === 1 ? '' : 's'} need attention</span><ChevronRight size={14} /></button>}
        </section>
        <p className="staff-note"><ShieldCheck size={14} /> Operational transport data only. No clinical detail is displayed.</p>
      </aside>
    </div>
  </div>;
}

function NavigationIcon(props) {
  return <MapPin {...props} />;
}

function StaffJourneyRow({ booking, state, onOpen, onAuthorize, onAssign }) {
  const driver = getDriver(state, booking.outbound.driverId);
  const needsReturn = booking.returnLeg?.status === 'waiting_authorisation' && booking.outbound.status === 'arrived_at_site';
  const needsAssign = booking.outbound.status === 'awaiting_assignment';
  return <article className="staff-journey-row">
    <button type="button" className="staff-journey-primary" onClick={onOpen}><span className="staff-journey-time">{formatTime(booking.pickupTime || '08:45')}<small>PICKUP</small></span><span className="staff-donor-name"><span className="donor-initial-small">{booking.donorName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span><strong>{booking.donorName}</strong><small>{booking.reference} <i className="origin-separator">·</i> {booking.origin === 'staff' ? 'Staff assisted' : 'Donor booked'}</small></span></span><span className="staff-journey-destination"><MapPin size={14} /><span><strong>{booking.appointment.locationName}</strong><small>{booking.pickupAddress}</small></span></span><span className="staff-journey-driver">{driver ? <><DriverAvatar driver={driver} size="small" /><span><strong>{driver.firstName}</strong><small>{driver.vehicle}</small></span></> : <span className="no-driver-label">{booking.returnLeg?.status === 'awaiting_dispatch' ? 'Return to dispatch' : 'No driver assigned'}</span>}</span><span className="staff-journey-status"><StatusChip booking={booking} compact /><small>Return · {getReturnStatusLabel(booking.returnLeg?.status)}</small></span><span className="staff-row-open" aria-hidden="true"><ChevronRight size={17} /></span></button>
    {(needsReturn || needsAssign) && <div className={`staff-journey-action-strip ${needsReturn ? 'action-return' : ''}`}>
      <span>{needsReturn ? <><CheckCircle2 size={13} /> Donor has arrived · return transport is held until SANBS confirms readiness</> : <><Clock3 size={13} /> Waiting for transport assignment</>}</span>
      {needsReturn ? <button type="button" className="text-action" onClick={onAuthorize}>Confirm donor ready for return <ArrowRight size={13} /></button> : <button type="button" className="text-action" onClick={() => onAssign('outbound')}>Assign driver <ArrowRight size={13} /></button>}
    </div>}
  </article>;
}

function StaffJourneys({ state, bookings, search, setSearch, statusFilter, setStatusFilter, siteFilter, setSiteFilter, dateFilter, setDateFilter, onOpenBooking, onNewBooking }) {
  return <div className="console-page staff-journeys-page">
    <div className="page-title-row"><div><span className="eyebrow">SANBS COLLECTION · SANDTON</span><h1>Donor journeys</h1><p>One transport record shared across donors, staff, drivers and dispatch.</p></div><button className="button button-primary" type="button" onClick={onNewBooking}><UserRoundPlus size={16} /> Book for a donor</button></div>
    <div className="journey-filter-bar">
      <div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search donor, reference or pickup" aria-label="Search journeys" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>}</div>
      <label className="filter-select"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="active">Active journeys</option><option value="awaiting">Awaiting action</option><option value="return">Return requested</option><option value="exceptions">Open exceptions</option><option value="completed">Completed</option></select></label>
      <label className="filter-select"><span>Donation site</span><select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}><option value="all">All locations</option>{LOCATIONS.map((item) => <option value={item.id} key={item.id}>{item.shortName}</option>)}</select></label>
      <label className="filter-select"><span>Date</span><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}><option value="today">Today</option><option value="upcoming">Next 7 days</option><option value="all">All dates</option></select></label>
      <span className="filter-result-count">{bookings.length} {bookings.length === 1 ? 'journey' : 'journeys'}</span>
    </div>
    <div className="staff-table-wrap">
      <table className="staff-journey-table">
        <thead><tr><th>Donor</th><th>Booking / pickup</th><th>Donation site</th><th>Appointment</th><th>Driver</th><th>Status</th><th>Return</th><th aria-label="Actions" /></tr></thead>
        <tbody>{bookings.map((booking) => {
          const driver = getDriver(state, booking.outbound.driverId);
          return <tr key={booking.id} onClick={() => onOpenBooking(booking)}>
            <td><div className="table-donor-cell"><span className="donor-initial-small">{booking.donorName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span><strong>{booking.donorName}</strong><small>{booking.origin === 'staff' ? 'Staff assisted' : 'Donor self-booked'}</small></span></div></td>
            <td><strong className="table-ref">{booking.reference}</strong><small>{booking.pickupAddress}</small></td>
            <td><strong>{booking.appointment.locationName}</strong><small>{booking.appointment.locationKind}</small></td>
            <td><strong>{formatTime(booking.appointment.time)}</strong><small>{formatDate(booking.appointment.date)}</small></td>
            <td>{driver ? <div className="table-driver-cell"><DriverAvatar driver={driver} size="small" /><span><strong>{driver.firstName}</strong><small>{driver.vehicle}</small></span></div> : <span className="no-driver-label">Unassigned</span>}</td>
            <td><StatusChip booking={booking} compact /></td>
            <td><span className={`return-table-status ${booking.returnLeg?.status === 'waiting_authorisation' ? 'return-waiting' : ''}`}>{getReturnStatusLabel(booking.returnLeg?.status)}</span></td>
            <td><button className="table-open-button" type="button" aria-label={`Open ${booking.reference}`} onClick={(event) => { event.stopPropagation(); onOpenBooking(booking); }}><ChevronRight size={16} /></button></td>
          </tr>;
        })}</tbody>
      </table>
      {bookings.length === 0 && <EmptyState icon={Search} title="No journeys found" description="Try another search term or clear your filters." compact />}
    </div>
    <div className="table-footer-note"><ShieldCheck size={13} /> Donor information is used for transport coordination only.</div>
  </div>;
}

function StaffAssistedBookingModal({ state, onClose, onSubmit }) {
  const dialogRef = useDialogA11y(onClose);
  const donors = useMemo(() => {
    const known = new Map([
      ['donor-thabo', { id: 'donor-thabo', name: 'Thabo Mokoena', phone: '082 555 0142' }],
      ['donor-musa', { id: 'donor-musa', name: 'Musa Dube', phone: '082 440 0186' }],
    ]);
    state.bookings.forEach((booking) => {
      if (booking.donorId && booking.donorName) known.set(booking.donorId, { id: booking.donorId, name: booking.donorName, phone: booking.donorPhone || booking.contactNumber || '' });
    });
    return [...known.values()];
  }, [state.bookings]);
  const [donorId, setDonorId] = useState('donor-thabo');
  const [search, setSearch] = useState('');
  const [newDonor, setNewDonor] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [locationId, setLocationId] = useState('sandton-centre');
  const [appointmentDate, setAppointmentDate] = useState(localDateString());
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [pickupAddress, setPickupAddress] = useState('22 West Street, Sandown, Sandton, Johannesburg');
  const [contactNumber, setContactNumber] = useState('082 555 0142');
  const [pickupNotes, setPickupNotes] = useState('');
  const [returnRequested, setReturnRequested] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const matches = donors.filter((donor) => `${donor.name} ${donor.phone}`.toLowerCase().includes(search.toLowerCase()));
  const selectedDonor = donors.find((donor) => donor.id === donorId);
  const chooseDonor = (donor) => {
    setDonorId(donor.id);
    setNewDonor(false);
    setNewName(donor.name);
    setNewPhone(donor.phone);
    setContactNumber(donor.phone);
  };
  const submit = () => {
    const donorName = newDonor ? newName.trim() : (selectedDonor?.name || newName.trim());
    if (!donorName || !pickupAddress.trim()) { setError('Select a donor and add a pickup address.'); return; }
    if (!appointmentDate || appointmentDate < localDateString()) { setError('Choose an appointment date that is today or later.'); return; }
    onSubmit({
      donorId: newDonor ? `donor-${Date.now()}` : donorId,
      donorName,
      donorPhone: newDonor ? newPhone : selectedDonor?.phone,
      contactNumber,
      locationId,
      appointmentDate,
      appointmentTime,
      pickupTime: '08:45',
      pickupAddress,
      pickupNotes,
      returnRequested,
      notes,
      requirements: [],
    });
  };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section ref={dialogRef} tabIndex={-1} className="modal-frame modal-large assisted-booking-modal" role="dialog" aria-modal="true" aria-label="Create staff-assisted transport booking">
      <header className="modal-header"><div><span className="eyebrow">STAFF-ASSISTED BOOKING</span><h2>Book transport for a donor</h2><p>This creates the same journey record a donor would create in the app.</p></div><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><span>×</span></button></header>
      <div className="modal-body assisted-booking-body">
        <div className="assisted-donor-column">
          <div className="form-section-heading"><span>01</span><div><strong>Find the donor</strong><small>Search an existing donor or add a new contact.</small></div></div>
          {!newDonor && <>
            <div className="search-field assisted-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or mobile number" /><UserRoundPlus size={15} /></div>
            <div className="donor-search-results">{matches.map((donor) => <button key={donor.id} type="button" className={`donor-search-result ${donor.id === donorId ? 'selected' : ''}`} onClick={() => chooseDonor(donor)}><span className="donor-initial-small">{donor.name.split(' ').map((item) => item[0]).slice(0, 2).join('')}</span><span><strong>{donor.name}</strong><small>{donor.phone}</small></span>{donor.id === donorId && <Check size={16} />}</button>)}</div>
            <button type="button" className="add-donor-link" onClick={() => { setNewDonor(true); setNewName(''); setNewPhone(''); setContactNumber(''); }}><Plus size={14} /> Donor not listed? Add details</button>
          </>}
          {newDonor && <div className="new-donor-form"><div className="new-donor-form-head"><strong>New donor contact</strong><button type="button" className="text-action" onClick={() => setNewDonor(false)}>Choose existing</button></div><label className="field"><span className="field-label">Donor name</span><input className="text-input" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Full name" /></label><label className="field"><span className="field-label">Mobile number</span><input className="text-input" value={newPhone} onChange={(event) => { setNewPhone(event.target.value); setContactNumber(event.target.value); }} placeholder="082 555 0100" /></label></div>}
          <div className="assisted-staff-note"><ShieldCheck size={14} /><span>Book only with the donor’s consent. No clinical details are collected.</span></div>
        </div>
        <div className="assisted-details-column">
          <div className="form-section-heading"><span>02</span><div><strong>Journey details</strong><small>Choose the destination, pickup and return requirement.</small></div></div>
          <div className="assisted-form-grid">
            <label className="field full-span"><span className="field-label">Donation appointment site</span><select className="text-input" value={locationId} onChange={(event) => setLocationId(event.target.value)}>{LOCATIONS.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.kind}</option>)}</select></label>
            <label className="field"><span className="field-label">Appointment date</span><input className="text-input" type="date" min={localDateString()} value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} /></label>
            <label className="field"><span className="field-label">Appointment time</span><select className="text-input" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)}>{['09:00', '10:00', '11:00', '12:00', '13:30', '14:30', '15:30'].map((time) => <option key={time} value={time}>{formatTime(time)}</option>)}</select></label>
            <label className="field full-span"><span className="field-label">Pickup address</span><input className="text-input" value={pickupAddress} onChange={(event) => setPickupAddress(event.target.value)} placeholder="Street, suburb and city" /></label>
            <label className="field"><span className="field-label">Contact number</span><input className="text-input" type="tel" value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} placeholder="082 555 0100" /></label>
            <label className="field"><span className="field-label">Pickup note <span className="optional-label">optional</span></span><input className="text-input" value={pickupNotes} onChange={(event) => setPickupNotes(event.target.value)} placeholder="Gate or meeting point" /></label>
            <button type="button" className={`return-toggle-row ${returnRequested ? 'selected' : ''}`} onClick={() => setReturnRequested((value) => !value)}><span className="check-box">{returnRequested && <Check size={12} />}</span><span><strong>Return transport required</strong><small>SANBS staff will authorise dispatch when donor is ready.</small></span></button>
            <label className="field full-span"><span className="field-label">Operational note <span className="optional-label">optional</span></span><textarea className="text-input textarea" rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Transport-specific information only" /></label>
          </div>
          {error && <div className="form-error"><AlertCircle size={14} />{error}</div>}
        </div>
      </div>
      <footer className="modal-footer assisted-booking-footer"><span><ShieldCheck size={14} /> Donor receives a journey update in their app</span><div><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="button" onClick={submit}><Check size={15} /> Create transport booking</button></div></footer>
    </section>
  </div>;
}
