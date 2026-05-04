"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BookResults() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real flow, we'd read search params from URL. For this simple app, we just load all open rides.
    (api.get('/rides') as Promise<any>).then(res => {
      setRides(res?.rides || res || []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch rides", err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Book a seat</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Any matching</small></div></div>
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
                <h2 className="mt-12">Available rides</h2>
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
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading available rides...</div>
              ) : rides.length === 0 ? (
                <div className="panel" style={{ textAlign: 'center' }}>No rides found for your criteria.</div>
              ) : (
                rides.map((ride, i) => (
                  <article className="ride-card top-match" key={i}>
                    <div className="ride-top">
                      <div className="driver">
                        <span className="avatar green">{ride.user_name?.charAt(0) || 'U'}</span>
                        <div><h4>{ride.user_name}</h4><span>Verified Pilot</span></div>
                      </div>
                      <div className="price"><strong>₹{ride.price_per_seat}</strong><span>per seat</span></div>
                    </div>
                    <div className="tag-row">
                      <span className="tag green">Route match</span>
                      <span className="tag">{ride.available_seats} seats left</span>
                      <span className="tag">{ride.ride_date} at {ride.ride_time}</span>
                    </div>
                    <div className="ride-meta">
                      <div className="meta-box"><small>Pickup</small><strong>{ride.pickup_point}</strong></div>
                      <div className="meta-box"><small>Drop</small><strong>{ride.drop_point}</strong></div>
                      <div className="meta-box"><small>Corridor</small><strong>{ride.corridor_name}</strong></div>
                    </div>
                    <div className="ride-actions">
                      <div className="route-mini"><b>{ride.pickup_point}</b> - {ride.corridor_name} - <b>{ride.drop_point}</b></div>
                      <a href={`/book/detail?id=${ride.id}`} className="primary-btn">View + book</a>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
