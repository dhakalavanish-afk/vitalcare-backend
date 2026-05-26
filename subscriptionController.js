const { v4: uuidv4 } = require('uuid');
const supabase = require('../../config/supabase');

// Get all subscription plans
const getPlans = async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create subscription (after Stripe payment)
const createSubscription = async (req, res) => {
  try {
    const {
      memberId,
      subscriptionPlanId,
      stripeCustomerId,
      stripeSubscriptionId,
      startDate,
      endDate,
      nextBillingDate
    } = req.body;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        subscription_id: uuidv4(),
        member_id: memberId,
        subscription_plan_id: subscriptionPlanId,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        start_date: startDate,
        end_date: endDate,
        next_billing_date: nextBillingDate,
        status: 'Active',
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Subscription created', subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get member subscription
const getMemberSubscription = async (req, res) => {
  try {
    const { memberId } = req.params;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(plan_name, monthly_price, visits_per_month, max_members)')
      .eq('member_id', memberId)
      .eq('status', 'Active')
      .single();

    if (error || !subscription) {
      return res.status(404).json({ success: false, message: 'No active subscription found' });
    }

    res.json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'Cancelled', updated_at: new Date() })
      .eq('subscription_id', subscriptionId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Subscription cancelled', subscription: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPlans, createSubscription, getMemberSubscription, cancelSubscription };
