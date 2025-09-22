import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Heart,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  Award,
  Lock,
  HeadphonesIcon,
  Zap,
  Target,
  Smile,
  Coffee,
  ChefHat,
  Building2
} from 'lucide-react';
import { Card, Button } from '@mas/ui';
import { cn } from '@mas/utils';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  business: string;
  location: string;
  quote: string;
  rating: number;
  image?: string;
  metric?: string;
  improvement?: string;
}

interface ValueProposition {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  color: string;
}

interface BrandMessagingProps {
  variant?: 'hero' | 'section' | 'compact';
  showTestimonials?: boolean;
  showStats?: boolean;
  showCta?: boolean;
}

const valuePropositions: ValueProposition[] = [
  {
    id: 'peace-of-mind',
    icon: <Shield size={24} />,
    title: 'Peace of Mind',
    description: 'Focus on your customers while we handle the complexity of running your restaurant operations.',
    benefits: [
      'Never worry about missed orders or inventory shortages',
      'Real-time alerts prevent costly mistakes',
      'Automated compliance and reporting',
      '24/7 system monitoring and support'
    ],
    color: 'success'
  },
  {
    id: 'operational-excellence',
    icon: <Target size={24} />,
    title: 'Operational Excellence',
    description: 'Streamlined workflows designed by restaurant experts who understand your daily challenges.',
    benefits: [
      'Reduce staff training time by 60%',
      'Eliminate manual processes and errors',
      'Increase table turnover by 25%',
      'Never run out of popular items again'
    ],
    color: 'primary'
  },
  {
    id: 'financial-clarity',
    icon: <TrendingUp size={24} />,
    title: 'Financial Clarity',
    description: 'Know exactly where your money is going and how to optimize every aspect of your business.',
    benefits: [
      'Real-time profit and loss tracking',
      'Menu engineering insights',
      'Staff performance analytics',
      'Automated cost control alerts'
    ],
    color: 'warning'
  }
];

const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Sarah Chen',
    role: 'Owner & Head Chef',
    business: 'Golden Dragon Bistro',
    location: 'San Francisco, CA',
    quote: 'MAS transformed how we run our restaurant. We went from chaotic service to smooth operations overnight. Our staff loves it, our customers notice the difference, and our profits have increased by 35%.',
    rating: 5,
    metric: '35% profit increase',
    improvement: 'Staff efficiency +40%'
  },
  {
    id: 'testimonial-2',
    name: 'Marcus Rodriguez',
    role: 'General Manager',
    business: 'Bella Vista Italian',
    location: 'Austin, TX',
    quote: 'The peace of mind is incredible. I used to worry about inventory, staff scheduling, and compliance. Now I focus on creating amazing experiences for our guests. MAS handles everything else.',
    rating: 5,
    metric: '50% fewer errors',
    improvement: 'Customer satisfaction +4.2/5'
  },
  {
    id: 'testimonial-3',
    name: 'Jennifer Walsh',
    role: 'Owner',
    business: 'Corner Café & Bakery',
    location: 'Portland, OR',
    quote: 'As a single mom running a café, I needed something simple but powerful. MAS gave me back my evenings and weekends. My business runs smoothly even when I\'m not there.',
    rating: 5,
    metric: '25 hours saved/week',
    improvement: 'Work-life balance restored'
  }
];

const keyStats = [
  { label: 'Restaurants Served', value: '10,000+', icon: <Building2 size={20} /> },
  { label: 'Average Profit Increase', value: '32%', icon: <TrendingUp size={20} /> },
  { label: 'Customer Satisfaction', value: '4.8/5', icon: <Star size={20} /> },
  { label: 'Time Saved Daily', value: '3 hours', icon: <Clock size={20} /> }
];

const trustIndicators = [
  { icon: <Lock size={16} />, text: 'Bank-level security & encryption' },
  { icon: <Shield size={16} />, text: 'PCI DSS compliant' },
  { icon: <Award size={16} />, text: 'SOC 2 Type II certified' },
  { icon: <HeadphonesIcon size={16} />, text: '24/7 expert support' },
  { icon: <Zap size={16} />, text: '99.9% uptime guarantee' },
  { icon: <Heart size={16} />, text: '30-day money-back guarantee' }
];

export const BrandMessaging: React.FC<BrandMessagingProps> = ({
  variant = 'section',
  showTestimonials = true,
  showStats = true,
  showCta = true
}) => {
  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-surface-50 to-success-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">
                Peace of Mind for
                <span className="text-primary-600"> Restaurant Owners</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted">
                Stop worrying about operations. Start focusing on what matters most—your customers and your passion for great food.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" className="px-8">
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Brand Promise */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-800"
        >
          <Heart size={16} />
          Trusted by 10,000+ restaurants worldwide
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Finally, a restaurant system that
            <span className="text-primary-600"> understands you</span>
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            We know the restaurant business because we've lived it. Every feature, every workflow,
            every alert is designed to give you peace of mind and help you succeed.
          </p>
        </motion.div>
      </div>

      {/* Value Propositions */}
      <div className="grid gap-8 md:grid-cols-3">
        {valuePropositions.map((prop: ValueProposition, index: number) => (
          <motion.div
            key={prop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full p-6 space-y-4">
              <div className={cn(
                'inline-flex items-center justify-center w-12 h-12 rounded-xl',
                prop.color === 'success' && 'bg-success/10 text-success',
                prop.color === 'primary' && 'bg-primary-100 text-primary-600',
                prop.color === 'warning' && 'bg-warning/10 text-warning'
              )}>
                {prop.icon}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-ink mb-2">{prop.title}</h3>
                <p className="text-muted mb-4">{prop.description}</p>

                <ul className="space-y-2">
                  {prop.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-ink">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Key Stats */}
      {showStats && (
        <div className="bg-surface-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-ink mb-2">Real Results from Real Restaurants</h3>
            <p className="text-muted">Join thousands of restaurant owners who've transformed their businesses</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {keyStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-xl mb-3">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-ink mb-1">{stat.value}</div>
                <div className="text-sm text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="bg-surface-100 rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-ink mb-2">Your Success is Our Priority</h3>
          <p className="text-muted">We're committed to your restaurant's success with enterprise-grade reliability</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustIndicators.map((indicator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-success/10 text-success rounded-lg">
                {indicator.icon}
              </div>
              <span className="text-sm text-ink">{indicator.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      {showTestimonials && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-ink mb-2">What Restaurant Owners Say</h3>
            <p className="text-muted">Real stories from real restaurant owners who've transformed their businesses</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full p-6 space-y-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-warning fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-ink italic">
                    "{testimonial.quote}"
                  </blockquote>

                  <div className="flex items-center justify-between pt-4 border-t border-line/50">
                    <div>
                      <div className="font-semibold text-ink">{testimonial.name}</div>
                      <div className="text-sm text-muted">{testimonial.role}</div>
                      <div className="text-sm text-muted">{testimonial.business}</div>
                    </div>

                    <div className="text-right">
                      {testimonial.metric && (
                        <div className="text-sm font-semibold text-success">{testimonial.metric}</div>
                      )}
                      {testimonial.improvement && (
                        <div className="text-xs text-muted">{testimonial.improvement}</div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {showCta && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center space-y-6"
        >
          <div className="bg-gradient-to-r from-primary-50 to-success-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-ink mb-3">
              Ready to Transform Your Restaurant?
            </h3>
            <p className="text-muted mb-6 max-w-2xl mx-auto">
              Join thousands of restaurant owners who've found their peace of mind with MAS.
              Start your free trial today—no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg">
                Schedule Demo
              </Button>
            </div>

            <p className="text-sm text-muted mt-4">
              ✓ 30-day free trial ✓ No setup fees ✓ Cancel anytime ✓ 24/7 support
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
