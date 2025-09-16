'use client';

import { useState } from 'react';
import { Download, QrCode, X } from 'lucide-react';

interface QrButtonProps {
  pollId: string;
  className?: string;
}

interface QrResponse {
  success: boolean;
  data?: {
    dataUrl: string;
    svg: string;
  };
  error?: string;
}

export default function QrButton({ pollId, className = '' }: QrButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrData, setQrData] = useState<QrResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQrCode = async () => {
    if (qrData) {
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/polls/${pollId}/qr`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch QR code: ${response.status}`);
      }

      const result: QrResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate QR code');
      }

      setQrData(result.data);
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrData?.dataUrl) return;

    const link = document.createElement('a');
    link.href = qrData.dataUrl;
    link.download = `poll-${pollId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <>
      {/* QR Button */}
      <button
        onClick={fetchQrCode}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Generate QR Code"
      >
        <QrCode className="w-4 h-4" />
        {isLoading ? 'Loading...' : 'QR Code'}
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            />

            {/* Modal panel */}
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal content */}
              <div className="mt-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Poll QR Code
                </h3>

                {error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={fetchQrCode}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Retry
                    </button>
                  </div>
                ) : qrData ? (
                  <div className="text-center">
                    {/* QR Code SVG */}
                    <div
                      className="inline-block p-4 bg-white border border-gray-200 rounded-lg mb-4"
                      dangerouslySetInnerHTML={{ __html: qrData.svg }}
                    />

                    {/* Download button */}
                    <div className="flex justify-center">
                      <button
                        onClick={downloadQrCode}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="w-4 h-4" />
                        Download PNG
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Generating QR code...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}