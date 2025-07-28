// App.js
import React from "react";
// import StockSearchCustom from "./components/StockCustom";
import StockMCP from "./components/StockMCP";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-2 px-6">
      <div className="w-full">
        <StockMCP />
      </div>
    </div>
  );
}

export default App;

