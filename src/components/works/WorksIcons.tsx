/**
 * 作品页用到的几个线性图标。
 *
 * 项目本身没有引入图标库（其余地方都是内联 SVG），这里也保持同样做法，
 * 避免为了四个图标多装一个依赖。统一 24×24 视窗、1.6 描边、currentColor 取色。
 */
interface IconProps {
  className?: string;
}

function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconFolder({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.3l1.8 2h7.9A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
      <path d="M3 10.5h18" />
    </Icon>
  );
}

export function IconLayers({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5z" />
      <path d="m4 12 8 4.5 8-4.5" />
      <path d="m4 16.5 8 4.5 8-4.5" />
    </Icon>
  );
}

export function IconImage({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 4.6-4.3a2 2 0 0 1 2.7 0l3 2.8m0 0 1.6-1.5a2 2 0 0 1 2.7 0L21 16.4" />
    </Icon>
  );
}

export function IconCode({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m9 8-4 4 4 4" />
      <path d="m15 8 4 4-4 4" />
    </Icon>
  );
}

export function IconExternal({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M14 4h6v6" />
      <path d="m20 4-8.5 8.5" />
      <path d="M18.5 14.5V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V8A2.5 2.5 0 0 1 6 5.5h3.5" />
    </Icon>
  );
}
