const express = require('express');
const router = express.Router();
const supabase = require('./supabase');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

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

await resend.emails.send({
from: 'onboarding@resend.dev',
to: 'dhakalavanish@gmail.com',
subject: '🏥 New VitalCare Lead: ' + name,
html: `
<h2>New Lead from VitalCare!</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Address:</strong> ${address}</p>
<p><strong>Plan:</strong> ${plan}</p>
<p><strong>Care For:</strong> ${careFor}</p>
<p><strong>Visit Time:</strong> ${visitTime}</p>
<p><strong>Conditions:</strong> ${conditions}</p>
`
});

res.status(201).json({ success: true, message: 'Lead saved successfully' });
} catch (error) {
console.error('Lead error:', error);
res.status(500).json({ success: false, message: error.message });
}
});

module.exports = router;
