/**
 * Format an ISO date string for display.
 *
 * Uses en-GB locale for consistent UK-style date rendering across
 * customer order views, admin order tables, and order detail panels.
 *
 * Returns an em-dash when the input is falsy so callers never render
 * "Invalid Date" in the UI.
 *
 * ponytail: Existing inline formatDate() clones in OrderHistoryView
 *           and OrderDetailPanel can be replaced with this import
 *           during the next safe refactor pass.
 *
 * @param {string|null|undefined} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return '\u2014';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export default formatDate;
