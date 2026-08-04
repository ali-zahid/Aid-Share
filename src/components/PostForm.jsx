import TagToggles from './TagToggles';
import ClosedSection from './ClosedSection';
import './PostForm.css';

export default function PostForm({
  fields,
  onFieldChange,
  onStoryChange,
  onAppreciationChange,
  charCounter,
  notice,
  onDownload,
  downloading,
  resetLabel,
  onReset,
  closedPreview,
  onClosedPreviewToggle,
}) {
  return (
    <div className="panel">
      <div className="accent-bar" />
      <div className="panel-title">Case Details</div>
      <div className="panel-subtitle">Enter the information for this donation appeal.</div>

      <div className="field">
        <label>Story / Description</label>
        <textarea
          rows={6}
          placeholder="Describe who needs help and why..."
          value={fields.story}
          onChange={(e) => onStoryChange(e.target.value)}
        />
        <div className="hint">
          Wrap any phrase in <code>**double asterisks**</code> to highlight it in teal — like the template.
        </div>
        <div className="char-counter" style={charCounter.warn ? { color: '#e8b74a' } : undefined}>
          {charCounter.text}
        </div>
        <div className={`fit-notice${notice ? ' show' : ''}`}>
          <span className="fit-icon">✦</span>
          <span>{notice}</span>
        </div>
      </div>

      <div className="field">
        <label>Closing Line</label>
        <textarea
          rows={2}
          value={fields.appreciation}
          onChange={(e) => onAppreciationChange(e.target.value)}
        />
        <div className="hint">Press Enter to force a line break exactly where you want it.</div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Required Amount</label>
          <input
            type="text"
            value={fields.amount}
            onChange={(e) => onFieldChange('amount', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Payment Method</label>
          <input
            type="text"
            value={fields.payMethod}
            onChange={(e) => onFieldChange('payMethod', e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Recipient Name</label>
          <input
            type="text"
            value={fields.payName}
            onChange={(e) => onFieldChange('payName', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Account Number</label>
          <input
            type="text"
            value={fields.payAccount}
            onChange={(e) => onFieldChange('payAccount', e.target.value)}
          />
        </div>
      </div>

      <TagToggles
        tagZakat={fields.tagZakat}
        tagUrgent={fields.tagUrgent}
        onChange={onFieldChange}
      />

      <div className="field">
        <label>Deadline (optional)</label>
        <input
          type="text"
          placeholder="e.g. 22nd May, 2026"
          value={fields.deadline}
          onChange={(e) => onFieldChange('deadline', e.target.value)}
        />
        <div className="hint">
          Leave empty to hide. Use formats like <code>22nd May, 2026</code> — the suffix (st/nd/rd/th)
          renders as superscript automatically.
        </div>
      </div>

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={() => onDownload(false)}
          disabled={downloading === 'open'}
        >
          {downloading === 'open' ? 'Rendering...' : 'Download Post'}
        </button>
        <button className="btn btn-secondary" onClick={onReset}>
          {resetLabel}
        </button>
      </div>

      <ClosedSection
        closedPreview={closedPreview}
        onToggle={onClosedPreviewToggle}
        onDownload={() => onDownload(true)}
        downloading={downloading === 'closed'}
      />
    </div>
  );
}
