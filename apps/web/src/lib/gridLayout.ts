/**
 * How a `DividedGrid` arranges however many cards it is given.
 *
 * Separate from the component because it is arithmetic, not rendering: it is worth testing on its
 * own, and a component file that also exports helpers breaks fast refresh.
 */

/** Twelve divides by 3 and by 4, so both layouts and every partial row land on whole columns. */
export const GRID_BASE = 12;

/**
 * How many cards across, given how many there are.
 *
 * Prefers a count that divides evenly, because a row that comes out whole needs no repair at all.
 * Four across below seven cards leaves cells too narrow to carry a paragraph; three across above
 * eight leaves too many rows.
 */
export const columnsFor = (count: number): number => {
  if (count % 4 === 0 && count >= 8) return 4;
  if (count % 3 === 0) return 3;
  if (count % 4 === 0) return 4;
  return count > 6 ? 4 : 3;
};

/**
 * The column span of every cell, in order, on a twelve-column base.
 *
 * The property worth holding is that the spans of each row sum to `GRID_BASE`, at every card
 * count. An incomplete row in this grid is not white space: the cells paint over an inked backdrop,
 * so a cell that is not there shows as a grey block. Five modules in a four-column grid put one
 * across a quarter of the AINerve page, which is what prompted this.
 *
 * A short final row is repaired by widening the cards that are in it — two leftovers take six
 * columns each, three take four — rather than by padding the row with anything.
 */
export const spansFor = (count: number): number[] => {
  const cols = columnsFor(count);
  const leftover = count % cols;
  /* Index of the first card in a short final row, or -1 where every row comes out whole. */
  const firstOrphan = leftover === 0 ? -1 : count - leftover;

  return Array.from({ length: count }, (_, index) =>
    firstOrphan >= 0 && index >= firstOrphan ? GRID_BASE / leftover : GRID_BASE / cols,
  );
};
