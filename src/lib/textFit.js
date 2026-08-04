import { loadImage } from './images';
import { parseStory, wrapTokens, logoSrc } from './renderPost';

export const MIN_STORY_CHARS = 60;

const measureCanvas = document.createElement('canvas');
const mctx = measureCanvas.getContext('2d');

// Layout capacity math shared by the fit check and the character estimate.
// Returns the vertical space available for the body block.
export async function layoutBudget(values) {
  const logoImg = await loadImage(logoSrc);
  const logoH = (logoImg.height / logoImg.width) * 380;
  let payStackH = 0;
  if (values.payAccount.trim()) payStackH += 46;
  if (values.payName.trim()) payStackH += 56;
  if (values.payMethod.trim()) payStackH += 38;
  const pillBlockH = values.amount.trim() ? 62 : 0;
  const deadlineBlockH = values.deadline.trim() ? 132 : 0;
  const fixedH = 50 + logoH + 46 + 22 + payStackH + pillBlockH + deadlineBlockH + 56;
  return 1080 - fixedH;
}

// True when story + closing line fit at full (unshrunk) text size
export async function bodyFitsFull(values, storyText) {
  const budget = await layoutBudget(values);
  const bodyMaxWidth = 940;
  const bodyFont = '400 36px Nunito, sans-serif';
  const highlightFont = '700 36px Nunito, sans-serif';
  const storyLines = wrapTokens(mctx, parseStory(storyText), bodyMaxWidth, bodyFont, highlightFont);
  const app = values.appreciation;
  const appLines = app.trim()
    ? wrapTokens(mctx, [{ text: app, highlight: false }], bodyMaxWidth, bodyFont, bodyFont)
    : [];
  const bodyH = 40 + storyLines.length * 50 + (appLines.length ? 16 + appLines.length * 50 : 0);
  return bodyH <= budget;
}

// Rough character capacity of the story for the current layout
export async function estimateMaxChars(values) {
  const budget = await layoutBudget(values);
  const app = values.appreciation;
  const appLines = app.trim()
    ? wrapTokens(mctx, [{ text: app, highlight: false }], 940, '400 36px Nunito, sans-serif', '400 36px Nunito, sans-serif')
    : [];
  const appBlock = appLines.length ? 16 + appLines.length * 50 : 0;
  const maxLines = Math.max(1, Math.floor((budget - 40 - appBlock) / 50));
  mctx.font = '400 36px Nunito, sans-serif';
  const sample = 'The quick brown fox jumps over the lazy dog, and writes a story.';
  const avg = mctx.measureText(sample).width / sample.length;
  return maxLines * Math.floor(940 / avg);
}
