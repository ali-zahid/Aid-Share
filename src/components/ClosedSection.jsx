export default function ClosedSection({ closedPreview, onToggle, onDownload, downloading }) {
  return (
    <div className="closed-section">
      <div className="closed-section-title">Case Closed?</div>
      <p>
        When the case is fully funded, download the closed version — the same post, darkened,
        with a diagonal <strong className="closed-stamp-hint">FUNDED · CASE CLOSED</strong> stamp
        across the centre.
      </p>
      <div className="closed-actions">
        <label className="switch-row">
          <input
            type="checkbox"
            checked={closedPreview}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span>Preview closed version</span>
        </label>
        <button className="btn btn-secondary" onClick={onDownload} disabled={downloading}>
          {downloading ? 'Rendering...' : 'Download Closed Post'}
        </button>
      </div>
    </div>
  );
}
