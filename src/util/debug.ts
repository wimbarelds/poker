export function isDebug() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('debug');
}
