export default function ShareRoute() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Share route</div>
          <div className="flow-step active"><span className="step-no">1</span><div>Route<small>Where you drive</small></div></div>
          <div className="flow-step"><span className="step-no">2</span><div>Car<small>Seats and comfort</small></div></div>
          <div className="flow-step"><span className="step-no">3</span><div>Price<small>Rules and split</small></div></div>
          <div className="flow-step"><span className="step-no">4</span><div>Preview<small>Review listing</small></div></div>
          <div className="flow-step"><span className="step-no">5</span><div>Publish<small>Go live</small></div></div>
        </aside>
        <section className="content-grid">
          <div className="panel">
            <div className="section-head">
              <div>
                <span className="eyebrow"><span className="dot"></span>Pilot flow - step 1</span>
                <h2 className="mt-12">Share the route you already travel.</h2>
                <p>Designed for drivers who want to share their empty seats and split travel costs.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="field"><label>Starting point</label><input defaultValue="Downtown" /></div>
              <div className="field"><label>Destination</label><input defaultValue="North Station" /></div>
              <div className="field"><label>Departure time</label><input type="time" defaultValue="08:20" /></div>
              <div className="field"><label>Reach by</label><input type="time" defaultValue="09:20" /></div>
              <div className="field"><label>Repeat</label><select><option>Monday to Friday</option><option>Only tomorrow</option><option>Custom days</option></select></div>
              <div className="field"><label>Booking approval</label><select><option>Auto-approve verified riders</option><option>Ask me first</option></select></div>
            </div>
            <div className="hero-actions mt-28">
              <a href="/share/car" className="primary-btn">Continue to car details</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
