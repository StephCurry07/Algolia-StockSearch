// App.js
import React from "react";
import StockSearchCustom from "./components/StockCustom";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-6">
      <div className="w-full">
        <StockSearchCustom />
      </div>
    </div>
  );
}

export default App;

