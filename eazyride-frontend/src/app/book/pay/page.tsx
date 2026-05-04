export default function BookPay() {
  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Book a seat</div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Route<small>Selected</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Rides<small>Selected</small></div></div>
          <div className="flow-step done"><span className="step-no">OK</span><div>Details<small>Reviewed</small></div></div>
          <div className="flow-step active"><span className="step-no">4</span><div>Pay<small>Reserve seat</small></div></div>
          <div className="flow-step"><span className="step-no">5</span><div>Done<small>Ticket created</small></div></div>
        </aside>
        <section className="detail-layout">
          <div className="panel">
            <div className="section-head">
              <div>
                <span className="eyebrow"><span className="dot"></span>Step 4</span>
                <h2 className="mt-12">Confirm and pay</h2>
                <p>Clear pricing. The pilot receives a booking request or instant confirmation based on their settings.</p>
              </div>
              <a href="/book/detail" className="light-btn">Back</a>
            </div>
            <div className="two-col">
              <div className="preview-card">
                <h3>Payment method</h3>
                <div className="choice-row mt-16">
                  <button className="choice-card active"><span className="icon-bubble">UPI</span><span><strong>UPI</strong><br/><span className="muted small">pay@upi</span></span></button>
                  <button className="choice-card"><span className="icon-bubble">CC</span><span><strong>Card</strong><br/><span className="muted small">Visa ending 4421</span></span></button>
                </div>
              </div>
              <div className="preview-card">
                <h3>Cancellation rule</h3>
                <p className="mb-0">Free cancellation until 30 minutes before pickup.</p>
              </div>
            </div>
          </div>
          <aside className="panel summary-card">
            <h3>Fare breakdown</h3>
            <div className="summary-line"><span>Seat price</span><strong>$14</strong></div>
            <div className="summary-line total"><span>Total</span><strong>$14</strong></div>
            <a href="/book/success" className="primary-btn mt-20" style={{width: '100%'}}>Confirm booking</a>
          </aside>
        </section>
      </div>
    </div>
  );
}
