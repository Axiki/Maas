import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  Users,
  Building2,
  Check,
  X,
  Star,
  TrendingUp,
  Shield,
  Zap,
  HeadphonesIcon,
  Clock,
  CreditCard,
  Gift
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { cn } from '@mas/utils';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  limitations?: string[];
  targetUsers: string;
  savings?: string;
}

interface PricingCalculatorProps {
  onSelectPlan?: (plan: PricingTier) => void;
  showCalculator?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small cafes and food trucks',
    monthlyPrice: 29,
    annualPrice: 25,
    features: [
      'Point of Sale (POS)',
      'Basic Inventory Management',
      'Simple Reporting',
      '1 Location',
      'Up to 3 Users',
      'Email Support',
      'Mobile App Access'
    ],
    limitations: [
      'Limited to 1 location',
      'Basic reporting only',
      'No advanced analytics',
      'No multi-location support'
    ],
    targetUsers: 'Small cafes, food trucks, pop-ups',
    savings: 'Save $48/year with annual billing'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing restaurants and chains',
    monthlyPrice: 79,
    annualPrice: 65,
    popular: true,
    features: [
      'Everything in Starter',
      'Advanced Inventory Management',
      'Staff Management & Scheduling',
      'Customer Management (CRM)',
      'Advanced Reporting & Analytics',
      'Up to 3 Locations',
      'Up to 15 Users',
      'Priority Support',
      'API Access',
      'Custom Integrations'
    ],
    targetUsers: 'Growing restaurants, small chains',
    savings: 'Save $168/year with annual billing'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large chains and franchises',
    monthlyPrice: 199,
    annualPrice: 165,
    features: [
      'Everything in Professional',
      'Multi-Location Management',
      'Advanced Analytics & Intelligence',
      'Unlimited Locations',
      'Unlimited Users',
      'White-label Options',
      'Dedicated Account Manager',
      '24/7 Phone Support',
      'Custom Development',
      'SLA Guarantee'
    ],
    targetUsers: 'Large chains, franchises, enterprises',
    savings: 'Save $408/year with annual billing'
  }
];

const competitorComparison = [
  {
    name: 'Toast',
    monthlyPrice: 165,
    setupFee: 500,
    features: ['POS', 'Limited Inventory', 'Basic Reporting'],
    limitations: ['High setup fees', 'Long-term contracts', 'Hidden costs']
  },
  {
    name: 'Square',
    monthlyPrice: 60,
    setupFee: 0,
    features: ['POS', 'Basic Inventory', 'Mobile Payments'],
    limitations: ['Limited features', 'No advanced analytics', 'Basic reporting']
  },
  {
    name: 'MAS',
    monthlyPrice: 79,
    setupFee: 0,
    features: ['Full POS Suite', 'Advanced Inventory', 'Analytics', 'Multi-location'],
    limitations: ['None - flexible pricing', 'No long contracts', 'Cancel anytime']
  }
];

export const PricingCalculator: React.FC<PricingCalculatorProps> = (props) => {
  const { onSelectPlan, showCalculator = true } = props;
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string>('professional');
  const [businessType, setBusinessType] = useState<string>('restaurant');
  const [locationCount, setLocationCount] = useState<number>(1);
  const [userCount, setUserCount] = useState<number>(5);

  const currentTier = useMemo(() =>
    pricingTiers.find(tier => tier.id === selectedTier) || pricingTiers[1],
    [selectedTier]
  );

  const monthlyTotal = useMemo(() => {
    const basePrice = billingCycle === 'annual' ? currentTier.annualPrice : currentTier.monthlyPrice;
    const locationMultiplier = Math.max(1, locationCount - (currentTier.id === 'starter' ? 1 : currentTier.id === 'professional' ? 3 : 0));
    const userMultiplier = Math.max(1, userCount - (currentTier.id === 'starter' ? 3 : currentTier.id === 'professional' ? 15 : 0));

    return basePrice + (locationMultiplier * 20) + (userMultiplier * 5);
  }, [currentTier, billingCycle, locationCount, userCount]);

  const annualTotal = useMemo(() => monthlyTotal * 12, [monthlyTotal]);
  const savings = useMemo(() => {
    const monthlyYearly = monthlyTotal * 12;
    return monthlyYearly - annualTotal;
  }, [monthlyTotal, annualTotal]);

  const recommendedTier = useMemo(() => {
    if (locationCount > 3 || userCount > 15) return 'enterprise';
    if (locationCount > 1 || userCount > 3) return 'professional';
    return 'starter';
  }, [locationCount, userCount]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Calculator size={24} className="text-primary-600" />
          <h2 className="heading-lg">Transparent Pricing</h2>
        </div>
        <p className="body-lg text-muted max-w-2xl mx-auto">
          Choose the plan that fits your business. No hidden fees, no long-term contracts.
          Start small and scale as you grow.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4 p-1 bg-surface-200 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              billingCycle === 'monthly'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors relative',
              billingCycle === 'annual'
                ? 'bg-white text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            Annual
            <span className="absolute -top-2 -right-2 bg-success text-white text-xs px-1.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingTiers.map((tier) => (
          <motion.div
            key={tier.id}
            whileHover={{ scale: 1.02 }}
            className={cn(
              'relative rounded-2xl border-2 transition-colors',
              tier.popular
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-line bg-surface-100',
              selectedTier === tier.id ? 'ring-2 ring-primary-500' : ''
            )}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="heading-md text-ink mb-2">{tier.name}</h3>
                <p className="body-sm text-muted mb-4">{tier.description}</p>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-ink">
                    ${billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-muted">/month</span>
                </div>

                {tier.savings && (
                  <p className="text-success text-sm font-medium mt-1">
                    {tier.savings}
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-ink">{tier.targetUsers}</p>

                <div className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check size={16} className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-ink">{feature}</span>
                    </div>
                  ))}
                </div>

                {tier.limitations && (
                  <div className="pt-3 border-t border-line/50">
                    <p className="text-xs text-muted mb-2 font-medium">Limitations:</p>
                    <div className="space-y-1">
                      {tier.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <X size={14} className="text-muted mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  setSelectedTier(tier.id);
                  onSelectPlan?.(tier);
                }}
                variant={tier.popular ? 'primary' : 'outline'}
                className="w-full"
              >
                {selectedTier === tier.id ? 'Selected' : 'Choose Plan'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calculator Section */}
      {showCalculator && (
        <Card className="p-6">
          <div className="text-center mb-6">
            <h3 className="heading-md mb-2">Calculate Your Price</h3>
            <p className="text-muted">Get a personalized quote based on your business needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="food-truck">Food Truck</option>
                  <option value="chain">Restaurant Chain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Number of Locations: {locationCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={locationCount}
                  onChange={(e) => setLocationCount(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Number of Users: {userCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={userCount}
                  onChange={(e) => setUserCount(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-200 rounded-lg p-4">
                <h4 className="font-semibold text-ink mb-3">Your Quote</h4>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted">Base Plan ({currentTier.name})</span>
                    <span className="font-medium">
                      ${billingCycle === 'annual' ? currentTier.annualPrice : currentTier.monthlyPrice}
                    </span>
                  </div>

                  {locationCount > (currentTier.id === 'starter' ? 1 : currentTier.id === 'professional' ? 3 : 0) && (
                    <div className="flex justify-between">
                      <span className="text-muted">Extra Locations</span>
                      <span className="font-medium">
                        ${(locationCount - (currentTier.id === 'starter' ? 1 : currentTier.id === 'professional' ? 3 : 0)) * 20}
                      </span>
                    </div>
                  )}

                  {userCount > (currentTier.id === 'starter' ? 3 : currentTier.id === 'professional' ? 15 : 0) && (
                    <div className="flex justify-between">
                      <span className="text-muted">Extra Users</span>
                      <span className="font-medium">
                        ${(userCount - (currentTier.id === 'starter' ? 3 : currentTier.id === 'professional' ? 15 : 0)) * 5}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-line pt-2">
                    <div className="flex justify-between font-semibold text-ink">
                      <span>
                        {billingCycle === 'annual' ? 'Annual Total' : 'Monthly Total'}
                        {billingCycle === 'annual' && savings > 0 && (
                          <span className="text-success text-sm font-normal ml-2">
                            (Save ${savings})
                          </span>
                        )}
                      </span>
                      <span>
                        ${billingCycle === 'annual' ? annualTotal : monthlyTotal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {recommendedTier !== selectedTier && (
                <div className="bg-primary-100 border border-primary-200 rounded-lg p-3">
                  <p className="text-sm text-primary-800">
                    💡 <strong>Recommendation:</strong> Consider the {pricingTiers.find(t => t.id === recommendedTier)?.name} plan for better value with your {locationCount} location{locationCount !== 1 ? 's' : ''} and {userCount} user{userCount !== 1 ? 's' : ''}.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onSelectPlan?.(currentTier)}
              className="flex-1"
            >
              Start Free Trial
            </Button>
            <Button variant="outline" className="flex-1">
              Schedule Demo
            </Button>
          </div>
        </Card>
      )}

      {/* Competitor Comparison */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <h3 className="heading-md mb-2">Compare vs Competitors</h3>
          <p className="text-muted">See how MAS stacks up against the competition</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-3 px-4 font-semibold">Platform</th>
                <th className="text-left py-3 px-4 font-semibold">Monthly Cost</th>
                <th className="text-left py-3 px-4 font-semibold">Setup Fee</th>
                <th className="text-left py-3 px-4 font-semibold">Key Features</th>
                <th className="text-left py-3 px-4 font-semibold">Limitations</th>
              </tr>
            </thead>
            <tbody>
              {competitorComparison.map((competitor, index) => (
                <tr key={index} className="border-b border-line/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {competitor.name === 'MAS' && <Star size={16} className="text-primary-500" />}
                      <span className="font-medium">{competitor.name}</span>
                      {competitor.name === 'MAS' && (
                        <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full">
                          Best Value
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-muted" />
                      <span className="font-medium">{competitor.monthlyPrice}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={competitor.setupFee > 0 ? 'text-danger' : 'text-success'}>
                      {competitor.setupFee > 0 ? `$${competitor.setupFee}` : 'Free'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {competitor.features.map((feature, idx) => (
                        <span key={idx} className="bg-surface-200 text-xs px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {competitor.limitations.map((limitation, idx) => (
                        <span key={idx} className="bg-danger/10 text-danger text-xs px-2 py-1 rounded">
                          {limitation}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg mx-auto mb-3">
            <Shield size={24} className="text-success" />
          </div>
          <h4 className="font-semibold text-ink mb-1">Bank-Level Security</h4>
          <p className="text-sm text-muted">PCI DSS compliant with end-to-end encryption</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-3">
            <Zap size={24} className="text-primary-600" />
          </div>
          <h4 className="font-semibold text-ink mb-1">99.9% Uptime</h4>
          <p className="text-sm text-muted">Reliable service with SLA guarantee</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-lg mx-auto mb-3">
            <HeadphonesIcon size={24} className="text-warning" />
          </div>
          <h4 className="font-semibold text-ink mb-1">24/7 Support</h4>
          <p className="text-sm text-muted">Expert support whenever you need it</p>
        </div>
      </div>
    </div>
  );
};
