export default function SharePreview() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Share route</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Added</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Car<small>Added</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Price<small>Set</small></div></div>
          <div className="flow-step active"><span className="step-no">4</span><div>Preview<small>Review listing</small></div></div>
          <div className="flow-step"><span className="step-no">5</span><div>Publish<small>Go live</small></div></div>
        </aside>
        <section className="detail-layout">
          <div className="panel">
            <div className="section-head"><div><span className="eyebrow"><span className="dot"></span>Pilot flow - step 4</span><h2 className="mt-12">Preview how riders will see it.</h2><p>Pilots can confidently publish because the final listing is clear.</p></div><a href="/share/price" className="light-btn">Back</a></div>
            <article className="ride-card top-match">
              <div className="ride-top">
                <div className="driver"><span className="avatar green">YOU</span><div><h4>Your morning route</h4><span>Verified Pilot - Sedan - 2 seats</span></div></div>
                <div className="price"><strong>$14</strong><span>per seat</span></div>
              </div>
              <div className="tag-row"><span className="tag green">Instant booking</span><span className="tag">8:20 AM pickup</span><span className="tag gold">Quiet ride</span></div>
              <div className="ride-meta">
                <div className="meta-box"><small>Start</small><strong>Downtown</strong></div>
                <div className="meta-box"><small>Drop</small><strong>North Station</strong></div>
                <div className="meta-box"><small>Seats</small><strong>2 left</strong></div>
                <div className="meta-box"><small>Rules</small><strong>Verified only</strong></div>
              </div>
              <div className="ride-actions"><div className="route-mini"><b>Downtown</b> - Main St - <b>North Station</b></div></div>
            </article>
          </div>
          <aside className="panel summary-card">
            <h3>Before publishing</h3>
            <div className="summary-line"><span>Profile</span><strong>Verified</strong></div>
            <div className="summary-line"><span>Car document</span><strong>Verified</strong></div>
            <div className="summary-line"><span>Payments</span><strong>Ready</strong></div>
            <a href="/share/published" className="primary-btn mt-20" style={{width: '100%'}}>Publish ride</a>
            <a href="/share/price" className="light-btn mt-12" style={{width: '100%'}}>Edit price</a>
          </aside>
        </section>
      </div>
    </div>
  );
}
