import { loadImage } from './images';
import logoSrc from '../assets/logo.png';
import backgroundSrc from '../assets/background.jpg';
import zakatSrc from '../assets/zakat-ribbon.png';
import urgentSrc from '../assets/urgent-ribbon.png';

export { logoSrc, backgroundSrc, zakatSrc, urgentSrc };

// Splits the story into tokens; **wrapped phrases** become highlighted tokens.
export function parseStory(text) {
  const tokens = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIdx = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) tokens.push({ text: text.slice(lastIdx, m.index), highlight: false });
    tokens.push({ text: m[1], highlight: true });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) tokens.push({ text: text.slice(lastIdx), highlight: false });
  return tokens;
}

export function wrapTokens(ctx, tokens, maxWidth, baseFont, highlightFont) {
  const lines = [];
  let current = [];
  let currentWidth = 0;
  const words = [];
  for (const tok of tokens) {
    const parts = tok.text.split(/(\s+)/);
    for (const p of parts) {
      if (p === '') continue;
      words.push({ text: p, highlight: tok.highlight });
    }
  }
  for (const w of words) {
    // Explicit newline forces a line break
    if (/\n/.test(w.text)) {
      if (current.length > 0) {
        lines.push(current);
        current = [];
        currentWidth = 0;
      }
      continue;
    }
    ctx.font = w.highlight ? highlightFont : baseFont;
    const wWidth = ctx.measureText(w.text).width;
    if (/^\s+$/.test(w.text) && current.length === 0) continue;
    if (currentWidth + wWidth > maxWidth && current.length > 0) {
      lines.push(current);
      current = [];
      currentWidth = 0;
      if (/^\s+$/.test(w.text)) continue;
    }
    current.push({ ...w, width: wWidth });
    currentWidth += wWidth;
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function drawWrappedTokens(ctx, lines, x, y, lineHeight, align, baseFont, highlightFont, baseColor, highlightColor) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const line of lines) {
    const lineWidth = line.reduce((s, w) => s + w.width, 0);
    let cursor;
    if (align === 'center') cursor = x - lineWidth / 2;
    else if (align === 'right') cursor = x - lineWidth;
    else cursor = x;
    for (const w of line) {
      ctx.font = w.highlight ? highlightFont : baseFont;
      ctx.fillStyle = w.highlight ? highlightColor : baseColor;
      ctx.fillText(w.text, cursor, y);
      cursor += w.width;
    }
    y += lineHeight;
  }
  return y;
}

// Draws the deadline date with the ordinal suffix (st/nd/rd/th) as superscript.
function drawDeadlineDate(ctx, text, x, y) {
  const match = text.match(/^(.*?\d+)(st|nd|rd|th)\b(.*)$/i);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  const mainFont = '800 36px Nunito, sans-serif';
  const supFont = '700 20px Nunito, sans-serif';
  if (!match) {
    ctx.font = mainFont;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    return;
  }
  ctx.font = mainFont;
  const beforeW = ctx.measureText(match[1]).width;
  ctx.font = supFont;
  const supW = ctx.measureText(match[2]).width;
  ctx.font = mainFont;
  const afterW = ctx.measureText(match[3]).width;
  let cursor = x - (beforeW + supW + afterW) / 2;
  ctx.textAlign = 'left';
  ctx.font = mainFont;
  ctx.fillText(match[1], cursor, y);
  cursor += beforeW;
  ctx.font = supFont;
  ctx.fillText(match[2], cursor, y - 16);
  cursor += supW;
  ctx.font = mainFont;
  ctx.fillText(match[3], cursor, y);
}

// Renders the post at 1080x1080. The body (story + closing line) is the
// variable part: it starts at full size and shrinks until everything fits,
// with a floor so text stays legible. Extra vertical space is distributed
// into the two flexible gaps so the layout always looks balanced.
// Returns { canvas, scale } where scale is the final body text scale.
export async function renderPostToCanvas(values, closed) {
  const W = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = 1080; // temporary, for measurement
  const ctx = canvas.getContext('2d');

  // --- Gather values ---
  const storyText = values.story;
  const appreciation = values.appreciation;
  const amount = values.amount;
  const payMethod = values.payMethod;
  const payName = values.payName;
  const payAccount = values.payAccount;
  const dl = values.deadline.trim();
  const showZakat = values.tagZakat;
  const showUrgent = values.tagUrgent;

  // --- Layout constants (fixed 1080x1080 output) ---
  const H = 1080;
  const bodyMaxWidth = W - 140;
  const topMargin = 50;
  const bottomMargin = 56;
  const minGapLogoBody = 46; // minimum gap between logo and story
  const minGapBodyBottom = 22; // minimum gap between body and bottom block

  // --- Measure images ---
  const logoImg = await loadImage(logoSrc);
  const bgImg = await loadImage(backgroundSrc);
  const logoW = 380;
  const logoH = (logoImg.height / logoImg.width) * logoW;

  // --- Measure bottom block (fixed-size elements) ---
  // Payment stack (drawn bottom-up): account (46), name (56), method (38 text)
  let payStackH = 0;
  if (payAccount.trim()) payStackH += 46;
  if (payName.trim()) payStackH += 56;
  if (payMethod.trim()) payStackH += 38;
  const pillBlockH = amount.trim() ? 62 : 0; // pill sits beside the payment-method row
  const deadlineBlockH = dl ? 132 : 0; // label + date + breathing room
  const bottomBlockH = payStackH + pillBlockH + deadlineBlockH;

  // --- Auto-fit body text into the fixed square ---
  const fixedH = topMargin + logoH + minGapLogoBody + minGapBodyBottom + bottomBlockH + bottomMargin;
  let s = 1.0;
  let bodyFont, highlightFont, appFont, storyLineH, appLineH, storyLines, appLines, bodyH;
  const measureBody = () => {
    bodyFont = `400 ${Math.round(36 * s)}px Nunito, sans-serif`;
    highlightFont = `700 ${Math.round(36 * s)}px Nunito, sans-serif`;
    appFont = `400 ${Math.round(36 * s)}px Nunito, sans-serif`;
    storyLineH = Math.round(50 * s);
    appLineH = Math.round(50 * s);
    storyLines = wrapTokens(ctx, parseStory(storyText), bodyMaxWidth, bodyFont, highlightFont);
    appLines = appreciation.trim()
      ? wrapTokens(ctx, [{ text: appreciation, highlight: false }], bodyMaxWidth, appFont, appFont)
      : [];
    bodyH = Math.round(40 * s) + storyLines.length * storyLineH
      + (appLines.length ? 16 + appLines.length * appLineH : 0);
  };
  measureBody();
  while (fixedH + bodyH > H && s > 0.4) {
    s = Math.round((s - 0.05) * 100) / 100;
    measureBody();
  }

  // Distribute any leftover space into the two flexible gaps.
  // Keep the gap between the body and the amount pill small: it gets at most
  // a modest share of the spare space; everything else goes above the body.
  const extra = Math.max(0, H - (fixedH + bodyH));
  const bottomGapExtra = Math.min(extra * 0.3, 42);
  const gapLogoBody = minGapLogoBody + (extra - bottomGapExtra);

  canvas.height = H; // resets ctx state

  // --- 1. Background (cover) ---
  if (bgImg) {
    const scale = Math.max(W / bgImg.width, H / bgImg.height);
    const dw = bgImg.width * scale;
    const dh = bgImg.height * scale;
    ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else {
    const g = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W / 2, H / 2, H * 0.8);
    g.addColorStop(0, '#1a1a1a');
    g.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // --- 2. Logo ---
  const logoX = (W - logoW) / 2;
  const logoY = topMargin;
  ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

  // --- 3. Ribbon tag images (aligned with the wordmark) ---
  const ribbonW = 240;
  const ribbonInset = 40;
  const ribbonCenterY = logoY + logoH * 0.62;
  if (showZakat) {
    const img = await loadImage(zakatSrc);
    const h = (img.height / img.width) * ribbonW;
    ctx.drawImage(img, ribbonInset, ribbonCenterY - h / 2, ribbonW, h);
  }
  if (showUrgent) {
    const img = await loadImage(urgentSrc);
    const h = (img.height / img.width) * ribbonW;
    ctx.drawImage(img, W - ribbonW - ribbonInset, ribbonCenterY - h / 2, ribbonW, h);
  }

  // --- 4. Body (story + appreciation) ---
  const bodyX = W / 2;
  let bodyY = logoY + logoH + gapLogoBody + Math.round(40 * s); // first baseline
  bodyY = drawWrappedTokens(ctx, storyLines, bodyX, bodyY, storyLineH, 'center', bodyFont, highlightFont, '#ffffff', '#2DB39A');
  if (appLines.length) {
    bodyY += 16;
    drawWrappedTokens(ctx, appLines, bodyX, bodyY, appLineH, 'center', appFont, appFont, '#e6e6e6', '#e6e6e6');
  }

  // --- 5. Bottom block (anchored to bottom of canvas) ---
  const payX = 70;
  let payCursorY = H - bottomMargin;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';

  if (payAccount.trim()) {
    ctx.font = '400 30px Nunito, sans-serif';
    const lbl = 'Account number: ';
    const lblW = ctx.measureText(lbl).width;
    ctx.fillText(lbl, payX, payCursorY);
    ctx.font = '800 30px Nunito, sans-serif';
    ctx.fillText(payAccount, payX + lblW, payCursorY);
    payCursorY -= 46;
  }
  if (payName.trim()) {
    ctx.font = '400 30px Nunito, sans-serif';
    const lbl = 'Name: ';
    const lblW = ctx.measureText(lbl).width;
    ctx.fillText(lbl, payX, payCursorY);
    ctx.font = '800 30px Nunito, sans-serif';
    ctx.fillText(payName, payX + lblW, payCursorY);
    payCursorY -= 56;
  }
  if (payMethod.trim()) {
    ctx.font = '800 38px Nunito, sans-serif';
    ctx.fillText(payMethod, payX, payCursorY);
  }

  let pillTopY = payCursorY - 100;
  if (!payMethod.trim() && !payName.trim() && !payAccount.trim()) {
    pillTopY = H - bottomMargin - 70;
  }

  if (amount.trim()) {
    const pillFont = '500 30px Nunito, sans-serif';
    const pillBoldFont = '800 32px Nunito, sans-serif';
    ctx.font = pillFont;
    const label = 'Required Amount: ';
    const labelW = ctx.measureText(label).width;
    ctx.font = pillBoldFont;
    const amtW = ctx.measureText(amount).width;
    const pillPadX = 36;
    const pillH = 70;
    const pillW = labelW + amtW + pillPadX * 2;
    const pillX = W - pillW - 70;
    const pillY = pillTopY;

    ctx.save();
    ctx.beginPath();
    const r = pillH / 2;
    ctx.moveTo(pillX + r, pillY);
    ctx.lineTo(pillX + pillW - r, pillY);
    ctx.arc(pillX + pillW - r, pillY + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(pillX + r, pillY + pillH);
    ctx.arc(pillX + r, pillY + r, r, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(45, 179, 154, 0.18)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(45, 179, 154, 0.45)';
    ctx.stroke();
    ctx.restore();

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    let cx = pillX + pillPadX;
    const cy = pillY + pillH / 2;
    ctx.font = pillFont;
    ctx.fillText(label, cx, cy);
    cx += labelW;
    ctx.font = pillBoldFont;
    ctx.fillText(amount, cx, cy);
  }

  if (dl) {
    const dateY = pillTopY - 54;
    const labelY = dateY - 50;
    ctx.font = '800 30px Montserrat, sans-serif';
    ctx.fillStyle = '#2DB39A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Deadline', W / 2, labelY);
    drawDeadlineDate(ctx, dl, W / 2, dateY);
  }

  // --- 6. Closed overlay + diagonal stamp ---
  if (closed) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-18 * Math.PI / 180);

    const stampW = 620;
    const stampH = 230;
    const r2 = 20;
    // Stamp box
    ctx.beginPath();
    ctx.moveTo(-stampW / 2 + r2, -stampH / 2);
    ctx.lineTo(stampW / 2 - r2, -stampH / 2);
    ctx.arcTo(stampW / 2, -stampH / 2, stampW / 2, -stampH / 2 + r2, r2);
    ctx.lineTo(stampW / 2, stampH / 2 - r2);
    ctx.arcTo(stampW / 2, stampH / 2, stampW / 2 - r2, stampH / 2, r2);
    ctx.lineTo(-stampW / 2 + r2, stampH / 2);
    ctx.arcTo(-stampW / 2, stampH / 2, -stampW / 2, stampH / 2 - r2, r2);
    ctx.lineTo(-stampW / 2, -stampH / 2 + r2);
    ctx.arcTo(-stampW / 2, -stampH / 2, -stampW / 2 + r2, -stampH / 2, r2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(217, 54, 54, 0.10)';
    ctx.fill();
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#D93636';
    ctx.shadowColor = 'rgba(217, 54, 54, 0.5)';
    ctx.shadowBlur = 40;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Stamp text
    ctx.fillStyle = '#D93636';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    try { ctx.letterSpacing = '14px'; } catch (e) {}
    ctx.font = '900 88px Montserrat, sans-serif';
    ctx.fillText('FUNDED', 0, -30);
    try { ctx.letterSpacing = '10px'; } catch (e) {}
    ctx.font = '700 30px Montserrat, sans-serif';
    ctx.fillText('CASE CLOSED', 0, 55);
    try { ctx.letterSpacing = '0px'; } catch (e) {}

    ctx.restore();
  }

  return { canvas, scale: s };
}
