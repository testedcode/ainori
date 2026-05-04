export default function ShareCar() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Share route</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Added</small></div></div>
          <div className="flow-step active"><span className="step-no">2</span><div>Car<small>Seats and comfort</small></div></div>
          <div className="flow-step"><span className="step-no">3</span><div>Price<small>Rules and split</small></div></div>
          <div className="flow-step"><span className="step-no">4</span><div>Preview<small>Review listing</small></div></div>
          <div className="flow-step"><span className="step-no">5</span><div>Publish<small>Go live</small></div></div>
        </aside>
        <section className="detail-layout">
          <div className="panel">
            <div className="section-head">
              <div><span className="eyebrow"><span className="dot"></span>Pilot flow - step 2</span><h2 className="mt-12">Add car and available seats.</h2><p>Make seat availability and ride comfort obvious.</p></div>
              <a href="/share" className="light-btn">Back</a>
            </div>
            <div className="vehicle-card">
              <span className="car-illus"></span>
              <div><h3>Sedan - XYZ 1234</h3><p className="mb-0">AC, clean car, verified insurance.</p></div>
            </div>
            <div className="form-grid mt-20">
              <div className="field"><label>Available seats</label><select><option>2 seats</option><option>1 seat</option><option>3 seats</option></select></div>
              <div className="field"><label>Preferred seat policy</label><select><option>Auto assign seats</option><option>Let riders choose</option></select></div>
              <div className="field"><label>Comfort style</label><select><option>Quiet ride</option><option>Friendly conversation okay</option><option>Music okay</option></select></div>
              <div className="field wide"><label>Note for passengers</label><textarea defaultValue="Daily route. Please be on time at pickup point. I wait up to 5 minutes." /></div>
            </div>
          </div>
          <aside className="panel summary-card">
            <h3>Listing quality</h3>
            <div className="summary-line"><span>Route clarity</span><strong>High</strong></div>
            <div className="summary-line"><span>Trust score</span><strong>92/100</strong></div>
            <a href="/share/price" className="primary-btn mt-20" style={{width: '100%'}}>Continue</a>
          </aside>
        </section>
      </div>
    </div>
  );
}
