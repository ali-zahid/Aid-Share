import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import PostForm from './components/PostForm';
import PostPreview from './components/PostPreview';
import Toast from './components/Toast';
import { renderPostToCanvas } from './lib/renderPost';
import { ensureFontsReady } from './lib/fonts';
import { MIN_STORY_CHARS, bodyFitsFull, estimateMaxChars } from './lib/textFit';
import './App.css';

const INITIAL_FIELDS = {
  story:
    'Write the case story here — who needs help, why they need it, and what the funds will cover. Wrap key phrases in **double asterisks** to highlight them like **this** in the post.',
  appreciation: 'Any contribution, big or small, would be immensly\nappreciated.',
  amount: '30,000',
  payMethod: 'Meezan Bank Limited',
  payName: 'Ali Hasnain',
  payAccount: 'XXXXXXXXXXXXXXX',
  deadline: '22nd May, 2026',
  tagZakat: true,
  tagUrgent: true,
};

const EMPTY_FIELDS = {
  story: '',
  appreciation: '',
  amount: '',
  payMethod: '',
  payName: '',
  payAccount: '',
  deadline: '',
  tagZakat: false,
  tagUrgent: false,
};

const MAX_LIMIT_NOTICE = 'Maximum text limit reached — typing is blocked to keep the design at full size.';

function minStoryNotice(story) {
  const len = story.trim().length;
  return len > 0 && len < MIN_STORY_CHARS
    ? `The story is below the minimum of ${MIN_STORY_CHARS} characters — add a little more detail for a balanced post.`
    : '';
}

export default function App() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [closedPreview, setClosedPreview] = useState(false);
  const [fitScale, setFitScale] = useState(1);
  const [noticeOverride, setNoticeOverride] = useState('');
  const [charCounter, setCharCounter] = useState({ text: '', warn: false });
  const [downloading, setDownloading] = useState(null); // 'open' | 'closed' | null
  const [toast, setToast] = useState({ message: 'Image downloaded', visible: false });
  const [resetArmed, setResetArmed] = useState(false);

  const canvasRef = useRef(null);
  const toastTimer = useRef(null);
  const resetTimer = useRef(null);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200);
  }, []);

  const setField = useCallback((name, value) => {
    setFields((f) => ({ ...f, [name]: value }));
    setNoticeOverride(minStoryNotice(name === 'story' ? value : fields.story));
  }, [fields.story]);

  // Block additions that would exceed the full-size limit; deletions always allowed
  const handleStoryChange = useCallback(async (value) => {
    if (value.length > fields.story.length && !(await bodyFitsFull(fields, value))) {
      setNoticeOverride(MAX_LIMIT_NOTICE);
      return;
    }
    setField('story', value);
  }, [fields, setField]);

  const handleAppreciationChange = useCallback(async (value) => {
    if (value.length > fields.appreciation.length && !(await bodyFitsFull(fields, fields.story))) {
      setNoticeOverride(MAX_LIMIT_NOTICE);
      return;
    }
    setField('appreciation', value);
  }, [fields, setField]);

  // Character counter — estimates story capacity for the current layout
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const maxChars = await estimateMaxChars(fields);
      if (cancelled) return;
      const len = fields.story.length;
      const withDl = fields.deadline.trim() ? ' (deadline on)' : '';
      setCharCounter({
        text: `Story: ${len} characters — min ${MIN_STORY_CHARS}, max ≈${maxChars}${withDl}`,
        warn: len > 0 && len < MIN_STORY_CHARS,
      });
    })();
    return () => { cancelled = true; };
  }, [fields]);

  // Live preview — debounced while typing, renders the SAME canvas as the download
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await ensureFontsReady();
        const { canvas, scale } = await renderPostToCanvas(fields, closedPreview);
        const pc = canvasRef.current;
        if (!pc) return;
        pc.width = canvas.width;
        pc.height = canvas.height;
        pc.getContext('2d').drawImage(canvas, 0, 0);
        setFitScale(scale);
      } catch (e) {
        console.error('Preview error:', e);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [fields, closedPreview]);

  // Notices: the shrink warning takes priority over validation messages
  let notice = '';
  if (fitScale < 1) {
    notice = fields.deadline.trim()
      ? `The deadline takes up space, so the text has shrunk to ${Math.round(fitScale * 100)}%. Consider shortening the story for better visibility.`
      : `Text limit reached — the text will shrink itself (now at ${Math.round(fitScale * 100)}%) to keep the post design consistent.`;
  } else if (noticeOverride) {
    notice = noticeOverride;
  }

  const handleDownload = useCallback(async (closed) => {
    setDownloading(closed ? 'closed' : 'open');
    try {
      await ensureFontsReady();
      const { canvas } = await renderPostToCanvas(fields, closed);
      canvas.toBlob((blob) => {
        if (!blob) {
          showToast('Download failed');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = closed ? 'helping-hand-closed.png' : 'helping-hand-post.png';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('Image downloaded');
      }, 'image/png');
    } catch (e) {
      console.error('Render error:', e);
      showToast('Download failed — check console');
    } finally {
      setDownloading(null);
    }
  }, [fields, showToast]);

  // Two-step reset (confirm() dialogs are blocked in sandboxed iframes)
  const handleReset = useCallback(() => {
    if (!resetArmed) {
      setResetArmed(true);
      resetTimer.current = setTimeout(() => setResetArmed(false), 3000);
      return;
    }
    clearTimeout(resetTimer.current);
    setResetArmed(false);
    setFields(EMPTY_FIELDS);
    setClosedPreview(false);
    setNoticeOverride('');
    showToast('All fields cleared');
  }, [resetArmed, showToast]);

  return (
    <div className="app">
      <Header />
      <div className="layout">
        <PostForm
          fields={fields}
          onFieldChange={setField}
          onStoryChange={handleStoryChange}
          onAppreciationChange={handleAppreciationChange}
          charCounter={charCounter}
          notice={notice}
          onDownload={handleDownload}
          downloading={downloading}
          resetLabel={resetArmed ? 'Click again to confirm' : 'Reset'}
          onReset={handleReset}
          closedPreview={closedPreview}
          onClosedPreviewToggle={setClosedPreview}
        />
        <PostPreview canvasRef={canvasRef} />
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
