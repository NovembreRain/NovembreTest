// /api/contact.js
// Vercel serverless function (Node.js CommonJS)

const sgMail = require('@sendgrid/mail');
const { createClient } = require('@supabase/supabase-js');

// Initialize from env (set these in Vercel Project Settings -> Environment Variables)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE || ''
);

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, email, message } = req.body || {};

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Basic email format check (simple)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // INSERT into Supabase (if configured)
    // If SUPABASE envs are not set this will throw — safe-guard:
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE) {
      const { error: dbError } = await supabase.from('leads').insert([
        { name, email, message }
      ]);
      if (dbError) {
        console.error('Supabase insert error:', dbError);
        // continue — we still try to send email
      }
    }

    // Send notification email via SendGrid
    await sgMail.send({
      to: process.env.NOTIFY_EMAIL || 'you@example.com',
      from: process.env.SENDGRID_FROM || 'no-reply@example.com',
      subject: `New website lead from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message || '(none)'}`
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
