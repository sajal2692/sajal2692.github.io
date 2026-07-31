/**
 * The share row's marks: Tabler Icons 3.31 outline, one 24 grid, one weight.
 *
 * These strings carry geometry only. Size, stroke weight, joins and colour all
 * come from `.icon` in base.css, so nothing here decides how an icon looks and
 * a new mark cannot arrive at its own weight.
 *
 * Only what ShareLinks renders lives here. The footer's own links are words in
 * the mono row now, not marks, so GitHub and LinkedIn left with the icons; the
 * theme's other twelve were ~100KB of solid icons, on a different grid, for
 * links that were never switched on.
 */
const icon = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">${paths}</svg>`;

const socialIcons = {
  Mail: icon(
    `<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" /><path d="M3 7l9 6l9 -6" />`
  ),
  Twitter: icon(
    `<path d="M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c0 -.249 1.51 -2.772 1.818 -4.013z" />`
  ),
  Facebook: icon(
    `<path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />`
  ),
  WhatsApp: icon(
    `<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" /><path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />`
  ),
  Telegram: icon(`<path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />`),
  Pinterest: icon(
    `<path d="M8 20l4 -9" /><path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />`
  ),
};

export default socialIcons;
