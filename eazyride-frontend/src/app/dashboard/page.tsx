"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [rides, setRides] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ridesRes, requestsRes] = await Promise.all([
          api.get('/user/rides') as Promise<any>,
          api.get('/user/requests') as Promise<any>
        ]);
        setRides(ridesRes || []);
        setRequests(requestsRes || []);
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
              <div className="metric"><strong>{rides.length + requests.length}</strong><span>shared trips</span></div>
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading your trips...</div>
          ) : (
            <div className="two-col">
              <div className="panel">
                <h3>Upcoming bookings ({requests.length})</h3>
                {requests.length === 0 ? (
                  <p className="mt-16 muted">You haven't booked any upcoming rides.</p>
                ) : (
                  requests.map((req: any, i: number) => (
                    <article className="ride-card mt-16" key={i}>
                      <div className="ride-top">
                        <div className="driver">
                          <span className="avatar green">{req.host_name?.charAt(0) || 'H'}</span>
                          <div><h4>{req.ride_date}</h4><span>{req.pickup_point} to {req.drop_point}</span></div>
                        </div>
                        <div className="price"><strong>{req.ride_time}</strong></div>
                      </div>
                      <div className="tag-row"><span className={`tag ${req.status === 'approved' ? 'green' : ''}`}>{req.status}</span></div>
                      <a href="/book/success" className="primary-btn mt-12" style={{width: '100%', display: 'inline-flex', textAlign: 'center'}}>Open ticket</a>
                    </article>
                  ))
                )}
              </div>
              <div className="panel">
                <h3>Your shared routes ({rides.length})</h3>
                {rides.length === 0 ? (
                  <p className="mt-16 muted">You haven't shared any routes yet.</p>
                ) : (
                  rides.map((ride: any, i: number) => (
                    <article className="ride-card mt-16" key={i}>
                      <div className="ride-top">
                        <div className="driver">
                          <span className="avatar">YOU</span>
                          <div><h4>{ride.ride_date}</h4><span>{ride.pickup_point} to {ride.drop_point} - {ride.available_seats} seats open</span></div>
                        </div>
                        <div className="price"><strong>{ride.ride_time}</strong></div>
                      </div>
                      <div className="tag-row"><span className="tag green">Active</span></div>
                      <a href="/share/published" className="secondary-btn mt-12" style={{width: '100%', display: 'inline-flex', textAlign: 'center'}}>Manage listing</a>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
