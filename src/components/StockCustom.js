import { useState, useEffect } from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Highlight,
  connectAutoComplete,
} from "react-instantsearch-dom";
import PriceInfo from "./PriceInfo";
import ChartDisplay from "./ChartDisplay";
import StockAnalysis from "./StockAnalysis";
import { Search, TrendingUp, BarChart3, Activity, Sparkles } from "lucide-react";


const app_id = process.env.REACT_APP_ALGOLIA_CUSTOM_APP_ID;
const API_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY;
const searchClient = algoliasearch(app_id, API_KEY);

const AutocompleteUI = ({ hits, currentRefinement, refine }) => {
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [exchange, setExchange] = useState("");
  const [priceData, setPriceData] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        console.log(`Fetching price for ${selectedSymbol}`);
        const res = await fetch(`http://localhost:3001/api/price/${selectedSymbol}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setPriceData(data);
      } catch (err) {
        console.error("Failed to fetch price:", err);
        setPriceData(null);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
  }, [selectedSymbol]);

  const handleSelect = (hit) => {
    console.log("Selected stock:", hit);
    refine(hit.symbol);
    setSelectedSymbol(hit.symbol);
    setExchange(hit.exchange);
    setPriceData(null);
    setShowResults(false);
    refine('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">StockSearch Pro</h1>
                <p className="text-sm text-slate-600">Real-time market data & analysis</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>Live Data</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>Advanced Charts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>AI Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Discover Your Next 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Investment</span>
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Search thousands of stocks with real-time data, advanced charting, and AI-powered analysis
          </p>

          {/* Enhanced Search Input */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className={`relative transition-all duration-300 ${
              isSearchFocused ? 'transform scale-105' : ''
            }`}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors duration-200 ${
                  isSearchFocused ? 'text-blue-500' : 'text-slate-400'
                }`} />
              </div>
              <input
                type="search"
                value={currentRefinement}
                onChange={(e) => refine(e.currentTarget.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setShowResults(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setIsSearchFocused(false);
                    setShowResults(false);
                  }, 200);
                }}
                placeholder="Search stocks by symbol or company name..."
                className="w-full pl-12 pr-6 py-4 text-lg bg-white border-2 border-slate-200 rounded-2xl shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 placeholder-slate-400"
              />
              {currentRefinement && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="animate-pulse bg-blue-500 h-2 w-2 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Enhanced Search Results */}
            {hits.length > 0 && currentRefinement && showResults && (
              <div className="mt-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto ring-1 ring-black/5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-600">
                    {hits.length} result{hits.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                {hits.map((hit, index) => (
                  <div
                    key={hit.objectID}
                    onClick={() => handleSelect(hit)}
                    className="group p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 border-b border-slate-50 last:border-b-0 hover:border-blue-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                          <Highlight attribute="symbol" hit={hit} />
                        </div>
                        <div className="text-slate-600 text-sm mt-0.5 group-hover:text-slate-700 transition-colors truncate">
                          <Highlight attribute="name" hit={hit} />
                        </div>
                        {hit.exchange && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {hit.exchange}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Select
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {selectedSymbol ? (
          <div className="space-y-8">
            {/* Stock Header */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                {selectedSymbol}
                {exchange && (
                  <span className="text-lg font-normal text-slate-600 ml-3">
                    • {exchange}
                  </span>
                )}
              </h3>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
            </div>

            {/* Top Row - Price Info and AI Analysis Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
                  <h4 className="text-xl font-bold text-white flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Price Information
                  </h4>
                </div>
                <div className="p-6">
                  <PriceInfo
                    symbol={selectedSymbol}
                    priceData={priceData}
                    loading={priceLoading}
                  />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                  <h4 className="text-xl font-bold text-white flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    AI Analysis
                  </h4>
                </div>
                <div className="p-6">
                  <StockAnalysis symbol={selectedSymbol} />
                </div>
              </div>
            </div>

            {/* Bottom Row - Price Chart Full Width */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <h4 className="text-xl font-bold text-white flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Price Chart
                </h4>
              </div>
              <div className="p-6">
                <ChartDisplay
                  symbol={selectedSymbol}
                  exchange={exchange}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Start Your Market Research
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Search for any stock symbol or company name to access real-time data, advanced charts, and detailed analysis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Activity, title: "Real-time Data", desc: "Live prices and market updates" },
                { icon: BarChart3, title: "Advanced Charts", desc: "Interactive technical analysis" },
                { icon: Sparkles, title: "AI Insights", desc: "Smart market intelligence" }
              ].map((feature, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:bg-white/80 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomAutocomplete = connectAutoComplete(AutocompleteUI);

export default function StockCustom() {
  return (
    <InstantSearch indexName="stock_name_types" searchClient={searchClient}>
      <CustomAutocomplete />
    </InstantSearch>
  );
}