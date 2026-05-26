const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

router.get('/plans', async (req, res) => {
  try {
    const { data, error } = await supabase.from('subscription_plans').select('*').eq('is_active', true);
    if (error) throw error;
    res.json({ success: true, plans: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { memberId, subscriptionPlanId, stripeCustomerId, stripeSubscriptionId, startDate, endDate, nextBillingDate } = req.body;
    const { data, error } = await supabase.from('subscriptions')
      .insert({ subscription_id: uuidv4(), member_id: memberId, subscription_plan_id: subscriptionPlanId, stripe_customer_id: stripeCustomerId, stripe_subscription_id: stripeSubscriptionId, start_date: startDate, end_date: endDate, next_billing_date: nextBillingDate, status: 'Active', created_at: new Date() })
      .select().single();
    if (error) throw error;
    res.status(201).json({ success: true, subscription: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/member/:memberId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('subscriptions').select('*, subscription_plans(*)').eq('member_id', req.params.memberId).eq('status', 'Active').single();
    if (error) throw error;
    res.json({ success: true, subscription: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
