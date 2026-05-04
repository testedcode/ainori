export default function SharePublished() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Share route</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Added</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Car<small>Added</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Price<small>Set</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Preview<small>Reviewed</small></div></div>
          <div className="flow-step active"><span className="step-no">5</span><div>Publish<small>Live</small></div></div>
        </aside>
        <section className="success-wrap">
          <div className="success-card">
            <div className="success-mark">OK</div>
            <span className="eyebrow"><span className="dot"></span>Route published</span>
            <h2 className="mt-12">Your route is live for verified riders.</h2>
            <p className="lead">The ride is now visible to riders searching Downtown to North Station. You will receive booking alerts and can review rider profiles.</p>
            <div className="hero-actions">
              <a href="/dashboard" className="primary-btn">View booking requests</a>
              <a href="/share" className="secondary-btn">Publish another route</a>
            </div>
          </div>
          <aside className="panel">
            <h3>Live listing controls</h3>
            <div className="summary-line"><span>Status</span><strong>Accepting bookings</strong></div>
            <div className="summary-line"><span>Seats</span><strong>2 open</strong></div>
            <div className="summary-line"><span>Approval</span><strong>Verified instant</strong></div>
            <button className="light-btn mt-20" style={{width: '100%'}}>Pause ride</button>
          </aside>
        </section>
      </div>
    </div>
  );
}
