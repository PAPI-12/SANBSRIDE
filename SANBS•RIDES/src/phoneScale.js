import { useEffect } from 'react';

/* The donor and driver apps are designed once, at phone size (390 x 844).
   The phone is scaled to fit the space the role stage actually provides
   (window minus the app header and padding), never enlarged above 1x, and
   applied with CSS `zoom` so the layout box shrinks with it. No transform,
   so no overflow and no blurry upscaling. */
export const PHONE_WIDTH = 390;
export const PHONE_HEIGHT = 844;
const STAGE_PADDING_X = 40;
const STAGE_PADDING_Y = 104;

export function computePhoneScale(availableWidth, availableHeight) {
  const byHeight = (availableHeight - STAGE_PADDING_Y) / PHONE_HEIGHT;
  const byWidth = (availableWidth - STAGE_PADDING_X) / PHONE_WIDTH;
  const scale = Math.min(1, byHeight, byWidth);
  // Floor of 0.8: below this the phone is too small to read when presented; it scrolls instead.
  return Math.max(0.8, Number.isFinite(scale) ? scale : 1);
}

export function usePhoneScale() {
  useEffect(() => {
    const apply = () => {
      const stage = document.querySelector('.role-stage');
      const width = stage?.clientWidth || window.innerWidth;
      const height = stage?.clientHeight || window.innerHeight - 60;
      document.documentElement.style.setProperty('--phone-scale', computePhoneScale(width, height).toFixed(4));
    };
    apply();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
    const stage = document.querySelector('.role-stage');
    if (observer && stage) observer.observe(stage);
    window.addEventListener('resize', apply);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, []);
}
