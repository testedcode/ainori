export default function Home() {
  return (
    <div className="screen active">
      <section className="hero">
        <div className="hero-card">
          <span className="eyebrow"><span className="dot"></span>Share the journey</span>
          <h1>Travel together. Save money, fuel and stress.</h1>
          <p className="lead">A clean, verified ride-share product. Riders book a safe seat in minutes. Pilots share their daily route and split costs.</p>
          <div className="hero-actions">
            <a href="/book" className="primary-btn">Book a seat</a>
            <a href="/share" className="secondary-btn">Share a route</a>
          </div>
          <div className="metric-row">
            <div className="metric"><strong>Fast</strong><span>easy seat booking</span></div>
            <div className="metric"><strong>Verified</strong><span>trusted users</span></div>
            <div className="metric"><strong>Save</strong><span>split travel costs</span></div>
          </div>
        </div>

        <div className="route-preview panel">
          <div className="mock-map" aria-label="Route map preview">
            <span className="road r1"></span><span className="road r2"></span><span className="road r3"></span>
            <span className="route-line"></span>
            <span className="map-pin start">A</span><span className="map-pin end">B</span>
            <span className="car-pin c1">Car</span><span className="car-pin c2">2</span><span className="car-pin c3">3</span>
            <span className="map-label l1">Pickup</span><span className="map-label l2">Destination</span>
            <div className="floating-panel float-search">
              <div className="search-line">
                <div className="mini-input"><span className="dot"></span><strong>Downtown</strong></div>
                <div className="arrow-circle">to</div>
                <div className="mini-input"><span className="dot" style={{background: '#185cff'}}></span><strong>North Station</strong></div>
              </div>
              <div className="filter-row mt-12">
                <span className="tag green">Live route</span><span className="tag">8:30 AM</span>
              </div>
            </div>
            <div className="floating-panel float-ride">
              <div className="ride-top">
                <div className="driver"><span className="avatar green">AS</span><div><h4>Best match found</h4><span>Verified Pilot</span></div></div>
                <div className="price"><strong>$14</strong><span>per seat</span></div>
              </div>
              <div className="tag-row"><span className="tag green">ID Verified</span><span className="tag">2 seats left</span></div>
              <a href="/book" className="primary-btn" style={{width: '100%'}}>View available rides</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
