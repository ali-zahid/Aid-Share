// Image loader with an in-memory cache — every render reuses decoded images.
const cache = {};

export function loadImage(src) {
  if (cache[src]) return Promise.resolve(cache[src]);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cache[src] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}
