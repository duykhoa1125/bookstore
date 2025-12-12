import { useBackendHealth } from '../contexts/BackendHealthContext';
import '../styles/ServerWakingScreen.css';

export default function ServerWakingScreen() {
  const { isBackendReady, isChecking, retryCount, estimatedWaitTime, error } =
    useBackendHealth();

  // Check for test mode via URL param: ?forceLoading=true
  const isTestMode = new URLSearchParams(window.location.search).get('forceLoading') === 'true';

  // Don't render if backend is ready (unless in test mode)
  if (isBackendReady && !isTestMode) {
    return null;
  }

  const progressPercentage = Math.min(100, (retryCount / 15) * 100);

  return (
    <div className="server-waking-screen">
      <div className="server-waking-content">
        {/* Animated Book Icon */}
        <div className="book-loader">
          <div className="book">
            <div className="book-page"></div>
            <div className="book-page"></div>
            <div className="book-page"></div>
            <div className="book-cover"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="server-waking-title">
          {error ? 'Lỗi kết nối' : 'Đang khởi động server...'}
        </h1>

        {/* Message */}
        <p className="server-waking-message">
          {error ? (
            error
          ) : (
            <>
              Server đang được đánh thức từ chế độ nghỉ.
              <br />
              <span className="server-waking-note">
                (Render free tier tự động tắt server sau 15 phút không hoạt động)
              </span>
            </>
          )}
        </p>

        {/* Progress Section */}
        {!error && (isChecking || isTestMode) && (
          <div className="server-waking-progress-section">
            {/* Progress Bar */}
            <div className="server-waking-progress-container">
              <div
                className="server-waking-progress-bar"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Time Estimate */}
            <div className="server-waking-time">
              {estimatedWaitTime > 0 ? (
                <>
                  Thời gian chờ ước tính:{' '}
                  <span className="server-waking-countdown">{estimatedWaitTime}s</span>
                </>
              ) : (
                'Đang kết nối...'
              )}
            </div>

            {/* Retry Count */}
            <div className="server-waking-retry">
              Lần thử: {retryCount} / 20
            </div>
          </div>
        )}

        {/* Error Retry Button */}
        {error && (
          <button
            className="server-waking-retry-btn"
            onClick={() => {
              window.location.reload();
            }}
          >
            Thử lại
          </button>
        )}

        {/* Tips */}
        {!error && (
          <div className="server-waking-tips">
            <div className="server-waking-tip">
              💡 Tip: Quá trình này chỉ xảy ra lần đầu tiên khi server được đánh thức.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
