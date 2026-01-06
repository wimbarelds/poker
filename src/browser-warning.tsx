export function BrowserWarning() {
  return (
    <div class="fixed inset-0 bg-neutral-950/95 z-9999 flex items-center justify-center text-center backdrop-blur-md p-4">
      <div class="max-w-xl p-10 border border-red-500/30 rounded-2xl bg-neutral-900/80 shadow-[0_0_20px_rgba(255,68,68,0.1)]">
        <h1 class="text-red-400 mb-4 text-3xl font-bold uppercase tracking-tight">
          Unsupported Browser
        </h1>
        <p class="leading-relaxed mb-4 text-neutral-200">
          This game uses some bleeding-edge CSS features, currently only supported in recent
          versions of Chrome
          <span class="text-neutral-400 ml-2 font-mono text-sm">(versions &gt;= 140)</span>
        </p>
        <p class="text-neutral-400 text-sm">Required features:</p>
        <ul class="text-left bg-black/30 p-6 rounded-lg my-6 inline-block min-w-75 border border-white/5">
          <li class="my-2 text-red-300 font-mono text-sm">• CSS Inline If (if())</li>
          <li class="my-2 text-red-300 font-mono text-sm">• CSS Custom Functions (@function)</li>
          <li class="my-2 text-red-300 font-mono text-sm">• Sibling Index & Count</li>
        </ul>
      </div>
    </div>
  );
}
