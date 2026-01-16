import React, { useState, useEffect } from 'react';
import { incidentAPI } from '../../services/api';
import { getCurrentPosition } from '../../services/geolocation';
import './ReportButton.css';

const ReportButton = ({ userLocation, onReportSuccess }) => {
  const [canReport, setCanReport] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Check if there's a stored cooldown
    const storedCooldown = localStorage.getItem('reportCooldown');
    if (storedCooldown) {
      const cooldownEnd = new Date(storedCooldown);
      const now = new Date();
      if (cooldownEnd > now) {
        const remaining = Math.floor((cooldownEnd - now) / 1000);
        setTimeRemaining(remaining);
        setCanReport(false);
        startCountdown(remaining);
      }
    }
  }, []);

  const startCountdown = (seconds) => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanReport(true);
          localStorage.removeItem('reportCooldown');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReport = async () => {
    setError('');
    setLoading(true);

    try {
      // Get current position
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Report incident
      const response = await incidentAPI.reportIncident(latitude, longitude);

      if (response.data.success) {
        // Set cooldown based on server response (24 hours)
        const cooldownEnd = new Date(response.data.canReportAgainAt);
        const now = new Date();
        const remaining = Math.floor((cooldownEnd - now) / 1000);
        
        localStorage.setItem('reportCooldown', cooldownEnd.toISOString());
        
        setCanReport(false);
        setTimeRemaining(remaining > 0 ? remaining : 0);
        if (remaining > 0) {
          startCountdown(remaining);
        }
        setShowConfirm(false);
        
        if (onReportSuccess) {
          onReportSuccess();
        }
      } else {
        setError(response.data.message || 'Failed to report incident');
        
        // If there's a cooldown from server, use it
        if (response.data.canReportAgainAt) {
          const cooldownEnd = new Date(response.data.canReportAgainAt);
          const now = new Date();
          const remaining = Math.floor((cooldownEnd - now) / 1000);
          if (remaining > 0) {
            setTimeRemaining(remaining);
            setCanReport(false);
            startCountdown(remaining);
            localStorage.setItem('reportCooldown', cooldownEnd.toISOString());
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-button-container">
      {showConfirm ? (
        <div className="confirm-dialog">
          <p>Are you sure you want to report an armed incident at your current location?</p>
          <div className="confirm-buttons">
            <button
              onClick={handleReport}
              disabled={loading}
              className="confirm-button"
            >
              {loading ? 'Reporting...' : 'Confirm'}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setError('');
              }}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canReport || loading}
            className={`report-button ${!canReport ? 'disabled' : ''}`}
          >
            {loading
              ? 'Reporting...'
              : !canReport
              ? `Report Incident (${timeRemaining ? formatTime(timeRemaining) : 'Cooldown'})`
              : 'Report Incident'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </>
      )}
    </div>
  );
};

export default ReportButton;
