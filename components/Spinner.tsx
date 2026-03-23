export default function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8';
  return (
    <div
      className={`${s} animate-spin rounded-full border-2 border-transparent`}
      style={{ borderTopColor: 'var(--accent)', borderRightColor: 'rgba(0,229,160,0.3)' }}
    />
  );
}