

const PriceInfo = ({ symbol, priceData, loading }) => {
  if (!symbol) return null;

  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50 space-y-1">
      <p className="font-medium text-lg">📊 {symbol}</p>
      {loading ? (
        <p>Loading price...</p>
      ) : (
        <>
          <p><strong>Price:</strong> ${priceData?.price ?? "N/A"}</p>
          <p><strong>Open:</strong> ${priceData?.open ?? "N/A"}</p>
          <p><strong>High:</strong> ${priceData?.high ?? "N/A"}</p>
          <p><strong>Low:</strong> ${priceData?.low ?? "N/A"}</p>
          <p className={`font-semibold ${priceData?.change < 0 ? "text-red-600" : "text-green-600"}`}>
            {priceData?.change} ({priceData?.percent})
          </p>
        </>
      )}
    </div>
  );
};

export default PriceInfo;