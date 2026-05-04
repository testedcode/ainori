export default function BookResults() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Book a seat</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Downtown to North</small></div></div>
          <div className="flow-step active"><span className="step-no">2</span><div>Rides<small>All route matches</small></div></div>
          <div className="flow-step"><span className="step-no">3</span><div>Details<small>Pickup and trust</small></div></div>
          <div className="flow-step"><span className="step-no">4</span><div>Pay<small>Reserve seat</small></div></div>
          <div className="flow-step"><span className="step-no">5</span><div>Done<small>Ticket created</small></div></div>
        </aside>
        <section className="content-grid">
          <div className="panel">
            <div className="section-head">
              <div>
                <span className="eyebrow"><span className="dot"></span>Step 2</span>
                <h2 className="mt-12">Available rides on your route</h2>
                <p>Showing rides that overlap your pickup, destination and arrival window.</p>
              </div>
              <a href="/book" className="light-btn">Edit search</a>
            </div>
            <div className="filter-row">
              <button className="chip-btn active">Best match</button>
              <button className="chip-btn">Lowest price</button>
              <button className="chip-btn">Earliest pickup</button>
              <button className="chip-btn">2+ seats</button>
              <button className="chip-btn">Verified only</button>
            </div>
          </div>
          <div className="results-layout">
            <div className="ride-list">
              <article className="ride-card top-match">
                <div className="ride-top">
                  <div className="driver"><span className="avatar green">AS</span><div><h4>Aarav Sharma</h4><span>Verified Pilot - 4.9 rating</span></div></div>
                  <div className="price"><strong>$14</strong><span>per seat</span></div>
                </div>
                <div className="tag-row"><span className="tag green">92% route match</span><span className="tag">2 seats left</span><span className="tag">8:22 AM pickup</span><span className="tag gold">Quiet ride</span></div>
                <div className="ride-meta">
                  <div className="meta-box"><small>Pickup</small><strong>Downtown</strong></div>
                  <div className="meta-box"><small>Drop</small><strong>North Station</strong></div>
                  <div className="meta-box"><small>ETA</small><strong>9:18 AM</strong></div>
                </div>
                <div className="ride-actions">
                  <div className="route-mini"><b>Downtown</b> - Main St - <b>North Station</b></div>
                  <a href="/book/detail" className="primary-btn">View + book</a>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
