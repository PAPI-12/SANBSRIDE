import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  Phone,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  FileText,
  MapPin,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Truck,
  UserRound,
  X,
  UsersRound,
} from 'lucide-react';
import {
  OPERATING_MODELS,
  formatDate,
  formatTime,
  getDriver,
  getEligibleDrivers,
  getDriverAvailability,
  getStatusMeta,
} from '../domain.js';
import {
  DriverAvatar,
  EmptyState,
  OriginTag,
  StatusChip,
} from '../components/Shared.jsx';
import JourneyMap from '../components/JourneyMap.jsx';
import { AssignDriverModal, BookingDetailPanel } from '../components/WorkflowModals.jsx';

const OPS_NAV = [
  { id: 'dispatch', label: 'Dispatch', icon: Activity },
  { id: 'trips', label: 'All trips', icon: FileText },
  { id: 'drivers', label: 'Drivers & resources', icon: UsersRound },
  { id: 'exceptions', label: 'Exceptions', icon: AlertCircle },
  { id: 'model', label: 'Operating model', icon: Settings2 },
];

export function OperationsApp({ state, actions }) {
  const [view, setView] = useState('dispatch');
  const [detailId, setDetailId] = useState(null);
  const [assignContext, setAssignContext] = useState(null);
  const [search, setSearch] = useState('');
  const [tripFilter, setTripFilter] = useState('all');
  const detail = state.bookings.find((booking) => booking.id === detailId) || null;
  const dispatchItems = useMemo(() => getDispatchItems(state.bookings), [state.bookings]);
  const activeTrips = getAllTripLegs(state.bookings).filter((item) => ['driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_picked_up', 'donor_on_the_way_home'].includes(item.leg.status));
  const openExceptions = state.bookings.reduce((total, booking) => total + booking.exceptions.filter((item) => item.status === 'open').length, 0);
  const availableDrivers = state.drivers.filter((driver) => getDriverAvailability(state, driver.id) === 'available');
  const assignBooking = state.bookings.find((booking) => booking.id === assignContext?.bookingId);

  const openAssignment = (booking, leg) => setAssignContext({ bookingId: booking.id, leg });
  const assign = (driverId) => {
    if (!assignContext) return;
    actions.assignDriver(assignContext.bookingId, assignContext.leg, driverId, 'Transport operations');
    setAssignContext(null);
  };

  return (
    <div className={`console-layout operations-console ${view === 'dispatch' ? 'operations-map-mode' : ''}`}>
      <aside className="console-sidebar operations-sidebar">
        <div className="ops-sidebar-brand"><span className="console-workspace-title">Transport<small>Operations</small></span></div>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="console-nav" aria-label="Transport operations navigation">
          {OPS_NAV.map(({ id, label, icon: Icon }) => {
            const count = id === 'dispatch' ? dispatchItems.length : id === 'trips' ? activeTrips.length : id === 'drivers' ? availableDrivers.length : id === 'exceptions' ? openExceptions : null;
            return <button type="button" key={id} className={view === id ? 'console-nav-item active' : 'console-nav-item'} onClick={() => setView(id)} title={label}><Icon size={17} /><span>{label}</span>{count !== null && <span className={`nav-count ${id === 'exceptions' && count > 0 ? 'nav-count-alert' : ''}`}>{count}</span>}</button>;
          })}
        </nav>
        <div className="sidebar-rule" />
        <div className="ops-model-sidebar"><span className="eyebrow">CURRENT MODEL</span><strong>{OPERATING_MODELS[state.operatingModel]?.title}</strong><button type="button" onClick={() => setView('model')}>Change model <ArrowRight size={13} /></button></div>
        <div className="ops-location-sidebar"><MapPin size={14} /><span><strong>Johannesburg North</strong><small>Sandton · Rosebank · Randburg</small></span></div>
        <div className="sidebar-user"><span className="staff-user-avatar ops-user-avatar">TO</span><div><strong>Thandi Operations</strong><small>Transport coordinator</small></div><span className="online-indicator" /></div>
      </aside>
      <section className="console-main operations-main">
        <header className="console-topbar">
          <div className="console-breadcrumb"><span>TRANSPORT OPERATIONS</span><i>/</i><strong>{OPS_NAV.find((item) => item.id === view)?.label}</strong></div>
          <div className="console-topbar-actions"><span className="ops-live-status"><i />Shared workspace</span><span className="ops-model-top-pill">{OPERATING_MODELS[state.operatingModel]?.title}</span></div>
        </header>
        {view === 'dispatch' && <DispatchView
          state={state}
          actions={actions}
          items={dispatchItems}
          activeTrips={activeTrips}
          openExceptions={openExceptions}
          onOpen={(booking) => setDetailId(booking.id)}
          onAssign={openAssignment}
          onViewTrips={() => setView('trips')}
          onViewDrivers={() => setView('drivers')}
          onViewExceptions={() => setView('exceptions')}
        />}
        {view === 'trips' && <AllTripsView
          state={state}
          search={search}
          setSearch={setSearch}
          filter={tripFilter}
          setFilter={setTripFilter}
          onOpen={(booking) => setDetailId(booking.id)}
          onAssign={openAssignment}
        />}
        {view === 'drivers' && <DriversView state={state} actions={actions} onOpenBooking={(booking) => setDetailId(booking.id)} />}
        {view === 'exceptions' && <ExceptionsView state={state} actions={actions} onOpenBooking={(booking) => setDetailId(booking.id)} />}
        {view === 'model' && <OperatingModelView state={state} actions={actions} />}
      </section>
      {detail && <BookingDetailPanel booking={detail} state={state} actions={actions} role="operations" onClose={() => setDetailId(null)} onAssign={openAssignment} />}
      {assignContext && assignBooking && <AssignDriverModal state={state} booking={assignBooking} leg={assignContext.leg} onClose={() => setAssignContext(null)} onAssign={assign} />}
    </div>
  );
}

function getDispatchItems(bookings) {
  const items = [];
  bookings.forEach((booking) => {
    if (booking.outbound.status === 'awaiting_assignment') items.push({ booking, legName: 'outbound', leg: booking.outbound });
    if (booking.returnLeg?.status === 'awaiting_dispatch') items.push({ booking, legName: 'return', leg: booking.returnLeg });
  });
  return items.sort((a, b) => {
    if (a.legName !== b.legName) return a.legName === 'return' ? -1 : 1;
    return new Date(`${a.booking.appointment.date}T${a.booking.appointment.time}`) - new Date(`${b.booking.appointment.date}T${b.booking.appointment.time}`);
  });
}

function getAllTripLegs(bookings) {
  const trips = [];
  bookings.forEach((booking) => {
    if (booking.outbound.status !== 'cancelled') trips.push({ booking, legName: 'outbound', leg: booking.outbound });
    if (booking.returnRequested && !['not_required', 'cancelled'].includes(booking.returnLeg?.status)) trips.push({ booking, legName: 'return', leg: booking.returnLeg });
  });
  return trips;
}

function shortPlaceLabel(value = '') {
  return String(value).split(',')[0].trim().replace(/^SANBS\s+/i, '').replace(/\s+Donor Centre$/i, '') || String(value);
}

function DispatchView({ state, actions, items, activeTrips, openExceptions, onOpen, onAssign, onViewTrips, onViewDrivers, onViewExceptions }) {
  const [selectedKey, setSelectedKey] = useState('');
  const [isCompactMap, setIsCompactMap] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 700 : false));
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(max-width: 700px)');
    const sync = () => setIsCompactMap(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  const live = activeTrips.slice(0, 4);
  const allSelectable = [...items, ...live];
  const tripKey = (trip) => `${trip.booking.id}-${trip.legName}`;
  const selected = allSelectable.find((trip) => tripKey(trip) === selectedKey) || items[0] || live[0] || null;
  const selectedBooking = selected?.booking || null;
  const legName = selected?.legName || 'outbound';
  const selectedLeg = selected?.leg || selectedBooking?.[legName === 'return' ? 'returnLeg' : 'outbound'];
  const returning = legName === 'return';
  const routeFrom = returning ? selectedBooking?.appointment.locationName : selectedBooking?.pickupAddress;
  const routeTo = returning ? selectedBooking?.pickupAddress : selectedBooking?.appointment.locationName;
  const needsAssignment = ['awaiting_assignment', 'awaiting_dispatch'].includes(selectedLeg?.status);
  const selectedDriver = selected && selectedLeg?.driverId ? getDriver(state, selectedLeg.driverId) : null;
  const driverAvailability = selectedDriver ? getDriverAvailability(state, selectedDriver.id) : null;
  const eligibleResources = getEligibleDrivers(state, legName, selectedBooking);
  const areaLabel = selectedBooking?.appointment.locationName
    ?.replace(/^SANBS\s+/i, '')
    .replace(/\s+(Donor Centre|Centre)$/i, '') || 'Johannesburg North';
  const tripLabel = returning ? 'Return journey' : 'Donation pickup';

  return <div className="console-page ops-dispatch-page ops-map-page">
    <div className="dispatch-control-room dispatch-map-first">
      <aside className="dispatch-feed dispatch-route-sidebar" aria-label="Selected route and dispatch queue">
        <div className="dispatch-sidebar-brand"><span className="dispatch-rail-title">Route</span><span>TRANSPORT DESK</span></div>
        <div className="dispatch-route-heading"><div><span className="eyebrow">JOURNEY OVERVIEW</span><h1>Route</h1></div><button type="button" onClick={onViewTrips} aria-label="Open all trips" title="Open all trips"><Plus size={17} /></button></div>
        {selectedBooking ? <section className="dispatch-route-card" aria-label="Selected journey route">
          <div className="dispatch-sidebar-stops">
            <div className="dispatch-sidebar-stop"><i className="dispatch-stop-dot stop-pickup" /><div><small>{returning ? 'PICKUP POINT' : 'DONOR PICKUP'}</small><strong>{routeFrom}</strong><span>{returning ? 'SANBS collection site' : `${formatTime(selectedBooking.pickupTime || '08:45')} · planned pickup`}</span></div></div>
            <div className="dispatch-sidebar-route-line" />
            <div className="dispatch-sidebar-stop"><i className="dispatch-stop-dot stop-destination" /><div><small>{returning ? 'DROP-OFF' : 'DONATION SITE'}</small><strong>{routeTo}</strong><span>{returning ? 'Donor home' : `Appointment · ${formatTime(selectedBooking.appointment.time)}`}</span></div></div>
          </div>
          <div className="dispatch-route-reference"><span>{selectedBooking.reference}</span><StatusChip booking={selectedBooking} compact /></div>
          <div className="dispatch-route-actions"><button type="button" className="button button-primary button-wide" onClick={() => selected && needsAssignment ? onAssign(selectedBooking, legName) : onOpen(selectedBooking)}>{selected && needsAssignment ? 'Assign a resource' : 'Open journey details'} <ArrowRight size={14} /></button></div>
        </section> : <div className="dispatch-sidebar-empty-route"><span className="dispatch-sidebar-empty-icon"><MapPin size={15} /></span><strong>No journey selected</strong><p>Choose a queued or in-progress trip to view its route.</p><button type="button" className="dispatch-side-link" onClick={onViewTrips}>Browse all trips <ArrowRight size={13} /></button></div>}

        <div className="dispatch-sidebar-metrics" aria-label="Dispatch summary">
          <button type="button" onClick={onViewTrips}><strong>{String(items.length).padStart(2, '0')}</strong><span>To assign</span></button>
          <button type="button" onClick={onViewDrivers}><strong>{String(eligibleResources.length).padStart(2, '0')}</strong><span>Available</span></button>
          <button type="button" onClick={onViewExceptions} className={openExceptions > 0 ? 'has-alert' : ''}><strong>{String(openExceptions).padStart(2, '0')}</strong><span>Issues</span></button>
        </div>

        <section className="dispatch-side-section dispatch-side-queue">
          <div className="dispatch-side-section-heading"><div><span className="eyebrow">NEXT ACTIONS</span><h2>Dispatch queue</h2></div><span className="dispatch-side-count">{items.length}</span></div>
          {items.length === 0 ? <div className="dispatch-side-empty"><CheckCircle2 size={15} /><span>Nothing waiting for assignment.</span></div> : <div className="dispatch-side-queue-list">{items.slice(0, 4).map((item) => {
            const key = tripKey(item);
            const isSelected = selected && key === tripKey(selected);
            const isReturn = item.legName === 'return';
            return <article className={`dispatch-side-queue-item ${isSelected ? 'is-selected' : ''}`} key={key}>
              <button type="button" className="dispatch-side-queue-open" onClick={() => setSelectedKey(key)} aria-pressed={Boolean(isSelected)}>
                <span className={`dispatch-side-queue-dot ${isReturn ? 'is-return' : ''}`} />
                <span><strong>{item.booking.donorName}</strong><small>{item.booking.reference} · {isReturn ? 'Return' : 'Pickup'}</small></span>
                <ChevronRight size={15} />
              </button>
              <button type="button" className="dispatch-side-queue-assign" onClick={() => onAssign(item.booking, item.legName)}>Assign resource <ArrowRight size={12} /></button>
            </article>;
          })}</div>}
          {items.length > 4 && <button type="button" className="dispatch-side-link" onClick={onViewTrips}>View all {items.length} trips <ArrowRight size={13} /></button>}
        </section>

        <section className="dispatch-side-section dispatch-side-resources">
          <div className="dispatch-side-section-heading"><div><span className="eyebrow">OPERATING MODEL</span><h2>{OPERATING_MODELS[state.operatingModel]?.title}</h2></div><button type="button" className="dispatch-side-manage" onClick={onViewDrivers}>Manage <ArrowRight size={12} /></button></div>
          {eligibleResources.length === 0 ? <div className="dispatch-side-empty"><AlertCircle size={15} /><span>No eligible resources available right now.</span></div> : eligibleResources.slice(0, 3).map((driver) => <button type="button" className="dispatch-eligible-resource" key={driver.id} onClick={onViewDrivers}><DriverAvatar driver={driver} size="small" /><span><strong>{driver.firstName}</strong><small>{driver.vehicle}</small></span><i className="availability-dot dot-available" /></button>)}
        </section>
        <p className="dispatch-sidebar-note"><ShieldCheck size={13} /> Status is shared live across all four workspaces.</p>
      </aside>

      <section className="dispatch-map-rail" aria-label="Route map">
        <div className="dispatch-map-heading"><div><span className="eyebrow">JOHANNESBURG · ROUTE PREVIEW</span><strong>{areaLabel} · Gauteng</strong></div><span className="map-live-label">LIVE VIEW</span></div>
        <div className="dispatch-map-stage">
          {selectedBooking ? <JourneyMap
            booking={selectedBooking}
            leg={legName}
            from={routeFrom}
            to={routeTo}
            controls
            scrollWheelZoom
            fitPaddingTopLeft={isCompactMap ? [28, 36] : [48, 92]}
            fitPaddingBottomRight={isCompactMap ? [28, 72] : [344, 84]}
            maxFitZoom={13}
            className="dispatch-live-map"
          /> : <div className="dispatch-map-empty" role="status"><span><MapPin size={20} /></span><strong>No route selected</strong><p>Select a queued or in-progress journey to preview its route.</p><button type="button" className="button button-secondary button-small" onClick={onViewTrips}>Browse all trips <ArrowRight size={13} /></button></div>}
          {selectedBooking && <aside className="dispatch-map-selected-card" aria-label={selectedDriver ? 'Assigned driver and trip' : 'Driver assignment'}>
            <div className="map-selected-topline"><span>{selectedDriver ? 'DRIVER' : 'DRIVER ASSIGNMENT'}</span>{selected && <StatusChip booking={selectedBooking} compact />}</div>
            {selectedDriver ? <>
              <div className="map-driver-profile"><DriverAvatar driver={selectedDriver} /><span><small>{selectedDriver.typeLabel}</small><strong>{selectedDriver.name}</strong></span><span className={`map-driver-availability availability-${driverAvailability}`}><i />{driverAvailability === 'on_trip' ? 'On trip' : driverAvailability === 'available' ? 'Available' : 'Offline'}</span></div>
              <div className="map-driver-vehicle"><div><small>ASSIGNED VEHICLE</small><strong>{selectedDriver.vehicle}</strong><span>{selectedDriver.registration}</span></div><Truck size={20} /></div>
              <div className="map-driver-current-trip"><small>CURRENT TRIP · {selectedBooking.reference}</small><strong>{tripLabel}</strong><span>{getStatusMeta(selectedBooking).label}</span></div>
              <div className="map-driver-quick-actions" aria-label="Driver contact">
                <button type="button" onClick={() => actions.showToast(`Call ${selectedDriver.name} · ${selectedDriver.phone}`)} aria-label={`Call ${selectedDriver.name}`} title={`Call ${selectedDriver.name}`}><Phone size={16} /></button>
                <button type="button" onClick={() => actions.showToast(`Message sent to ${selectedDriver.firstName} in the driver app.`)} aria-label={`Message ${selectedDriver.name}`} title={`Message ${selectedDriver.name}`}><MessageSquare size={16} /></button>
                <button type="button" onClick={() => onAssign(selectedBooking, legName)} aria-label="Reassign this trip" title="Reassign this trip"><X size={16} /></button>
              </div>
              <div className="map-selected-actions"><button type="button" className="button button-primary button-wide" onClick={() => onOpen(selectedBooking)}>Open journey <ArrowRight size={14} /></button><button type="button" className="map-change-resource" onClick={() => onAssign(selectedBooking, legName)}>Change resource</button></div>
            </> : <>
              <strong className="map-no-driver-title">{selected ? 'No driver assigned yet' : 'No active trip selected'}</strong>
              <p className="map-no-driver-copy">{selected ? 'Choose an eligible resource to continue this journey.' : 'Select a request from the dispatch queue to see its route.'}</p>
              <div className="map-selected-actions"><button type="button" className="button button-primary button-wide" onClick={() => selected && needsAssignment ? onAssign(selectedBooking, legName) : onViewTrips()}>{selected && needsAssignment ? 'Assign resource' : 'Browse all trips'} <ArrowRight size={14} /></button>{selected && <button type="button" className="map-change-resource" onClick={() => onOpen(selectedBooking)}>Open journey</button>}</div>
            </>}
          </aside>}
          {selectedBooking && <div className="dispatch-route-summary-pill" aria-hidden="true">
            <span className="summary-pill-point"><i className="is-origin" /><span>{shortPlaceLabel(routeFrom)}</span></span>
            <ArrowRight size={12} />
            <span className="summary-pill-point"><i className="is-dest" /><span>{shortPlaceLabel(routeTo)}</span></span>
          </div>}
        </div>
      </section>
    </div>
  </div>;
}

function findCurrentAssignment(state, driverId) {
  for (const booking of state.bookings) {
    if (booking.outbound.driverId === driverId && !['arrived_at_site', 'completed', 'cancelled'].includes(booking.outbound.status)) return { booking, legName: 'outbound' };
    if (booking.returnLeg?.driverId === driverId && ['driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_on_the_way_home'].includes(booking.returnLeg.status)) return { booking, legName: 'return' };
  }
  return null;
}

function AllTripsView({ state, search, setSearch, filter, setFilter, onOpen, onAssign }) {
  const trips = useMemo(() => getAllTripLegs(state.bookings).filter((item) => {
    const query = search.trim().toLowerCase();
    const matchSearch = !query || [item.booking.reference, item.booking.donorName, item.booking.pickupAddress, item.booking.appointment.locationName].some((value) => value?.toLowerCase().includes(query));
    const status = item.leg.status;
    const matchFilter = filter === 'all' || (filter === 'active' && ['driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_picked_up', 'donor_on_the_way_home'].includes(status)) || (filter === 'unassigned' && ['awaiting_assignment', 'awaiting_dispatch'].includes(status)) || (filter === 'completed' && ['completed', 'arrived_at_site'].includes(status));
    return matchSearch && matchFilter;
  }), [state.bookings, search, filter]);
  return <div className="console-page ops-trips-page">
    <div className="page-title-row"><div><span className="eyebrow">OPERATIONS REGISTER</span><h1>All trips</h1><p>Outbound and return legs are tracked separately on one donor journey.</p></div><div className="page-title-actions"><span className="ops-record-count">{trips.length} trip records</span></div></div>
    <div className="journey-filter-bar ops-filter-bar"><div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search trip, donor or route" aria-label="Search trips" /></div><label className="filter-select"><span>View</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All trips</option><option value="active">In progress</option><option value="unassigned">Needs assignment</option><option value="completed">Completed</option></select></label><span className="filter-result-count">{trips.length} records</span></div>
    <div className="ops-table-wrap"><table className="ops-trip-table"><thead><tr><th>Trip ID</th><th>Donor</th><th>Route</th><th>Scheduled</th><th>Type</th><th>Driver / resource</th><th>Status</th><th>Priority</th><th /></tr></thead><tbody>{trips.map((item) => {
      const isReturn = item.legName === 'return';
      const driver = getDriver(state, item.leg.driverId);
      const status = item.leg.status;
      return <tr key={`${item.booking.id}-${item.legName}`} onClick={() => onOpen(item.booking)}>
        <td><strong>{item.booking.reference}-{isReturn ? 'R' : 'O'}</strong><small>{isReturn ? 'Return leg' : 'Outbound leg'}</small></td><td><strong>{item.booking.donorName}</strong><small>{item.booking.origin === 'staff' ? 'Staff assisted' : 'Donor self-booked'}</small></td>
        <td><div className="ops-route-cell"><span>{isReturn ? item.booking.appointment.locationName : item.booking.pickupAddress}</span><ArrowRight size={12} /><span>{isReturn ? item.booking.pickupAddress : item.booking.appointment.locationName}</span></div></td>
        <td><strong>{isReturn ? 'Ready now' : formatTime(item.booking.pickupTime || '08:45')}</strong><small>{formatDate(item.booking.appointment.date)}</small></td><td><span className={`trip-type-pill ${isReturn ? 'trip-type-return' : ''}`}>{isReturn ? 'RETURN' : 'OUTBOUND'}</span></td>
        <td>{driver ? <div className="table-driver-cell"><DriverAvatar driver={driver} size="small" /><span><strong>{driver.name}</strong><small>{driver.vehicle}</small></span></div> : <span className="no-driver-label">Unassigned</span>}</td><td><StatusChip status={statusToBookingState(item.booking, item.legName)} compact /></td><td><span className="priority-label"><i />Standard</span></td><td><button className="table-open-button" type="button" aria-label="Open trip" onClick={(event) => { event.stopPropagation(); onOpen(item.booking); }}><ChevronRight size={15} /></button></td>
      </tr>;
    })}</tbody></table>{trips.length === 0 && <EmptyState icon={Search} title="No trips match your filters" description="Clear search or switch the trip status filter." compact />}</div>
    <div className="table-footer-note"><ShieldCheck size={13} /> Statuses update as drivers and partners report progress · refresh for the latest.</div>
  </div>;
}

function statusToBookingState(booking, legName) {
  if (legName === 'return') {
    const status = booking.returnLeg.status;
    const map = { waiting_authorisation: 'return_waiting_authorisation', awaiting_dispatch: 'return_awaiting_dispatch', driver_assigned: 'return_driver_assigned', driver_on_the_way: 'return_driver_on_the_way', driver_arrived: 'return_driver_arrived', donor_on_the_way_home: 'donor_on_the_way_home', completed: 'completed' };
    return map[status] || 'awaiting_assignment';
  }
  if (booking.outbound.status === 'arrived_at_site') return booking.returnRequested ? 'awaiting_return_authorisation' : 'completed';
  return booking.outbound.status;
}

function DriversView({ state, actions, onOpenBooking }) {
  const drivers = state.drivers;
  const statusLabel = (status, provider) => provider ? 'Partner dispatch' : status === 'on_trip' ? 'On another trip' : status === 'available' ? 'Available' : 'Offline';
  return <div className="console-page ops-drivers-page">
    <div className="page-title-row"><div><span className="eyebrow">SUPPLY MANAGEMENT</span><h1>Drivers & resources</h1><p>Review approved resources and current assignment status.</p></div><div className="driver-supply-summary"><span><i className="availability-dot dot-available" />{drivers.filter((driver) => getDriverAvailability(state, driver.id) === 'available').length} available</span><span><i className="availability-dot dot-on_trip" />{drivers.filter((driver) => getDriverAvailability(state, driver.id) === 'on_trip').length} on trip</span></div></div>
    <div className="driver-roster-toolbar"><span className="roster-count">{drivers.length} registered resources</span><span className="roster-type-key"><span className="type-key-dot type-sanbs" />SANBS fleet <span className="type-key-dot type-independent" />Independent <span className="type-key-dot type-partner" />Partner</span></div>
    <div className="driver-roster-table-wrap"><table className="driver-roster-table"><thead><tr><th>Resource</th><th>Type / verification</th><th>Vehicle</th><th>Contact</th><th>Availability</th><th>Current assignment</th><th>Actions</th></tr></thead><tbody>{drivers.map((driver) => {
      const status = getDriverAvailability(state, driver.id);
      const assignment = findCurrentAssignment(state, driver.id);
      return <tr key={driver.id}>
        <td><div className="roster-name-cell"><DriverAvatar driver={driver} /><span><strong>{driver.name}</strong><small>{driver.isProvider ? 'Provider dispatch resource' : `Driver ID · ${driver.id.slice(-4).toUpperCase()}`}</small></span></div></td>
        <td><span className={`resource-type-tag type-${driver.type}`}>{driver.typeLabel}</span><small className="verification-line"><CheckCircle2 size={12} />{driver.verification}</small></td>
        <td><strong>{driver.vehicle}</strong><small>{driver.registration}</small></td><td><strong>{driver.phone}</strong><small>Contact via operations only</small></td>
        <td><span className={`roster-availability availability-${status}`}><i className={`availability-dot dot-${status}`} />{statusLabel(status, driver.isProvider)}</span></td>
        <td>{assignment ? <button type="button" className="current-assignment-link" onClick={() => onOpenBooking(assignment.booking)}><strong>{assignment.booking.donorName}</strong><small>{assignment.booking.reference} · {assignment.legName === 'return' ? 'Return' : 'Outbound'}</small></button> : <span className="no-assignment-cell">—</span>}</td>
        <td>{driver.isProvider ? <span className="provider-managed-note">Provider-managed</span> : <button type="button" className={`availability-action ${driver.online ? 'action-offline' : 'action-online'}`} disabled={status === 'on_trip'} onClick={() => actions.toggleDriverAvailability(driver.id)}>{driver.online ? 'Set offline' : 'Set available'}</button>}</td>
      </tr>;
    })}</tbody></table></div>
    <div className="driver-roster-foot"><ShieldCheck size={14} /><span>Availability updates live from the driver app.</span></div>
  </div>;
}

function ExceptionsView({ state, actions, onOpenBooking }) {
  const exceptions = state.bookings.flatMap((booking) => booking.exceptions.map((exception) => ({ booking, exception }))).sort((a, b) => new Date(b.exception.at) - new Date(a.exception.at));
  const open = exceptions.filter((item) => item.exception.status === 'open');
  const resolved = exceptions.filter((item) => item.exception.status === 'resolved');
  return <div className="console-page ops-exceptions-page">
    <div className="page-title-row"><div><span className="eyebrow">SERVICE RECOVERY</span><h1>Exceptions</h1><p>Resolve trip interruptions and keep collection staff informed.</p></div><span className={`exception-page-count ${open.length > 0 ? 'count-alert' : ''}`}><AlertCircle size={15} />{open.length} open</span></div>
    <div className="exception-layout-grid">
      <section className="exception-queue-section"><div className="exception-section-heading"><div><h2>Needs attention</h2><p>Issues reported by drivers, donors and collection staff.</p></div><span>{open.length}</span></div>
        {open.length === 0 ? <EmptyState icon={CheckCircle2} title="No open exceptions" description="If a driver or donor reports an issue, it will appear here for follow-up." compact /> : <div className="exception-card-list">{open.map(({ booking, exception }) => <ExceptionCard key={exception.id} booking={booking} exception={exception} onOpen={() => onOpenBooking(booking)} onResolve={() => actions.resolveException(booking.id, exception.id)} />)}</div>}
      </section>
      <aside className="exception-aside"><div className="exception-aside-icon"><ShieldCheck size={18} /></div><h3>Operational response</h3><p>Exceptions are linked to the donor’s journey record. Drivers only see the details needed to resolve their trip.</p><div className="exception-guideline"><strong>Typical follow-up</strong><ul><li>Contact the relevant driver or donor</li><li>Update the pickup or dispatch plan</li><li>Record the resolution against the journey</li></ul></div></aside>
    </div>
    {resolved.length > 0 && <section className="resolved-exceptions-section"><div className="exception-section-heading"><div><h2>Recently resolved</h2><p>Resolution remains in the journey history.</p></div><span>{resolved.length}</span></div><div className="resolved-exception-list">{resolved.slice(0, 5).map(({ booking, exception }) => <button className="resolved-exception-row" type="button" key={exception.id} onClick={() => onOpenBooking(booking)}><CheckCircle2 size={15} /><span><strong>{exception.category}</strong><small>{booking.donorName} · {booking.reference}</small></span><ChevronRight size={14} /></button>)}</div></section>}
  </div>;
}

function ExceptionCard({ booking, exception, onOpen, onResolve }) {
  const severity = exception.category.toLowerCase().includes('safety') || exception.category.toLowerCase().includes('vehicle') ? 'priority-high' : 'priority-normal';
  return <article className={`exception-card ${severity}`}>
    <div className="exception-card-head"><span className="exception-category-icon"><AlertCircle size={16} /></span><div><div><strong>{exception.category}</strong><span className={`exception-severity ${severity}`}>{severity === 'priority-high' ? 'Priority' : 'Follow-up'}</span></div><small>{booking.reference} · {booking.donorName}</small></div><time>{new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(new Date(exception.at))}</time></div>
    <p className="exception-description">{exception.details || 'No additional details were provided.'}</p>
    <div className="exception-reporter"><span>Reported by {exception.reportedBy}</span><span>{exception.leg === 'return' ? 'Return journey' : 'Outbound journey'}</span></div>
    <div className="exception-card-actions"><button className="button button-quiet button-small" type="button" onClick={onOpen}>Open journey <ArrowRight size={13} /></button><button className="button button-secondary button-small" type="button" onClick={onResolve}><Check size={14} /> Mark resolved</button></div>
  </article>;
}

function OperatingModelView({ state, actions }) {
  const options = [
    { id: 'fleet', letter: 'A', title: 'SANBS fleet', icon: Truck, badge: 'Employed drivers', description: 'Trips are assigned to SANBS-employed drivers. Drivers acknowledge an assignment; operations manages availability and schedules.', driver: 'Sipho Dlamini · Toyota Corolla' },
    { id: 'independent', letter: 'B', title: 'Independent drivers', icon: UserRound, badge: 'Approved network', description: 'Trips are offered to approved independent drivers, who can accept or decline before starting navigation.', driver: 'Lerato Nkosi · Hyundai Grand i10' },
    { id: 'partner', letter: 'C', title: 'Transport partner', icon: UsersRound, badge: 'Provider dispatch', description: 'Operations dispatches a trip to a partner provider. Progress is reported back by the partner desk.', driver: 'CityLink Dispatch · partner-managed vehicle' },
    { id: 'hybrid', letter: 'D', title: 'Hybrid supply', icon: Activity, badge: 'Multiple resources', description: 'Operations can assign an available SANBS, independent or partner resource based on the journey and local capacity.', driver: 'Available resources across all supply types' },
  ];
  return <div className="console-page operating-model-page">
    <div className="page-title-row"><div><span className="eyebrow">DISPATCH CONFIGURATION</span><h1>Operating model</h1><p>Switch the supply and assignment behaviour for new dispatches.</p></div><span className="model-current-indicator"><i />{OPERATING_MODELS[state.operatingModel]?.title} active</span></div>
    <div className="model-info-banner"><span><Settings2 size={17} /></span><p><strong>Changes apply to new assignments.</strong> Existing trips keep their current driver and status.</p></div>
    <div className="model-options-list">{options.map(({ id, letter, title, icon: Icon, badge, description, driver }) => <button type="button" className={`model-option ${state.operatingModel === id ? 'model-option-active' : ''}`} key={id} onClick={() => actions.setOperatingModel(id)}>
      <span className="model-radio">{state.operatingModel === id && <i />}</span><span className="model-option-letter">{letter}</span><span className={`model-option-icon model-icon-${id}`}><Icon size={18} /></span><span className="model-option-copy"><span className="model-option-title"><strong>{title}</strong><small>{badge}</small></span><p>{description}</p><span className="model-example-resource"><UserRound size={13} /> {driver}</span></span>{state.operatingModel === id && <span className="model-active-mark"><Check size={15} /> Active</span>}
    </button>)}</div>
    <div className="model-explainer-footer"><ShieldCheck size={14} /><span>Model B requires drivers to accept each trip in the driver app. Model C hands partner trips to the operator, who records updates from the journey.</span></div>
  </div>;
}
