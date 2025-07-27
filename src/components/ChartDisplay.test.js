import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChartDisplay from './ChartDisplay';

// Mock fetch
global.fetch = jest.fn();

describe('ChartDisplay Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders nothing when no symbol is provided', () => {
    const { container } = render(<ChartDisplay />);
    expect(container.firstChild).toBeNull();
  });

  test('displays loading state when fetching chart', async () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<ChartDisplay symbol="AAPL" />);
    
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
    expect(screen.getByText('📈 Chart - AAPL')).toBeInTheDocument();
  });

  test('displays chart when fetch is successful', async () => {
    const mockChartUrl = 'https://example.com/chart.png';
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        chartUrl: mockChartUrl
      })
    });

    render(<ChartDisplay symbol="AAPL" />);

    await waitFor(() => {
      const img = screen.getByAltText('Stock chart for AAPL');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockChartUrl);
    });
  });

  test('displays error state when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ChartDisplay symbol="AAPL" />);

    await waitFor(() => {
      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  test('retry functionality works', async () => {
    const onRetry = jest.fn();
    
    // First call fails
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<ChartDisplay symbol="AAPL" onRetry={onRetry} />);

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Second call succeeds
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        chartUrl: 'https://example.com/chart.png'
      })
    });

    fireEvent.click(screen.getByText('Retry'));

    expect(onRetry).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('handles image load error', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        chartUrl: 'https://example.com/broken-chart.png'
      })
    });

    render(<ChartDisplay symbol="AAPL" />);

    await waitFor(() => {
      const img = screen.getByAltText('Stock chart for AAPL');
      expect(img).toBeInTheDocument();
    });

    // Simulate image load error
    const img = screen.getByAltText('Stock chart for AAPL');
    fireEvent.error(img);

    await waitFor(() => {
      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Chart image failed to load')).toBeInTheDocument();
    });
  });

  test('calls onError callback when error occurs', async () => {
    const onError = jest.fn();
    fetch.mockRejectedValueOnce(new Error('API Error'));

    render(<ChartDisplay symbol="AAPL" onError={onError} />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('API Error');
    });
  });

  test('shows multiple retry warning after 3 attempts', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    render(<ChartDisplay symbol="AAPL" />);

    // Wait for initial error
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    // Click retry 3 times
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText('Retry'));
      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    }

    expect(screen.getByText('Multiple retries failed. Please check your network connection.')).toBeInTheDocument();
  });
});