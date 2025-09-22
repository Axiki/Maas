import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  Video,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  ChevronRight
} from 'lucide-react';
import { MotionWrapper } from '../ui/MotionWrapper';
import { Card, Button } from '@mas/ui';
import { Input } from '../../packages/ui/input';
import { useToast } from '../../providers/UXProvider';

const supportCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using MAS',
    icon: BookOpen,
    articles: 12,
    color: 'text-primary-600'
  },
  {
    id: 'pos',
    title: 'Point of Sale',
    description: 'POS operations and troubleshooting',
    icon: Phone,
    articles: 28,
    color: 'text-success'
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Stock tracking and transfers',
    icon: FileText,
    articles: 15,
    color: 'text-warning'
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Understanding your data',
    icon: CheckCircle,
    articles: 9,
    color: 'text-danger'
  }
];

const quickActions = [
  {
    title: 'Contact Support',
    description: 'Get help from our team',
    icon: MessageCircle,
    action: 'contact',
    color: 'bg-primary-500'
  },
  {
    title: 'Schedule Training',
    description: 'Book a training session',
    icon: Users,
    action: 'training',
    color: 'bg-success'
  },
  {
    title: 'System Status',
    description: 'Check service availability',
    icon: CheckCircle,
    action: 'status',
    color: 'bg-warning'
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step guides',
    icon: Video,
    action: 'videos',
    color: 'bg-danger'
  }
];

const recentArticles = [
  {
    title: 'How to Process a Return in POS',
    category: 'POS',
    updated: '2 hours ago',
    views: 245
  },
  {
    title: 'Setting Up Inventory Transfers',
    category: 'Inventory',
    updated: '1 day ago',
    views: 189
  },
  {
    title: 'Understanding Sales Reports',
    category: 'Reports',
    updated: '3 days ago',
    views: 156
  },
  {
    title: 'Managing Customer Loyalty Points',
    category: 'Customers',
    updated: '1 week ago',
    views: 98
  }
];

export const Support: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'contact':
        showToast({
          title: 'Support Request',
          description: 'Opening support chat...',
          tone: 'info',
          duration: 3000
        });
        break;
      case 'training':
        showToast({
          title: 'Training Session',
          description: 'Redirecting to training booking...',
          tone: 'info',
          duration: 3000
        });
        break;
      case 'status':
        showToast({
          title: 'System Status',
          description: 'All systems operational',
          tone: 'success',
          duration: 3000
        });
        break;
      case 'videos':
        showToast({
          title: 'Video Tutorials',
          description: 'Opening video library...',
          tone: 'info',
          duration: 3000
        });
        break;
    }
  };

  return (
    <MotionWrapper type="page" className="p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <HelpCircle size={24} />
            </div>
            <h1 className="heading-lg">Support Center</h1>
          </div>
          <p className="body-lg text-muted max-w-2xl mx-auto">
            Get help with MAS. Browse our knowledge base, contact support, or schedule training.
          </p>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted" />
              <Input
                type="text"
                placeholder="Search for help articles, guides, or documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg"
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <section>
          <h2 className="heading-md mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.action}
                className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleQuickAction(action.action)}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} text-white`}>
                    <action.icon size={24} />
                  </div>
                  <div>
                    <h3 className="body-md font-semibold">{action.title}</h3>
                    <p className="body-sm text-muted">{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Support Categories */}
        <section>
          <h2 className="heading-md mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportCategories.map((category) => (
              <Card key={category.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-surface-100 ${category.color}`}>
                      <category.icon size={24} />
                    </div>
                    <div>
                      <h3 className="body-md font-semibold">{category.title}</h3>
                      <p className="body-sm text-muted">{category.description}</p>
                      <p className="body-xs text-muted mt-1">{category.articles} articles</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-muted" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Articles */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-md">Recent Articles</h2>
            <Button variant="ghost" size="sm">
              View All Articles
              <ChevronRight size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentArticles.map((article, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="body-sm font-semibold mb-1">{article.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-100">
                        {article.category}
                      </span>
                      <span>Updated {article.updated}</span>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Information */}
        <Card className="p-6 bg-primary-50 border-primary-200">
          <div className="text-center space-y-4">
            <h2 className="heading-md text-primary-700">Need More Help?</h2>
            <p className="body-md text-primary-600">
              Our support team is available 24/7 to help you succeed with MAS.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => window.open('tel:+1-555-0123', '_self')}
                className="gap-2"
              >
                <Phone size={16} />
                Call Support
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAction('contact')}
                className="gap-2"
              >
                <MessageCircle size={16} />
                Start Chat
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('mailto:support@mas.app', '_self')}
                className="gap-2"
              >
                <Mail size={16} />
                Email Us
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </MotionWrapper>
  );
};
