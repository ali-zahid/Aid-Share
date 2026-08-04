import './PostPreview.css';

// Displays the exact canvas render, scaled to fit. App draws into the
// canvas via this ref so the preview and the download share one renderer.
export default function PostPreview({ canvasRef }) {
  return (
    <div className="preview-wrap">
      <div className="preview-label">Live Preview</div>
      <div className="post-stage">
        <div className="post-frame">
          <canvas ref={canvasRef} width={1080} height={1080} />
        </div>
      </div>
    </div>
  );
}
