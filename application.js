const express = require('express');
const router = express.Router();
const supabase = require('./supabase');

router.post('/', async (req, res) => {
try {
const { fullName, email, phone, role, licenseNumber, licenseState, yearsExperience, specialties, availability, resumeUrl, coverLetter } = req.body;

const { data, error } = await supabase.from('applications').insert([{
full_name: fullName,
email,
phone,
role,
license_number: licenseNumber,
license_state: licenseState,
years_experience: yearsExperience,
specialties,
availability,
resume_url: resumeUrl,
cover_letter: coverLetter
}]);

if (error) throw error;

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
from: 'onboarding@resend.dev',
to: 'dhakalavanish@gmail.com',
subject: '👩‍⚕️ New ' + role + ' Application: ' + fullName,
html: `<h2>New Application!</h2><p><b>Name:</b> ${fullName}</p><p><b>Role:</b> ${role}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone}</p><p><b>License:</b> ${licenseNumber || 'N/A'} (${licenseState || 'N/A'})</p><p><b>Experience:</b> ${yearsExperience}</p><p><b>Specialties:</b> ${specialties}</p><p><b>Cover Letter:</b> ${coverLetter}</p>`
});

res.status(201).json({ success: true, message: 'Application submitted successfully' });
} catch (error) {
console.error('Application error:', error);
res.status(500).json({ success: false, message: error.message });
}
});

module.exports = router;

