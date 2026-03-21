import React, { useState } from 'react';

const GOOGLE_SHEETS_WEBHOOK_URL = '';
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
const SUPABASE_TABLE = 'contact_messages';

async function logToGoogleSheets(payload) {
    if (!GOOGLE_SHEETS_WEBHOOK_URL) return { skipped: true };

    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Google Sheets logging failed');
    return { skipped: false };
}

async function logToSupabase(payload) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { skipped: true };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: 'return=minimal'
        },
        body: JSON.stringify([payload])
    });

    if (!response.ok) throw new Error('Supabase logging failed');
    return { skipped: false };
}

const Contact = () => {
    const [isSending, setIsSending] = useState(false);
    const [statusText, setStatusText] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const message = form.elements.message.value.trim();

        if (!name || !email || !message) {
            setStatusText('Please fill in all fields.');
            return;
        }

        try {
            setIsSending(true);
            setStatusText('Sending message...');

            const payload = {
                name,
                email,
                message,
                source: 'react-portfolio',
                created_at: new Date().toISOString()
            };

            const response = await fetch('https://formsubmit.co/ajax/rohithimanshu08@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    ...payload,
                    _subject: `Portfolio message from ${name}`,
                    _captcha: 'false'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const results = await Promise.allSettled([
                logToGoogleSheets(payload),
                logToSupabase(payload)
            ]);

            const sinkFailed = results.some((result) => result.status === 'rejected');

            form.reset();
            setStatusText(
                sinkFailed
                    ? 'Message sent to email, but one backup store failed.'
                    : 'Message sent successfully. Check your email inbox.'
            );
        } catch (error) {
            setStatusText('Could not send message right now. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

  return (
    <section className="contact section" id="contact">
        <div className="contact__container container grid">
            <div className="contact__content contact__split">
                <div className="contact__ribbon">Responsive</div>

                <div className="contact__intro">
                    <h2 className="contact__hero-title">Contact Me</h2>
                    <p className="contact__hero-subtitle">
                        Feel free to contact me for professional opportunities and engineering collaborations.
                    </p>
                </div>

                <div className="contact__info-panel">
                    <div className="contact__item tilt-card">
                        <div className="contact__icon-circle">
                            <i className='bx bx-map'></i>
                        </div>
                        <div className="contact__item-copy">
                            <h3 className="contact__item-title">Address</h3>
                            <p>Narsara, Hanuman Nagar, Darbhanga, Bihar - 846003</p>
                        </div>
                    </div>

                    <div className="contact__item tilt-card">
                        <div className="contact__icon-circle">
                            <i className='bx bx-phone'></i>
                        </div>
                        <div className="contact__item-copy">
                            <h3 className="contact__item-title">Phone</h3>
                            <p>+91-6202095002</p>
                        </div>
                    </div>

                    <div className="contact__item tilt-card">
                        <div className="contact__icon-circle">
                            <i className='bx bx-envelope'></i>
                        </div>
                        <div className="contact__item-copy">
                            <h3 className="contact__item-title">Email</h3>
                            <p>rohithimanshu08@gmail.com</p>
                        </div>
                    </div>
                </div>

                <div className="contact__form-panel tilt-card">
                    <h3 className="contact__form-title">Send Message</h3>
                    <form className="contact__form" noValidate onSubmit={handleSubmit}>
                        <div className="contact__field">
                            <input name="name" type="text" placeholder="Full Name" required />
                        </div>
                        <div className="contact__field">
                            <input name="email" type="email" placeholder="Email" required />
                        </div>
                        <div className="contact__field contact__field--textarea">
                            <textarea name="message" rows="3" placeholder="Type your message..." required></textarea>
                        </div>
                        <button type="submit" className="contact__send" disabled={isSending}>
                          {isSending ? 'Sending...' : 'Send'}
                        </button>
                        {statusText && <p className="contact__status">{statusText}</p>}
                    </form>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Contact;
