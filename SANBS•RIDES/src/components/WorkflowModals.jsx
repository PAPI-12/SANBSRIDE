import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import {
  OPERATING_MODELS,
  distanceBetweenCoordinates,
  getDriverAvailability,
  getEligibleDrivers,
  getLeg,
  getReturnStatusLabel,
  getStatusMeta,
  legProgress,
} from '../domain.js';
import {
  DriverAvatar,
  ModalFrame,
  OriginTag,
  RouteMap,
  StatusChip,
  useDialogA11y,
} from './Shared.jsx';

export function AssignDriverModal({ state, booking, leg = 'outbound', onClose, onAssign }) {
  const drivers = useMemo(() => getEligibleDrivers(state, leg, booking), [state, leg, booking]);
  const pickupPoint = leg === 'return' ? booking.appointment.coordinates : booking.pickupCoordinates;
  const [selectedId, setSelectedId] = useState(drivers[0]?.id || '');
  const selected = drivers.find((driver) => driver.id === selectedId);
  const current = getLeg(booking, leg);
  const model = OPERATING_MODELS[state.operatingModel] || OPERATING_MODELS.fleet;
  const tripName = leg === 'return' ? 'Return trip' : 'Outbound pickup';
  return <ModalFrame
    title={`Assign ${tripName.toLowerCase()}`}
    subtitle={`${booking.donorName} · ${booking.reference}`}
    onClose={onClose}
    size="medium"
    footer={<><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="button" className="button button-primary" disabled={!selected} onClick={() => selected && onAssign(selected.id)}>{current?.driverId ? 'Reassign trip' : 'Assign driver'} <ArrowRight size={15} /></button></>}
  >
    <div className="assignment-summary">
      <div className="assignment-route-point"><span className="route-point-dot pickup-dot" /><div><small>{leg === 'return' ? 'PICKUP' : 'DONOR PICKUP'}</small><strong>{leg === 'return' ? booking.appointment.locationName : booking.pickupAddress}</strong></div></div>
      <div className="assignment-route-line" />
      <div className="assignment-route-point"><span className="route-point-dot destination-dot" /><div><small>{leg === 'return' ? 'DESTINATION' : 'DONATION SITE'}</small><strong>{leg === 'return' ? booking.pickupAddress : booking.appointment.locationName}</strong></div></div>
      <div className="assignment-time"><Clock3 size={14} /> {leg === 'return' ? 'Ready now · confirmed by SANBS' : `${booking.pickupTime || '08:45'} pickup · ${booking.appointment.time} appointment`}</div>
    </div>
    <div className="assignment-model-note"><ShieldCheck size={15} /><span><strong>{model.title}</strong> · {model.short}</span></div>
    <div className="driver-choice-list">
      {drivers.length === 0 ? <div className="inline-empty"><AlertTriangle size={17} /><div><strong>No eligible resource is available</strong><p>Change the operating model, bring a driver online or finish an active trip first.</p></div></div> : drivers.map((driver) => {
        const availability = getDriverAvailability(state, driver.id);
        return <button className={`driver-choice ${selectedId === driver.id ? 'driver-choice-selected' : ''}`} type="button" key={driver.id} onClick={() => setSelectedId(driver.id)}>
          <DriverAvatar driver={driver} />
          <span className="driver-choice-copy"><strong>{driver.name}</strong><small>{driver.typeLabel} · {driver.vehicle}</small><small>{Number.isFinite(distanceBetweenCoordinates(driver.currentCoordinates, pickupPoint)) ? `${distanceBetweenCoordinates(driver.currentCoordinates, pickupPoint).toFixed(1)} km from requested ${leg === 'return' ? 'centre pickup' : 'donor pickup'} · last known` : 'Last-known driver location unavailable'}</small>{drivers[0]?.id === driver.id && Number.isFinite(distanceBetweenCoordinates(driver.currentCoordinates, pickupPoint)) && <small className="nearest-driver-label">Nearest available resource</small>}</span>
          <span className="driver-choice-status"><i className={`availability-dot dot-${availability}`} />{driver.isProvider ? 'Ready' : availability === 'available' ? 'Available' : availability}</span>
          <span className="choice-radio">{selectedId === driver.id && <i />}</span>
        </button>;
      })}
    </div>
    <p className="privacy-note"><ShieldCheck size={13} /> Drivers receive only pickup and trip details needed to complete the ride.</p>
  </ModalFrame>;
}

export function BookingDetailPanel({ booking, state, actions, role = 'staff', onClose, onAssign }) {
  const dialogRef = useDialogA11y(onClose);
  const outboundDriver = state.drivers.find((driver) => driver.id === booking.outbound?.driverId);
  const returnDriver = state.drivers.find((driver) => driver.id === booking.returnLeg?.driverId);
  const openExceptions = (booking.exceptions || []).filter((item) => item.status === 'open').length;
  const isStaff = role === 'staff';
  const isOps = role === 'operations';
  const canManage = isStaff || isOps;
  const status = getStatusMeta(booking);
  const liveLeg = booking.returnLeg?.status && !['not_required', 'waiting_authorisation', 'awaiting_dispatch', 'completed'].includes(booking.returnLeg.status) ? 'return' : 'outbound';
  const liveProgress = legProgress(booking, liveLeg);
  const from = liveLeg === 'return' ? booking.appointment.locationName : booking.pickupAddress;
  const to = liveLeg === 'return' ? 'Donor home' : booking.appointment.locationName;
  const canAssignOutbound = ['awaiting_assignment', 'driver_assigned'].includes(booking.outbound.status) && !['arrived_at_site', 'cancelled'].includes(booking.outbound.status);
  const canAssignReturn = booking.returnLeg?.status === 'awaiting_dispatch' || (booking.returnLeg?.status === 'driver_assigned' && isOps);
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <aside ref={dialogRef} tabIndex={-1} className="detail-drawer" role="dialog" aria-modal="true" aria-label={`Journey ${booking.reference}`}>
        <div className="drawer-header">
          <div>
            <div className="drawer-kicker"><span>JOURNEY RECORD</span><span>·</span><span>{booking.reference}</span></div>
            <h2>{booking.donorName}</h2>
            <div className="drawer-tags"><StatusChip booking={booking} /><OriginTag origin={booking.origin} /></div>
          </div>
          <button className="icon-button" type="button" aria-label="Close journey details" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-content">
          <div className="detail-alert-line"><i className={`status-orb tone-${status.tone}`} /><span>{status.label}</span><small>Updated {new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(new Date(booking.updatedAt || booking.createdAt))}</small></div>
          <RouteMap from={from} to={to} progress={liveProgress} reverse={liveLeg === 'return'} compact helper="Route overview" />
          <section className="detail-section">
            <div className="detail-section-title"><h3>Journey details</h3><span>{booking.appointment.time} appointment</span></div>
            <div className="detail-row"><span><MapPin size={15} /> Pickup</span><div><strong>{booking.pickupAddress}</strong>{booking.pickupNotes && <small>{booking.pickupNotes}</small>}</div></div>
            <div className="detail-row"><span><MapPin size={15} /> Destination</span><div><strong>{booking.appointment.locationName}</strong><small>{booking.appointment.locationAddress} · {booking.appointment.locationKind}</small></div></div>
            <div className="detail-row"><span><Clock3 size={15} /> Appointment</span><div><strong>{booking.appointment.date} · {booking.appointment.time}</strong><small>Pickup planned for {booking.pickupTime || '08:45'}</small></div></div>
            <div className="detail-row"><span><UserRound size={15} /> Booking source</span><div><strong>{booking.origin === 'staff' ? 'Staff-assisted booking' : 'Donor self-booked'}</strong><small>{booking.origin === 'staff' ? 'Created with donor consent' : 'Submitted in the donor app'}</small></div></div>
            {canManage && <div className="detail-row"><span><Phone size={15} /> Donor contact</span><div><strong>{booking.contactNumber || booking.donorPhone}</strong><button className="text-action" type="button" onClick={() => actions.showToast(`Contact donor: ${booking.contactNumber || booking.donorPhone}`)}>Contact donor</button></div></div>}
            {booking.requirements?.length > 0 && <div className="detail-row"><span><ShieldCheck size={15} /> Transport needs</span><div><strong>{booking.requirements.join(', ')}</strong><small>Operational information only</small></div></div>}
            {booking.notes && <div className="detail-notes"><span>Operational note</span><p>{booking.notes}</p></div>}
          </section>
          <section className="detail-section driver-assignment-section">
            <div className="detail-section-title"><h3>Driver assignments</h3>{openExceptions > 0 && <span className="exception-inline"><AlertTriangle size={13} /> {openExceptions} open</span>}</div>
            <AssignmentRow title="Outbound" driver={outboundDriver} leg={booking.outbound} state={state} />
            {booking.returnRequested && <AssignmentRow title="Return" driver={returnDriver} leg={booking.returnLeg} state={state} />}
            {canManage && (outboundDriver || returnDriver) && <div className="driver-contact-actions">{outboundDriver && <button type="button" className="text-action" onClick={() => actions.showToast(`Contact ${outboundDriver.name}: ${outboundDriver.phone}`)}><Phone size={12} /> Contact {outboundDriver.firstName} · {outboundDriver.phone}</button>}{returnDriver && returnDriver.id !== outboundDriver?.id && <button type="button" className="text-action" onClick={() => actions.showToast(`Contact ${returnDriver.name}: ${returnDriver.phone}`)}><Phone size={12} /> Contact return driver · {returnDriver.phone}</button>}</div>}
            {canManage && <div className="detail-actions detail-actions-inline">
              {canAssignOutbound && <button className="button button-secondary button-small" type="button" onClick={() => onAssign?.(booking, 'outbound')}>{outboundDriver ? 'Change outbound driver' : 'Assign outbound driver'}</button>}
              {canAssignReturn && <button className="button button-secondary button-small" type="button" onClick={() => onAssign?.(booking, 'return')}>{returnDriver ? 'Change return driver' : 'Assign return driver'}</button>}
              {isOps && outboundDriver?.type === 'partner' && ['driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_picked_up'].includes(booking.outbound.status) && <button className="button button-secondary button-small" type="button" onClick={() => actions.simulatePartnerUpdate(booking.id, 'outbound')}>Record partner update <ArrowRight size={13} /></button>}
              {isOps && returnDriver?.type === 'partner' && ['driver_assigned', 'driver_on_the_way', 'driver_arrived', 'donor_on_the_way_home'].includes(booking.returnLeg.status) && <button className="button button-secondary button-small" type="button" onClick={() => actions.simulatePartnerUpdate(booking.id, 'return')}>Record partner update <ArrowRight size={13} /></button>}
            </div>}
          </section>
          {booking.returnRequested && <section className="return-authorization-block">
            <div className="return-auth-icon"><ShieldCheck size={16} /></div>
            <div className="return-auth-copy">
              <span className="eyebrow">RETURN JOURNEY</span>
              <strong>{getReturnStatusLabel(booking.returnLeg?.status)}</strong>
              {booking.returnLeg?.status === 'waiting_authorisation'
                ? <p>The donor’s return is not dispatched automatically. Confirm readiness when the SANBS team is ready.</p>
                : booking.returnLeg?.status === 'awaiting_dispatch'
                  ? <p>Readiness recorded by {booking.returnLeg.authorizedBy || 'SANBS staff'} at {booking.returnLeg.authorizedAt ? new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(new Date(booking.returnLeg.authorizedAt)) : '—'}.</p>
                  : <p>Return progress is shared with the donor, staff and dispatch.</p>}
            </div>
            {isStaff && booking.outbound.status === 'arrived_at_site' && booking.returnLeg?.status === 'waiting_authorisation' && <button className="button button-primary button-small return-auth-action" type="button" onClick={() => actions.authorizeReturn(booking.id)}><Check size={14} /> Confirm donor ready for return</button>}
          </section>}
          {isStaff && booking.outbound.status === 'donor_picked_up' && <div className="staff-confirm-strip"><span><MapPin size={15} /> Driver marked the donor on board. Confirm arrival if the centre has received them.</span><button className="button button-secondary button-small" type="button" onClick={() => actions.confirmDonorArrival(booking.id)}>Confirm donor arrived</button></div>}
          {canManage && <section className="detail-section">
            <div className="detail-section-title"><h3>Operational exceptions</h3><button className="text-action" type="button" onClick={() => actions.reportException(booking.id, { category: 'Staff flagged delay', details: 'Delay flagged for transport follow-up.', leg: liveLeg }, role, role === 'operations' ? 'Transport operations' : 'SANBS staff')}>Flag delay</button></div>
            {(booking.exceptions || []).length === 0
              ? <p className="muted-line">No transport issues have been reported for this journey.</p>
              : <div className="exception-record-list">{booking.exceptions.map((item) => <div className={`exception-record ${item.status === 'resolved' ? 'exception-resolved' : ''}`} key={item.id}>
                  <div><strong>{item.category}</strong><span className={`exception-status ${item.status}`}>{item.status}</span></div>
                  <p>{item.details || 'No additional notes.'}</p>
                  <small>{item.reportedBy} · {new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(new Date(item.at))}</small>
                  {isOps && item.status === 'open' && <button className="text-action" type="button" onClick={() => actions.resolveException(booking.id, item.id)}>Mark resolved</button>}
                </div>)}</div>}
          </section>}
          <section className="detail-section history-section">
            <div className="detail-section-title"><h3>Journey history</h3><span>{(booking.history || []).length} updates</span></div>
            <div className="history-list">{[...(booking.history || [])].slice().reverse().map((event, index) => <div className="history-entry" key={event.id}>
              <span className={`history-dot ${index === 0 ? 'history-latest' : ''}`} />
              <div><strong>{event.label}</strong>{event.note && <p>{event.note}</p>}<small>{event.by} · {new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(event.at))}</small></div>
            </div>)}</div>
          </section>
          <div className="privacy-note drawer-privacy"><ShieldCheck size={13} /> No clinical or donation details are stored in this transport record.</div>
        </div>
        <div className="drawer-footer"><span>Last update <b>{new Intl.DateTimeFormat('en-ZA', { hour: 'numeric', minute: '2-digit' }).format(new Date(booking.updatedAt || booking.createdAt))}</b></span><span className="share-state"><i /> Shared record</span></div>
      </aside>
    </div>
  );
}

function AssignmentRow({ title, driver, leg, state }) {
  const driverStatus = driver ? getDriverAvailability(state, driver.id) : 'offline';
  return <div className="assigned-driver-row">
    <div className="assignment-leg-title"><span className={`leg-bullet ${title === 'Return' ? 'leg-return' : ''}`} />{title}</div>
    {driver ? <div className="assigned-driver-profile"><DriverAvatar driver={driver} size="small" /><div><strong>{driver.name}</strong><small>{driver.vehicle}</small></div><span className={`driver-state-label ${driverStatus === 'on_trip' ? 'driver-state-busy' : ''}`}><i className={`availability-dot dot-${driverStatus}`} />{driverStatus === 'on_trip' ? 'On trip' : driverStatus === 'available' ? 'Available' : 'Offline'}</span></div>
      : <div className="unassigned-driver"><span>{leg?.status === 'waiting_authorisation' ? 'Return held until SANBS confirms readiness' : leg?.status === 'awaiting_dispatch' ? 'Ready for dispatch' : 'No driver assigned'}</span></div>}
  </div>;
}

export function ReportIssueModal({ title = 'Report a transport issue', subtitle, onClose, onSubmit, categories, leg = 'outbound' }) {
  const options = categories || [
    'Donor not at pickup',
    'Incorrect pickup location',
    'Traffic delay',
    'Vehicle issue',
    'Safety concern',
    'Unable to complete trip',
  ];
  const [category, setCategory] = useState(options[0]);
  const [details, setDetails] = useState('');
  return <ModalFrame
    title={title}
    subtitle={subtitle || 'This update will be visible to transport operations and SANBS staff.'}
    onClose={onClose}
    size="small"
    footer={<><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="button" className="button button-primary" onClick={() => onSubmit({ category, details, leg })}><AlertTriangle size={14} /> Send issue report</button></>}
  >
    <div className="issue-form">
      <label className="field"><span className="field-label">What happened?</span><select className="text-input" value={category} onChange={(event) => setCategory(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label className="field"><span className="field-label">Add a note <span className="optional-label">optional</span></span><textarea className="text-input textarea" rows="3" value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Share what operations needs to know." /></label>
      <div className="issue-private-note"><ShieldCheck size={14} /> Do not include health or donation details.</div>
    </div>
  </ModalFrame>;
}
