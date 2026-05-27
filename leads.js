const express = require('express');
const router = express.Router();
const supabase = require('./supabase');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, plan, careFor, visitTime, conditions } = req.body;

    const { data, error } = await supabase
      .from('leads')
      .insert([{ 
        name, 
        email, 
        phone, 
        address, 
        plan, 
        care_for: careFor, 
        visit_time: visitTime, 
        conditions 
      }]);

    if (error) throw error;

    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'dhakalavanish@gmail.com',
      subject: '🏥 New VitalCare Lead: ' + name,
      html: `<h2>New Lead!</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone}</p><p><b>Plan:</b> ${plan}</p>`
    });

    res.status(201).json({ success: true, message: 'Lead saved successfully' });
  } catch (error) {
    console.error('Lead error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
