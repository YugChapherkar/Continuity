import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-primary)] text-[var(--text-primary)] px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 font-mono text-2xl font-bold">
          404
        </div>
        <h1 className="text-xl font-bold">Resource Not Found</h1>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          The requested project workspace, handoff dossier, or ledger entry could not be located on the continuity network.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
