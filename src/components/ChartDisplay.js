import { useState, useEffect, useCallback } from "react";

const ChartDisplay = ({ symbol, exchange }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchChart = useCallback(async () => {
    // Validate that we have both symbol and exchange
    if (!symbol || !exchange) {
      setError("Symbol and exchange are required");
      return;
    }

    setLoading(true);
    setError(null);
    setChartData(null);

    try {
      console.log(`Testing chart webhook... using symbol: ${symbol}, exchange: ${exchange}`);
      const response = await fetch(`http://localhost:3001/api/chart?symbol=${symbol}&exchange=${exchange}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is an image
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (contentType && (contentType.includes('image') || contentType.includes('application/pdf'))) {
        // Handle image/PDF response
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setChartData({
          type: 'image',
          url: imageUrl,
          blob: blob,
          contentType: contentType
        });
        console.log("Chart image received, URL created:", imageUrl);
      } else {
        // Handle JSON response
        const data = await response.json();
        setChartData({ type: 'json', data });
        console.log("Chart data received:", data);
      }
    } catch (err) {
      console.error("Failed to fetch test chart:", err);
      setError(err.message);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, exchange]);

  // Auto-fetch chart when symbol and exchange change
  useEffect(() => {
    if (symbol && exchange) {
      fetchChart();
    } else {
      // Reset state when no symbol or exchange
      setChartData(null);
      setError(null);
      setLoading(false);
    }
  }, [symbol, exchange, fetchChart]);

  const handleDownload = () => {
    if (chartData && chartData.type === 'image' && chartData.blob) {
      const link = document.createElement('a');
      link.href = chartData.url;

      // Determine file extension based on content type
      let extension = 'png';
      if (chartData.contentType.includes('pdf')) {
        extension = 'pdf';
      } else if (chartData.contentType.includes('jpeg')) {
        extension = 'jpg';
      }

      link.download = `test-chart-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Chart downloaded');
    }
  };

  const handleRetry = () => {
    fetchChart();
  };

  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📈 Stock Chart - {symbol || 'Select Stock'}
        </h3>
        <div className="flex space-x-2">
          {chartData && chartData.type === 'image' && (
            <button
              onClick={handleDownload}
              className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              disabled={loading}
            >
              📥 Download
            </button>
          )}
          {error && (
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? "Retrying..." : "Retry"}
            </button>
          )}
          <button
            onClick={fetchChart}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Chart"}
          </button>
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="text-sm text-gray-600">Loading chart...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-32 bg-red-50 rounded-lg border border-red-200">
            <div className="text-center space-y-2">
              <div className="text-red-500 text-2xl">⚠️</div>
              <p className="text-sm text-red-700 font-medium">Chart Error</p>
              <p className="text-xs text-red-600 max-w-xs">{error}</p>
            </div>
          </div>
        )}

        {chartData && !loading && !error && (
          <div className="space-y-4">
            {/* Chart Content */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">📊 Chart Results</h4>

              {chartData.type === 'image' && (
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Chart Image:</span>
                    <div className="mt-2 border rounded-lg overflow-hidden bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200">
                      <img
                        src={chartData.url}
                        alt="Test Chart"
                        className="w-full h-auto max-w-full hover:opacity-90 transition-opacity duration-200"
                        onClick={() => setIsModalOpen(true)}
                        onLoad={() => {
                          console.log('Test chart image loaded successfully');
                          console.log('Image URL:', chartData.url);
                        }}
                        onError={(e) => {
                          console.error('Failed to load chart image:', e);
                          console.log('Image URL that failed:', chartData.url);
                          console.log('Content Type:', chartData.contentType);
                          setError('Failed to load chart image');
                        }}
                        style={{ display: 'block' }}
                        title="Click to view larger"
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-1">
                      💡 Click image to view larger
                    </div>
                  </div>

                  {/* Debug Information
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div>✅ Chart image received from webhook</div>
                                        <div>📄 Content-Type: {chartData.contentType}</div>
                                        <div>🔗 Blob URL: {chartData.url.substring(0, 50)}...</div>
                                        <div>📊 Blob Size: {chartData.blob ? (chartData.blob.size / 1024).toFixed(2) + ' KB' : 'Unknown'}</div>
                                    </div> */}

                  {/* Raw blob URL for manual testing */}
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">Direct Link:</span>
                    <div className="mt-1">
                      <a
                        href={chartData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 underline text-sm"
                      >
                        Open image in new tab
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {chartData.type === 'json' && (
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Response Data:</span>
                    <div className="mt-1 p-3 bg-white rounded border text-sm text-gray-800">
                      <pre className="whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(chartData.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* If the JSON contains a URL, try to display it as an image */}
                  {chartData.data.url && (
                    <div>
                      <span className="font-medium text-gray-700">Chart from URL:</span>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img
                          src={chartData.data.url}
                          alt="Chart from JSON URL"
                          className="w-full h-auto"
                          onLoad={() => console.log('Chart from JSON URL loaded')}
                          onError={() => console.log('Failed to load chart from JSON URL')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Display other relevant fields */}
                  {chartData.data.success !== undefined && (
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${chartData.data.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {chartData.data.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  )}

                  {chartData.data.message && (
                    <div>
                      <span className="font-medium text-gray-700">Message:</span>
                      <div className="mt-1 p-2 bg-white rounded border text-sm">
                        {chartData.data.message}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 text-center">
              Chart loaded automatically • Click "Refresh Chart" to reload
            </div>
          </div>
        )}

        {/* Initial state - no data */}
        {!chartData && !loading && !error && !symbol && (
          <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-gray-400 text-2xl">📊</div>
              <p className="text-sm text-gray-600">Select a stock to view its chart</p>
              <p className="text-xs text-gray-500">Chart will load automatically when stock is selected</p>
            </div>
          </div>
        )}

        {/* Fallback state - when chart is not available */}
        {!chartData && !loading && !error && symbol && (
          <div className="flex flex-col items-center justify-center h-32 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-center space-y-2">
              <div className="text-yellow-500 text-2xl">📈</div>
              <p className="text-sm text-yellow-700 font-medium">Chart Not Available</p>
              <p className="text-xs text-yellow-600">Chart data for {symbol} could not be loaded</p>
              <button
                onClick={fetchChart}
                className="mt-2 px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isModalOpen && chartData && chartData.type === 'image' && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-7xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10"
              title="Close (ESC)"
            >
              ✕
            </button>

            {/* Modal content */}
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-h-full">
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📊 Chart Image - Full Size
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200"
                    >
                      📥 Download
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 max-h-[80vh] overflow-auto">
                <img
                  src={chartData.url}
                  alt="Test Chart - Full Size"
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: '70vh' }}
                />
              </div>

              <div className="p-3 bg-gray-50 border-t text-center">
                <p className="text-xs text-gray-500">
                  Click outside or press ESC to close • Right-click image to save
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartDisplay;