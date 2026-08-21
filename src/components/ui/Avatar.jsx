/**
 * Avatar — circular initials avatar
 *
 * Props:
 *   initials     string  — e.g. "SK"
 *   name         string  — full name (for title tooltip)
 *   color        string  — hex background color
 *   size         number  — diameter in px (default 32)
 */
export default function Avatar({ initials, name, color = '#C8730A', size = 32 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
