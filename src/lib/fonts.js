// Canvas text needs the webfonts fully loaded before measuring/drawing,
// otherwise the first render falls back to a system font.
export async function ensureFontsReady() {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }
  if (document.fonts && document.fonts.load) {
    try {
      await Promise.all([
        document.fonts.load('400 36px Nunito'),
        document.fonts.load('700 36px Nunito'),
        document.fonts.load('800 38px Nunito'),
        document.fonts.load('800 30px Montserrat'),
        document.fonts.load('900 88px Montserrat'),
        document.fonts.load('800 22px Montserrat'),
      ]);
    } catch (e) {}
  }
}
