export default function Dashboard() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Dashboard</div>
          <div className="flow-step active"><span className="step-no">D</span><div>My Trips<small>Rides and savings</small></div></div>
          <div className="flow-step"><span className="step-no">B</span><div>Bookings<small>Upcoming seats</small></div></div>
          <div className="flow-step"><span className="step-no">S</span><div>Shared Routes<small>Pilot routes</small></div></div>
          <div className="flow-step"><span className="step-no">P</span><div>Profile<small>Trust settings</small></div></div>
        </aside>
        <section className="content-grid">
          <div className="panel">
            <div className="section-head">
              <div><span className="eyebrow"><span className="dot"></span>My trips</span><h2 className="mt-12">Your shared journeys.</h2><p>Manage your daily bookings, published routes, savings and safety settings.</p></div>
              <div className="hero-actions"><a href="/book" className="primary-btn">Book ride</a><a href="/share" className="secondary-btn">Share route</a></div>
            </div>
            <div className="metric-row">
              <div className="metric"><strong>$38</strong><span>saved this month</span></div>
              <div className="metric"><strong>21.4 kg</strong><span>CO2 avoided</span></div>
              <div className="metric"><strong>18</strong><span>shared trips</span></div>
            </div>
          </div>
          <div className="two-col">
            <div className="panel">
              <h3>Upcoming booking</h3>
              <article className="ride-card mt-16">
                <div className="ride-top"><div className="driver"><span className="avatar green">AS</span><div><h4>Monday morning</h4><span>Aarav - Downtown to North</span></div></div><div className="price"><strong>8:22</strong><span>AM</span></div></div>
                <div className="tag-row"><span className="tag green">Confirmed</span><span className="tag">Rear left</span><span className="tag">Track live</span></div>
                <a href="/book/success" className="primary-btn mt-12" style={{width: '100%', display: 'inline-flex', textAlign: 'center'}}>Open ticket</a>
              </article>
            </div>
            <div className="panel">
              <h3>Your shared route</h3>
              <article className="ride-card mt-16">
                <div className="ride-top"><div className="driver"><span className="avatar">YOU</span><div><h4>Evening return</h4><span>North to Downtown - 2 seats open</span></div></div><div className="price"><strong>6:35</strong><span>PM</span></div></div>
                <div className="tag-row"><span className="tag gold">2 requests</span><span className="tag green">Verified riders</span></div>
                <a href="/share/published" className="secondary-btn mt-12" style={{width: '100%', display: 'inline-flex', textAlign: 'center'}}>Manage listing</a>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
