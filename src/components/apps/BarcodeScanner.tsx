import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  Zap,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@mas/ui';
import { useToast } from '../../providers/UXProvider';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult?: (barcode: string, product?: any) => void;
  onProductFound?: (product: any) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScanResult,
  onProductFound
}) => {
  const { showToast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock product database - in real app this would come from API
  const mockProducts: Record<string, any> = {
    '123456789012': { id: '1', name: 'Espresso', price: 3.50, category: 'Beverages' },
    '234567890123': { id: '2', name: 'Cappuccino', price: 4.25, category: 'Beverages' },
    '345678901234': { id: '3', name: 'Caesar Salad', price: 12.99, category: 'Food' },
    '456789012345': { id: '4', name: 'Margherita Pizza', price: 16.50, category: 'Food' },
    '567890123456': { id: '5', name: 'Chocolate Cake', price: 6.75, category: 'Desserts' },
    '678901234567': { id: '6', name: 'House Wine', price: 8.00, category: 'Beverages' },
    '789012345678': { id: '7', name: 'Grilled Salmon', price: 24.99, category: 'Food' },
    '890123456789': { id: '8', name: 'Tiramisu', price: 7.50, category: 'Desserts' },
  };

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      showToast({
        title: 'Camera Access Error',
        description: 'Unable to access camera. Please check permissions.',
        tone: 'danger',
        duration: 3000
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleScan = (barcode: string) => {
    if (barcode === lastScanned && !continuousMode) return;

    setLastScanned(barcode);
    setScanHistory(prev => [barcode, ...prev.slice(0, 9)]); // Keep last 10 scans

    const product = mockProducts[barcode];

    if (soundEnabled) {
      // Play scan sound (in real app, use Web Audio API)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IAAAAAEAAQARAAAAEAAAAAEACABkYXRhAgAAAAEA');
      audio.play().catch(() => {}); // Ignore errors if audio fails
    }

    if (product) {
      showToast({
        title: 'Product Found',
        description: `${product.name} - $${product.price.toFixed(2)}`,
        tone: 'success',
        duration: 2000
      });
      onProductFound?.(product);
    } else {
      showToast({
        title: 'Product Not Found',
        description: `Barcode: ${barcode}`,
        tone: 'warning',
        duration: 2000
      });
    }

    onScanResult?.(barcode, product);
  };

  const simulateScan = (barcode: string) => {
    handleScan(barcode);
  };

  const clearHistory = () => {
    setScanHistory([]);
    setLastScanned('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-line bg-surface-100/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
              <div>
                <h2 className="heading-sm text-ink">Barcode Scanner</h2>
                <p className="body-xs text-muted">
                  {isScanning ? 'Scanning...' : 'Ready to scan'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`rounded-lg p-2 transition-colors ${
                  soundEnabled
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-200 text-muted hover:bg-surface-300'
                }`}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => setContinuousMode(!continuousMode)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  continuousMode
                    ? 'bg-success text-white'
                    : 'bg-surface-200 text-muted hover:bg-surface-300'
                }`}
              >
                {continuousMode ? 'Continuous' : 'Single'}
              </button>
            </div>
          </div>

          {/* Camera View */}
          <div className="flex-1 relative bg-ink">
            {isScanning ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Scan Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Scanning Frame */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative w-64 h-40 border-2 border-primary-500 rounded-lg">
                      {/* Corner markers */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>

                      {/* Scanning line */}
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500"
                        animate={{
                          top: ['0%', '100%', '0%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-white text-sm mb-2">Position barcode within the frame</p>
                    <div className="flex items-center justify-center gap-2 text-primary-300">
                      <Zap size={16} />
                      <span className="text-xs">Scanning active</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <h3 className="heading-sm mb-2">Camera Ready</h3>
                  <p className="body-sm text-white/70 mb-6">
                    Click start to begin scanning barcodes
                  </p>
                  <Button
                    onClick={() => setIsScanning(true)}
                    className="gap-2"
                  >
                    <Camera size={18} />
                    Start Scanning
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="p-4 border-t border-line bg-surface-100/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  disabled={!isScanning}
                  className="rounded-lg border border-line bg-surface-100 px-4 py-2 text-sm font-medium hover:bg-surface-200 transition-colors disabled:opacity-50"
                >
                  {isScanning ? 'Stop' : 'Start'}
                </button>

                <button
                  onClick={clearHistory}
                  className="rounded-lg border border-line bg-surface-100 px-4 py-2 text-sm font-medium hover:bg-surface-200 transition-colors"
                >
                  <RotateCcw size={16} className="inline mr-2" />
                  Clear
                </button>
              </div>

              {/* Quick Test Barcodes */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Test:</span>
                {Object.keys(mockProducts).slice(0, 3).map((barcode) => (
                  <button
                    key={barcode}
                    onClick={() => simulateScan(barcode)}
                    className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                  >
                    {barcode.slice(-4)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scan History Sidebar */}
          {scanHistory.length > 0 && (
            <div className="absolute right-4 top-20 w-64 bg-surface-100/95 backdrop-blur-md rounded-lg border border-line shadow-xl">
              <div className="p-3 border-b border-line">
                <h4 className="font-medium text-sm">Recent Scans</h4>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {scanHistory.map((barcode, index) => {
                  const product = mockProducts[barcode];
                  return (
                    <div
                      key={`${barcode}-${index}`}
                      className="p-3 border-b border-line/50 last:border-b-0 hover:bg-surface-200/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product ? product.name : `Unknown (${barcode})`}
                          </p>
                          <p className="text-xs text-muted">
                            {product ? `$${product.price.toFixed(2)}` : 'Not found'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {product ? (
                            <CheckCircle size={14} className="text-success" />
                          ) : (
                            <AlertCircle size={14} className="text-warning" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
