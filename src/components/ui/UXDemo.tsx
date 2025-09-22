import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LoadingSpinner,
  SkeletonCard,
  SkeletonTable,
  SkeletonGrid,
  LoadingOverlay,
  EmptyState
} from './index';
import { useToast } from '../../providers/UXProvider';
import { useLoading } from '../../providers/LoadingProvider';
import { Package, Users, BarChart3, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const UXDemo: React.FC = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'spinner' | 'skeleton' | 'progress'>('spinner');
  const { showToast } = useToast();
  const { showLoading: showGlobalLoading, hideAllLoading } = useLoading();

  const handleToastDemo = (type: 'info' | 'success' | 'warning' | 'danger') => {
    showToast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} toast with progress indicator`,
      tone: type,
      duration: 5000,
      progress: true,
      action: {
        label: 'View Details',
        onClick: () => {
          // Handle toast action - could navigate to relevant page or perform action
          console.log('Toast action clicked - functionality to be implemented');
        }
      }
    });
  };

  const handleLoadingDemo = async () => {
    setShowLoading(true);
    const loadingId = showGlobalLoading(`Loading with ${loadingType}...`, loadingType);

    // Simulate async operation
    setTimeout(() => {
      setShowLoading(false);
      hideAllLoading();
      showToast({
        title: 'Loading Complete',
        description: 'All data has been loaded successfully',
        tone: 'success',
        duration: 3000
      });
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="heading-lg text-ink mb-4">UX Polish Components Demo</h1>
        <p className="body-md text-muted">
          Showcase of all the new UX polish components and features
        </p>
      </div>

      {/* Loading Components Section */}
      <section className="space-y-6">
        <h2 className="heading-md text-ink">Loading Components</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-100 border border-line rounded-xl p-6">
            <h3 className="heading-sm mb-4">Loading Spinner</h3>
            <div className="flex justify-center">
              <LoadingSpinner size="lg" color="primary" />
            </div>
          </div>

          <div className="bg-surface-100 border border-line rounded-xl p-6">
            <h3 className="heading-sm mb-4">Loading Spinner (Small)</h3>
            <div className="flex justify-center">
              <LoadingSpinner size="sm" color="muted" />
            </div>
          </div>

          <div className="bg-surface-100 border border-line rounded-xl p-6">
            <h3 className="heading-sm mb-4">Loading Spinner (White)</h3>
            <div className="flex justify-center bg-ink p-4 rounded-lg">
              <LoadingSpinner size="md" color="white" />
            </div>
          </div>
        </div>
      </section>

      {/* Skeleton Components Section */}
      <section className="space-y-6">
        <h2 className="heading-md text-ink">Skeleton Components</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="heading-sm mb-4">Skeleton Cards</h3>
            <div className="space-y-4">
              <SkeletonCard variant="default" showAvatar />
              <SkeletonCard variant="compact" />
              <SkeletonCard variant="large" lines={5} />
            </div>
          </div>

          <div>
            <h3 className="heading-sm mb-4">Skeleton Table</h3>
            <SkeletonTable rows={4} columns={3} />
          </div>
        </div>

        <div>
          <h3 className="heading-sm mb-4">Skeleton Grid</h3>
          <SkeletonGrid items={6} variant="cards" />
        </div>
      </section>

      {/* Toast System Section */}
      <section className="space-y-6">
        <h2 className="heading-md text-ink">Enhanced Toast System</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleToastDemo('info')}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
          >
            Info Toast
          </button>
          <button
            onClick={() => handleToastDemo('success')}
            className="bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90"
          >
            Success Toast
          </button>
          <button
            onClick={() => handleToastDemo('warning')}
            className="bg-warning text-white px-4 py-2 rounded-lg hover:bg-warning/90"
          >
            Warning Toast
          </button>
          <button
            onClick={() => handleToastDemo('danger')}
            className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-danger/90"
          >
            Danger Toast
          </button>
        </div>
      </section>

      {/* Global Loading Section */}
      <section className="space-y-6">
        <h2 className="heading-md text-ink">Global Loading System</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setLoadingType('spinner');
              handleLoadingDemo();
            }}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
          >
            Show Spinner Loading
          </button>
          <button
            onClick={() => {
              setLoadingType('skeleton');
              handleLoadingDemo();
            }}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
          >
            Show Skeleton Loading
          </button>
          <button
            onClick={() => {
              setLoadingType('progress');
              handleLoadingDemo();
            }}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
          >
            Show Progress Loading
          </button>
        </div>
      </section>

      {/* Empty States Section */}
      <section className="space-y-6">
        <h2 className="heading-md text-ink">Empty States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EmptyState
            icon={Package}
            title="No Products"
            description="Get started by adding your first product to the catalog"
            action={{
              label: 'Add Product',
              onClick: () => {
                // Handle add product action - could navigate to products page or open modal
                console.log('Add product clicked - functionality to be implemented');
              }
            }}
          />

          <EmptyState
            icon={Users}
            title="No Customers"
            description="Customer management features will appear here"
            size="sm"
          />

          <EmptyState
            icon={BarChart3}
            title="No Data Available"
            description="Analytics and reports will be displayed once you have sufficient data"
            size="lg"
          />
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="heading-md text-ink">Usage Examples</h2>
        <div className="bg-surface-100 border border-line rounded-xl p-6">
          <h3 className="heading-sm mb-4">How to Use in Components</h3>
          <pre className="bg-ink text-white p-4 rounded-lg text-sm overflow-x-auto">
{`// Loading States
import { LoadingSpinner, SkeletonCard } from '../components/ui';

// In your component
const [isLoading, setIsLoading] = useState(true);

return (
  <>
    {isLoading ? (
      <SkeletonCard />
    ) : (
      <YourActualContent />
    )}
  </>
);
`}
          </pre>
        </div>

        <div className="bg-surface-100 border border-line rounded-xl p-6">
          <h3 className="heading-sm mb-4">Global Loading</h3>
          <pre className="bg-ink text-white p-4 rounded-lg text-sm overflow-x-auto">
{`// Global Loading
import { useLoading } from '../providers/LoadingProvider';

const YourComponent = () => {
  const { showLoading, hideLoading } = useLoading();

  const handleAsyncOperation = async () => {
    const loadingId = showLoading('Processing...', 'spinner');

    try {
      await yourAsyncFunction();
      hideLoading(loadingId);
    } catch (error) {
      hideLoading(loadingId);
    }
  };

  return <button onClick={handleAsyncOperation}>Start</button>;
};
`}
          </pre>
        </div>
      </section>
    </div>
  );
};
