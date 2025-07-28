import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Sparkles, RefreshCw, FileText, Info, AlertCircle } from 'lucide-react';

const StockAnalysis = ({ symbol }) => {
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!symbol) {
            setAnalysisData(null);
            setError(null);
            return;
        }

        const fetchAnalysis = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log(`Fetching analysis for ${symbol}`);
                const response = await fetch('http://localhost:3001/api/stock-analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ symbol }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setAnalysisData(data);
                console.log("Analysis data received:", data);
            } catch (err) {
                console.error("Failed to fetch analysis:", err);
                setError(err.message);
                setAnalysisData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [symbol]);

    const handleRetry = () => {
        if (symbol) {
            setError(null);
            const fetchAnalysis = async () => {
                setLoading(true);
                setError(null);

                try {
                    const response = await fetch('http://localhost:3001/api/stock-analysis', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ symbol }),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log(data);
                    setAnalysisData(data);
                } catch (err) {
                    console.error("Failed to fetch analysis:", err);
                    setError(err.message);
                    setAnalysisData(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchAnalysis();
        }
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
                                <FileText className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{headerText}</h2>
                        </div>
                        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                    </div>
                );
                return;
            }

            if (trimmedLine.startsWith('#### ')) {
                const subHeaderText = trimmedLine.replace('#### ', '');
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
                const bulletContent = trimmedLine.replace('- **', '').replace('**', '');
                const [boldPart, ...restParts] = bulletContent.split(':');
                const restText = restParts.join(':');

                let icon = <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>;
                let colorClass = 'text-slate-700';

                if (boldPart.toLowerCase().includes('bullish') || boldPart.toLowerCase().includes('support')) {
                    icon = <TrendingUp className="h-3 w-3 text-emerald-600" />;
                    colorClass = 'text-emerald-700';
                } else if (boldPart.toLowerCase().includes('bearish') || boldPart.toLowerCase().includes('resistance')) {
                    icon = <TrendingDown className="h-3 w-3 text-red-600" />;
                    colorClass = 'text-red-700';
                } else if (boldPart.toLowerCase().includes('rsi') || boldPart.toLowerCase().includes('macd')) {
                    icon = <AlertCircle className="h-3 w-3 text-amber-600" />;
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

    if (!symbol) {
        return (
            <div className="text-center py-8">
                <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select a stock for AI analysis</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">Analyzing {symbol}...</p>
                        <p className="text-sm text-slate-500 mt-1">Generating AI insights</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="animate-pulse h-4 bg-slate-200 rounded"></div>
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Analysis Error</h3>
                    <p className="text-red-700 mb-4 text-sm">{error}</p>
                    <button
                        onClick={handleRetry}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? "Retrying..." : "Retry Analysis"}
                    </button>
                </div>
            </div>
        );
    }

    if (!analysisData) {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No analysis data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Retry Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">AI Analysis for {symbol}</span>
                </div>
                <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    <RefreshCw className={`h-3 w-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                {analysisData.recommendation && (
                    <div className={`rounded-xl p-4 border-2 ${analysisData.recommendation.toLowerCase().includes('buy')
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : analysisData.recommendation.toLowerCase().includes('sell')
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                        <div className="text-sm font-medium opacity-80">Recommendation</div>
                        <div className="text-lg font-bold">{analysisData.recommendation}</div>
                    </div>
                )}

                {analysisData.sentiment && (
                    <div className={`rounded-xl p-4 border-2 ${analysisData.sentiment.toLowerCase().includes('positive')
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : analysisData.sentiment.toLowerCase().includes('negative')
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                        <div className="text-sm font-medium opacity-80">Sentiment</div>
                        <div className="text-lg font-bold">{analysisData.sentiment}</div>
                    </div>
                )}

                {analysisData.score && (
                    <div className="col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="text-sm font-medium text-slate-700 mb-2">Analysis Score</div>
                        <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-slate-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${analysisData.score >= 70 ? 'bg-emerald-500' :
                                            analysisData.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${Math.min(100, Math.max(0, analysisData.score))}%` }}
                                ></div>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{analysisData.score}/100</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Formatted Analysis Text */}
            {analysisData.analysis && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Detailed Analysis - {symbol}</h3>
                                <p className="text-sm text-slate-600">Detailed market analysis and insights</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 max-h-96 overflow-y-auto">
                        <div className="prose prose-slate max-w-none">
                            {formatAnalysisContent(
                                typeof analysisData.analysis === 'string'
                                    ? analysisData.analysis
                                    : JSON.stringify(analysisData.analysis, null, 2)
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
                        <div className="flex items-center justify-between text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                                <Info className="h-4 w-4" />
                                <span>Analysis generated from market data</span>
                            </div>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            )}

            {analysisData.summary && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Executive Summary</h4>
                    </div>
                    <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">{analysisData.summary}</p>
                </div>
            )}

            {!analysisData.analysis && !analysisData.recommendation && !analysisData.sentiment && !analysisData.score && !analysisData.summary && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center space-x-2 mb-3">
                        <Brain className="h-5 w-5 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">Analysis Data</h4>
                    </div>
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto bg-white rounded-lg p-4 border">
                        {JSON.stringify(analysisData, null, 2)}
                    </pre>
                </div>
            )}

            <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                    Analysis generated • {new Date().toLocaleString()} • Click refresh to update
                </p>
            </div>
        </div>
    );
};

export default StockAnalysis;
