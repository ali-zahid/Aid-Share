export default function TagToggles({ tagZakat, tagUrgent, onChange }) {
  return (
    <div className="tag-toggles">
      <label className="tag-toggle">
        <input
          type="checkbox"
          checked={tagZakat}
          onChange={(e) => onChange('tagZakat', e.target.checked)}
        />
        <span className="tag-toggle-text">
          <span className="tag-toggle-label">Zakat Accepted</span>
          <span className="tag-toggle-hint">Adds a green banner on the left</span>
        </span>
      </label>
      <label className="tag-toggle tag-urgent">
        <input
          type="checkbox"
          checked={tagUrgent}
          onChange={(e) => onChange('tagUrgent', e.target.checked)}
        />
        <span className="tag-toggle-text">
          <span className="tag-toggle-label">Urgent</span>
          <span className="tag-toggle-hint">Adds a red banner on the right</span>
        </span>
      </label>
    </div>
  );
}
