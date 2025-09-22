import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Receipt,
  CheckCircle,
  ArrowLeft,
  Printer,
  Mail,
  Download,
  Clock,
  User,
  Calendar,
  Hash
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';
import { MotionWrapper } from '../ui/MotionWrapper';

interface PaymentProps {
  orderId?: string;
}

interface Order {
  id: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  orderType: string;
  status: string;
  createdAt: Date;
  tableNumber?: string;
  customerName: string;
}

export const Payment: React.FC<PaymentProps> = ({ orderId }) => {
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'split'>('cash');
  const [cashReceived, setCashReceived] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Get order from localStorage or URL params
    if (orderId) {
      const orders = JSON.parse(localStorage.getItem('pos-orders') || '[]');
      const foundOrder = orders.find((o: Order) => o.id === orderId);
      if (foundOrder) {
        // Convert createdAt string back to Date object
        const orderWithDate = {
          ...foundOrder,
          createdAt: new Date(foundOrder.createdAt)
        };
        setOrder(orderWithDate);
        setCardAmount(foundOrder.total);
      }
    } else {
      // Get the latest order if no specific order ID
      const orders = JSON.parse(localStorage.getItem('pos-orders') || '[]');
      if (orders.length > 0) {
        const latestOrder = orders[orders.length - 1];
        // Convert createdAt string back to Date object
        const orderWithDate = {
          ...latestOrder,
          createdAt: new Date(latestOrder.createdAt)
        };
        setOrder(orderWithDate);
        setCardAmount(latestOrder.total);
      }
    }
  }, [orderId]);

  const handlePayment = async () => {
    if (!order) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update order status
    const orders = JSON.parse(localStorage.getItem('pos-orders') || '[]');
    const updatedOrders = orders.map((o: Order) =>
      o.id === order.id ? { ...o, status: 'paid' } : o
    );
    localStorage.setItem('pos-orders', JSON.stringify(updatedOrders));

    setIsProcessing(false);
    setIsComplete(true);

    showToast({
      title: 'Payment Successful',
      description: `Order #${order.id.slice(-6)} has been paid`,
      tone: 'success',
      duration: 5000
    });
  };

  const handlePrintReceipt = () => {
    showToast({
      title: 'Receipt Printed',
      description: 'Receipt has been sent to printer',
      tone: 'info',
      duration: 2000
    });
  };

  const handleEmailReceipt = () => {
    showToast({
      title: 'Receipt Emailed',
      description: 'Receipt has been sent to customer email',
      tone: 'info',
      duration: 2000
    });
  };

  const handleNewOrder = () => {
    window.location.href = '/pos';
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-100 flex items-center justify-center">
        <div className="text-center">
          <Receipt size={64} className="mx-auto mb-4 text-muted" />
          <h2 className="heading-lg mb-2">No Order Found</h2>
          <p className="body-sm text-muted mb-6">No order data available for payment processing</p>
          <Button onClick={() => window.location.href = '/pos'}>
            <ArrowLeft size={16} className="mr-2" />
            Back to POS
          </Button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-surface-100 flex items-center justify-center">
        <motion.div
          className="bg-surface-200 rounded-2xl p-8 text-center max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="heading-lg mb-2">Payment Complete!</h2>
          <p className="body-sm text-muted mb-6">
            Order #{order.id.slice(-6)} has been successfully processed
          </p>

          <div className="space-y-3">
            <Button onClick={handlePrintReceipt} className="w-full gap-2">
              <Printer size={16} />
              Print Receipt
            </Button>
            <Button onClick={handleEmailReceipt} variant="outline" className="w-full gap-2">
              <Mail size={16} />
              Email Receipt
            </Button>
            <Button onClick={handleNewOrder} variant="outline" className="w-full gap-2">
              <ArrowLeft size={16} />
              New Order
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <MotionWrapper type="page">
      <div className="min-h-screen bg-surface-100">
        <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/pos'}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back to POS
            </Button>
            <div>
              <h1 className="heading-lg">Payment</h1>
              <p className="body-sm text-muted">Process payment for Order #{order.id.slice(-6)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="heading-sm">${order.total.toFixed(2)}</p>
            <p className="body-xs text-muted">Total Amount</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-surface-200 rounded-xl p-6">
            <h3 className="heading-sm mb-4">Order Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Order ID</span>
                <span className="body-sm font-medium">#{order.id.slice(-6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Type</span>
                <span className="body-sm font-medium capitalize">{order.orderType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Customer</span>
                <span className="body-sm font-medium">{order.customerName}</span>
              </div>
              {order.tableNumber && (
                <div className="flex items-center justify-between">
                  <span className="body-sm text-muted">Table</span>
                  <span className="body-sm font-medium">{order.tableNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Date</span>
                <span className="body-sm font-medium">
                  {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-line pt-4">
              <h4 className="font-medium mb-3">Items ({order.items.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="body-sm font-medium">{item.product.name}</p>
                      <p className="body-xs text-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="body-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-line pt-4 mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Subtotal</span>
                <span className="body-sm">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-sm text-muted">Tax</span>
                <span className="body-sm">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="body-sm">Total</span>
                <span className="body-sm">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-surface-200 rounded-xl p-6">
            <h3 className="heading-sm mb-4">Payment Method</h3>

            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-line bg-surface-100 hover:bg-surface-300'
                  }`}
                >
                  <DollarSign size={24} className="mx-auto mb-2" />
                  <p className="body-xs font-medium">Cash</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-line bg-surface-100 hover:bg-surface-300'
                  }`}
                >
                  <CreditCard size={24} className="mx-auto mb-2" />
                  <p className="body-xs font-medium">Card</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('split')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'split'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-line bg-surface-100 hover:bg-surface-300'
                  }`}
                >
                  <div className="mx-auto mb-2 flex gap-1">
                    <DollarSign size={12} />
                    <CreditCard size={12} />
                  </div>
                  <p className="body-xs font-medium">Split</p>
                </button>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                {paymentMethod === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Cash Received</label>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {cashReceived > 0 && (
                      <p className="text-sm text-muted mt-2">
                        Change: ${(cashReceived - order.total).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Amount</label>
                    <input
                      type="number"
                      value={cardAmount}
                      onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}

                {paymentMethod === 'split' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cash Amount</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Amount</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Process Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full gap-2"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Clock size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Process Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MotionWrapper>
  );
};
