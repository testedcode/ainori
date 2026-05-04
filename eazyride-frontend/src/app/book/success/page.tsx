export default function BookSuccess() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Book a seat</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Selected</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Rides<small>Selected</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Details<small>Reviewed</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Pay<small>Complete</small></div></div>
          <div className="flow-step active"><span className="step-no">5</span><div>Done<small>Ticket created</small></div></div>
        </aside>
        <section className="success-wrap">
          <div className="success-card">
            <div className="success-mark">OK</div>
            <span className="eyebrow"><span className="dot"></span>Booking confirmed</span>
            <h2 className="mt-12">Your seat is reserved.</h2>
            <p className="lead">Pickup details, pilot contact and trip tracking are now available.</p>
            <div className="hero-actions">
              <a href="/dashboard" className="primary-btn">Go to my trips</a>
              <a href="/book" className="secondary-btn">Book return ride</a>
            </div>
          </div>
          <aside className="ticket">
            <div className="ride-top"><div><h3>Trip ticket</h3><p>Downtown to North Station</p></div></div>
            <div className="summary-line"><span>Pilot</span><strong>Aarav S.</strong></div>
            <div className="summary-line"><span>Pickup</span><strong>8:22 AM</strong></div>
            <div className="summary-line"><span>Seat</span><strong>Rear left</strong></div>
            <div className="summary-line"><span>Booking ID</span><strong>ER-28491</strong></div>
          </aside>
        </section>
      </div>
    </div>
  );
}
