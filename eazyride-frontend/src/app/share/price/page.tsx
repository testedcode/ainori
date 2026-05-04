export default function SharePrice() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Share route</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Added</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Car<small>Added</small></div></div>
          <div className="flow-step active"><span className="step-no">3</span><div>Price<small>Rules and split</small></div></div>
          <div className="flow-step"><span className="step-no">4</span><div>Preview<small>Review listing</small></div></div>
          <div className="flow-step"><span className="step-no">5</span><div>Publish<small>Go live</small></div></div>
        </aside>
        <section className="detail-layout">
          <div className="panel">
            <div className="section-head"><div><span className="eyebrow"><span className="dot"></span>Pilot flow - step 3</span><h2 className="mt-12">Set fair cost sharing.</h2><p>For trust, show that price is a fuel/toll contribution, not a taxi fare.</p></div><a href="/share/car" className="light-btn">Back</a></div>
            <div className="form-grid">
              <div className="field"><label>Suggested seat contribution</label><input defaultValue="$14" /></div>
              <div className="field"><label>Tolls included?</label><select><option>Yes, included</option><option>Split if toll appears</option></select></div>
              <div className="field"><label>Cancellation window</label><select><option>Free until 30 min before pickup</option></select></div>
              <div className="field"><label>Booking type</label><select><option>Instant for verified users</option><option>Manual approval</option></select></div>
            </div>
            <div className="preview-card mt-20">
              <h3>Passenger rules</h3>
              <div className="choice-row mt-16">
                <button className="chip-btn active">Verified profile only</button>
                <button className="chip-btn active">No smoking</button>
                <button className="chip-btn active">On-time pickup</button>
              </div>
            </div>
          </div>
          <aside className="panel summary-card">
            <h3>Pilot savings estimate</h3>
            <div className="summary-line"><span>Fuel + toll daily</span><strong>$40</strong></div>
            <div className="summary-line"><span>2 seats booked</span><strong>$28</strong></div>
            <div className="summary-line total"><span>Your net cost</span><strong>$12</strong></div>
            <a href="/share/preview" className="primary-btn mt-20" style={{width: '100%'}}>Preview listing</a>
          </aside>
        </section>
      </div>
    </div>
  );
}
