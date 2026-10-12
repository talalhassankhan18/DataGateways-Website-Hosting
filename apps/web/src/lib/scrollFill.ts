/**
 * Geometry for the scroll-scrubbed statement fill.
 *
 * Lives here rather than beside the component so that file exports only its component and keeps
 * fast refresh working — and so the maths can be tested without a browser, which matters because
 * it is the one part of the effect that is easy to get subtly wrong.
 */

/** Matches the reference's ScrollTrigger window: `start: 'top 82%'`, `end: 'bottom 45%'`. */
export const START_AT = 0.82;
export const END_AT = 0.45;

/**
 * How far through the fill the block is, from its position in the viewport.
 *
 * 0 while the block's top is still below 82% of the viewport height, reaching 1 once its bottom
 * has travelled up to 45%.
 */
export const fillProgress = (rectTop: number, height: number, viewport: number): number => {
  const span = (START_AT - END_AT) * viewport + height;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (START_AT * viewport - rectTop) / span));
};
