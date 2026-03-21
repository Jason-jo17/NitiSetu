export function DiffViewer({ htmlContent }: { htmlContent: string }) {
  if (!htmlContent) return null;
  
  return (
    <div className="flex-1 w-full overflow-hidden bg-white text-black p-4 rounded-b-xl overflow-y-auto">
        <style dangerouslySetInnerHTML={{ __html: `
            .diff { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 11px; width: 100%; border-collapse: collapse; }
            .diff td { padding: 2px 4px; vertical-align: top; }
            .diff_next { display: none; }
            .diff_header { background: #f1f5f9; color: #64748b; text-align: right; width: 40px; border-right: 1px solid #cbd5e1; padding-right: 8px; user-select: none; }
            .diff_add { background-color: #dcfce7; }
            .diff_chg { background-color: #fef08a; }
            .diff_sub { background-color: #fee2e2; }
            td[nowrap] { white-space: pre-wrap; word-break: break-all; }
        `}} />
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
