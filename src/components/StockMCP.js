import { useState, useEffect } from "react";
import { Search, TrendingUp, BarChart3, Activity, Sparkles } from "lucide-react";
import PriceInfo from "./PriceInfo";
import ChartDisplay from "./ChartDisplay";
import StockAnalysis from "./StockAnalysis";

const StockMCP = () => {
  const [query, setQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [exchange, setExchange] = useState("");
  const [priceData, setPriceData] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Call MCP search when typing
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/mcp/searchStocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("MCP Search error:", err);
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Fetch price data when symbol is selected
  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        console.log(`Fetching price for ${selectedSymbol} via MCP`);
        const res = await fetch(`http://localhost:3001/api/price-twelve?symbol=${selectedSymbol}&interval=1day`);
        
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

  // Fetch MCP analysis when symbol is selected
  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchMCPAnalysis = async () => {
      setAnalysisLoading(true);
      try {
        console.log(`Fetching MCP analysis for ${selectedSymbol}`);
        const res = await fetch("http://localhost:3001/mcp/analyzeStock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: selectedSymbol }),
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        // Check content type to determine how to parse the response
        const contentType = res.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          // Parse as JSON
          data = await res.json();
        } else {
          // Parse as text and create a structured object
          const textResponse = await res.text();
          data = {
            analysis: textResponse,
            type: 'text',
            source: 'MCP'
          };
        }
        
        setAnalysisData(data);
        console.log("MCP Analysis data received:", data);
      } catch (err) {
        console.error("Failed to fetch MCP analysis:", err);
        setAnalysisData(null);
      } finally {
        setAnalysisLoading(false);
      }
    };

    fetchMCPAnalysis();
  }, [selectedSymbol]);

  const handleSelect = (hit) => {
    console.log("Selected stock via MCP:", hit);
    setSelectedSymbol(hit.symbol);
    setExchange(hit.exchange);
    setQuery(hit.symbol);
    setSearchResults([]);
    setShowResults(false);
    setPriceData(null); // Reset price data
  };

  const formatAnalysisContent = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const formattedElements = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        formattedElements.push(
          <div key={`space-${index}`} className="h-3"></div>
        );
        return;
      }

      if (trimmedLine.startsWith('### ')) {
        const headerText = trimmedLine.replace('### ', '');
        formattedElements.push(
          <div key={`header-${index}`} className="mb-6 mt-8 first:mt-0">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{headerText}</h2>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
          </div>
        );
        return;
      }

      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const subHeaderText = trimmedLine.replace(/\*\*/g, '');
        formattedElements.push(
          <div key={`subheader-${index}`} className="mb-4 mt-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              {subHeaderText}
            </h3>
          </div>
        );
        return;
      }

      if (trimmedLine.startsWith('- **')) {
        const bulletContent = trimmedLine.replace('- **', '').replace('**:', ':');
        const [boldPart, ...restParts] = bulletContent.split(':');
        const restText = restParts.join(':');

        let icon = <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>;
        let colorClass = 'text-slate-700';

        if (boldPart.toLowerCase().includes('bullish') || boldPart.toLowerCase().includes('support')) {
          icon = <TrendingUp className="h-3 w-3 text-emerald-600" />;
          colorClass = 'text-emerald-700';
        } else if (boldPart.toLowerCase().includes('bearish') || boldPart.toLowerCase().includes('resistance')) {
          icon = <div className="h-3 w-3 text-red-600">📉</div>;
          colorClass = 'text-red-700';
        } else if (boldPart.toLowerCase().includes('rsi') || boldPart.toLowerCase().includes('levels')) {
          icon = <Activity className="h-3 w-3 text-amber-600" />;
          colorClass = 'text-amber-700';
        }

        formattedElements.push(
          <div key={`bullet-${index}`} className="flex items-start space-x-3 mb-3 ml-4">
            <div className="mt-2 flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1">
              <span className={`font-semibold ${colorClass}`}>{boldPart}</span>
              {restText && <span className="text-slate-600">: {restText.trim()}</span>}
            </div>
          </div>
        );
        return;
      }

      if (trimmedLine.startsWith('- ')) {
        const bulletText = trimmedLine.replace('- ', '');
        formattedElements.push(
          <div key={`simple-bullet-${index}`} className="flex items-start space-x-3 mb-2 ml-4">
            <div className="mt-2 flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            </div>
            <span className="text-slate-600 leading-relaxed">{bulletText}</span>
          </div>
        );
        return;
      }

      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        const formattedParts = parts.map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            let colorClass = 'text-slate-900';
            if (part.toLowerCase().includes('resistance')) {
              colorClass = 'text-red-700';
            } else if (part.toLowerCase().includes('support')) {
              colorClass = 'text-emerald-700';
            } else if (part.toLowerCase().includes('bullish')) {
              colorClass = 'text-emerald-700';
            } else if (part.toLowerCase().includes('bearish')) {
              colorClass = 'text-red-700';
            }
            return (
              <span key={partIndex} className={`font-bold ${colorClass}`}>
                {part}
              </span>
            );
          }
          return <span key={partIndex}>{part}</span>;
        });

        formattedElements.push(
          <div key={`bold-text-${index}`} className="mb-3">
            <p className="text-slate-700 leading-relaxed">{formattedParts}</p>
          </div>
        );
        return;
      }

      if (trimmedLine.length > 0) {
        formattedElements.push(
          <div key={`paragraph-${index}`} className="mb-3">
            <p className="text-slate-600 leading-relaxed">{trimmedLine}</p>
          </div>
        );
      }
    });

    return formattedElements;
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
              {query && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="animate-pulse bg-blue-500 h-2 w-2 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Enhanced Search Results */}
            {searchResults.length > 0 && query && showResults && (
              <div className="mt-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto ring-1 ring-black/5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-600">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                {searchResults.map((hit, index) => (
                  <div
                    key={hit.objectID || `${hit.symbol}-${index}`}
                    onClick={() => handleSelect(hit)}
                    className="group p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 border-b border-slate-50 last:border-b-0 hover:border-blue-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                          {hit.symbol}
                        </div>
                        <div className="text-slate-600 text-sm mt-0.5 group-hover:text-slate-700 transition-colors truncate">
                          {hit.name}
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
                  {/* MCP Analysis Display */}
                  {!selectedSymbol ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Select a stock to view AI analysis</p>
                    </div>
                  ) : analysisLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        <p className="text-sm text-gray-600">Analyzing {selectedSymbol}...</p>
                      </div>
                    </div>
                  ) : analysisData ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">📊 Analysis Results</h4>
                        
                        {/* Display analysis as formatted text */}
                        <div className="space-y-3">
                          {analysisData.analysis && (
                            <div>
                              <span className="font-medium text-gray-700">Analysis:</span>
                              <div className="mt-1 p-3 bg-white rounded border text-sm text-gray-800">
                                <div className="prose prose-sm max-w-none">
                                  {typeof analysisData.analysis === 'string' 
                                    ? formatAnalysisContent(analysisData.analysis)
                                    : JSON.stringify(analysisData.analysis, null, 2)}
                                </div>
                              </div>
                            </div>
                          )}

                          {analysisData.recommendation && (
                            <div>
                              <span className="font-medium text-gray-700">Recommendation:</span>
                              <div className="mt-1 p-2 bg-white rounded border">
                                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                  analysisData.recommendation.toLowerCase().includes('buy') 
                                    ? 'bg-green-100 text-green-800'
                                    : analysisData.recommendation.toLowerCase().includes('sell')
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {analysisData.recommendation}
                                </span>
                              </div>
                            </div>
                          )}

                          {analysisData.sentiment && (
                            <div>
                              <span className="font-medium text-gray-700">Sentiment:</span>
                              <div className="mt-1 p-2 bg-white rounded border">
                                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                  analysisData.sentiment.toLowerCase().includes('positive') 
                                    ? 'bg-green-100 text-green-800'
                                    : analysisData.sentiment.toLowerCase().includes('negative')
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {analysisData.sentiment}
                                </span>
                              </div>
                            </div>
                          )}

                          {analysisData.score && (
                            <div>
                              <span className="font-medium text-gray-700">Score:</span>
                              <div className="mt-1 p-2 bg-white rounded border">
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        analysisData.score >= 70 ? 'bg-green-500' :
                                        analysisData.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${Math.min(100, Math.max(0, analysisData.score))}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{analysisData.score}/100</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Raw data display if no specific fields are found */}
                          {!analysisData.analysis && !analysisData.recommendation && !analysisData.sentiment && !analysisData.score && (
                            <div>
                              <span className="font-medium text-gray-700">Analysis Data:</span>
                              <div className="mt-1 p-3 bg-white rounded border text-sm text-gray-800">
                                <pre className="whitespace-pre-wrap overflow-x-auto">
                                  {JSON.stringify(analysisData, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-gray-500 text-center">
                        Analysis generated
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-center space-y-2">
                        <div className="text-red-500 text-2xl">⚠️</div>
                        <p className="text-sm text-red-700 font-medium">Analysis Error</p>
                        <p className="text-xs text-red-600">Failed to fetch analysis data</p>
                      </div>
                    </div>
                  )}
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

export default StockMCP;
