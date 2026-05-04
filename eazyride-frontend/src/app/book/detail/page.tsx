export default function BookDetail() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Book a seat</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Selected</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Rides<small>Best match</small></div></div>
          <div className="flow-step active"><span className="step-no">3</span><div>Details<small>Pickup and trust</small></div></div>
          <div className="flow-step"><span className="step-no">4</span><div>Pay<small>Reserve seat</small></div></div>
          <div className="flow-step"><span className="step-no">5</span><div>Done<small>Ticket created</small></div></div>
        </aside>
        <section className="detail-layout">
          <div className="content-grid">
            <div className="panel">
              <div className="section-head">
                <div>
                  <span className="eyebrow"><span className="dot"></span>Step 3</span>
                  <h2 className="mt-12">Review ride details</h2>
                  <p>Confirm pickup, pilot details, comfort preferences and trust badges before reserving your seat.</p>
                </div>
                <a href="/book/results" className="light-btn">Back to rides</a>
              </div>
              <div className="ride-top">
                <div className="driver"><span className="avatar green" id="detail-avatar">AS</span><div><h3 id="detail-name">Aarav Sharma</h3><span id="detail-role">Verified Pilot - 4.9 rating - 128 shared trips</span></div></div>
                <div className="price"><strong id="detail-price">$14</strong><span>per seat</span></div>
              </div>
              <div className="tag-row"><span className="tag green">ID verified</span><span className="tag green">Email verified</span><span className="tag">Instant booking</span></div>
              <div className="timeline">
                <div className="time-node"><small>8:22 AM</small><span className="line-dot"></span><div><h4>Pickup: Downtown Square</h4><p>Walk 3 minutes from your saved home location.</p></div></div>
                <div className="time-node"><small>9:18 AM</small><span className="line-dot"></span><div><h4>Drop: North Station</h4><p>Estimated arrival before 9:30 AM.</p></div></div>
              </div>
            </div>
            <div className="panel">
              <div className="section-head"><div><h3>Safety and comfort checks</h3></div></div>
              <div className="trust-grid">
                <div className="trust-card"><span className="icon-bubble green">ID</span><strong>Verified identity</strong><p className="small mb-0">Government ID matched.</p></div>
                <div className="trust-card"><span className="icon-bubble">EM</span><strong>Email proof</strong><p className="small mb-0">Email address checked.</p></div>
                <div className="trust-card"><span className="icon-bubble gold">SOS</span><strong>Live trip support</strong><p className="small mb-0">Share trip tracking.</p></div>
              </div>
            </div>
          </div>
          <aside className="panel summary-card">
            <h3>Your seat summary</h3>
            <div className="summary-line"><span>Ride date</span><strong>Today</strong></div>
            <div className="summary-line"><span>Pickup</span><strong>8:22 AM</strong></div>
            <div className="summary-line"><span>Seat</span><strong>Rear left</strong></div>
            <div className="summary-line total"><span>Total</span><strong id="detail-total">$14</strong></div>
            <a href="/book/pay" className="primary-btn mt-20" style={{width: '100%'}}>Reserve this seat</a>
          </aside>
        </section>
      </div>
    </div>
  );
}
