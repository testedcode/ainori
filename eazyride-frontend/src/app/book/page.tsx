export default function Book() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel" aria-label="Booking steps">
          <div className="side-title">Book a seat</div>
          <div className="flow-step active"><span className="step-no">1</span><div>Route<small>Pickup and Drop</small></div></div>
          <div className="flow-step"><span className="step-no">2</span><div>Rides<small>Compare options</small></div></div>
          <div className="flow-step"><span className="step-no">3</span><div>Details<small>Pickup and trust</small></div></div>
          <div className="flow-step"><span className="step-no">4</span><div>Pay<small>Reserve seat</small></div></div>
          <div className="flow-step"><span className="step-no">5</span><div>Done<small>Ticket created</small></div></div>
        </aside>
        <section className="content-grid">
          <div className="panel">
            <div className="section-head">
              <div>
                <span className="eyebrow"><span className="dot"></span>Step 1</span>
                <h2 className="mt-12">Where are you going?</h2>
                <p>Select your route. Once you search, every available ride on that route becomes visible immediately.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Pickup area</label><input defaultValue="Downtown" aria-label="Pickup area" /></div>
              <div className="field"><label>Destination</label><input defaultValue="North Station" aria-label="Destination" /></div>
              <div className="field"><label>Date</label><input type="date" defaultValue="2026-05-04" /></div>
              <div className="field"><label>Time</label><select><option>Morning (8-10 AM)</option><option>Afternoon (12-3 PM)</option><option>Evening (5-8 PM)</option></select></div>
              <div className="field"><label>Seats needed</label><select><option>1 seat</option><option>2 seats</option><option>3 seats</option></select></div>
            </div>
            <div className="mt-20">
              <div className="choice-row">
                <button className="choice-card active"><span className="icon-bubble">M</span><span><strong>Morning Trip</strong><br/><span className="muted small">Most popular time</span></span></button>
                <button className="choice-card"><span className="icon-bubble green">R</span><span><strong>Return Trip</strong><br/><span className="muted small">Evening rides</span></span></button>
                <button className="choice-card"><span className="icon-bubble gold">S</span><span><strong>Recurring</strong><br/><span className="muted small">Daily schedule</span></span></button>
              </div>
            </div>
            <div className="hero-actions mt-28">
              <a href="/book/results" className="primary-btn">Find shared rides</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
