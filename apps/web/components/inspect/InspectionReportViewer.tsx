import DOMPurify from "dompurify";

export function InspectionReportViewer({ htmlContent }: { htmlContent: string }) {
  const sanitizedHtml = typeof window !== 'undefined' ? DOMPurify.sanitize(htmlContent) : htmlContent;

  return (
    <div className="h-full rounded-xl border flex flex-col bg-slate-50 overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="p-4 border-b bg-white text-slate-800 flex justify-between items-center shadow-sm z-10">
        <div>
          <h2 className="text-lg font-serif font-semibold text-slate-900">FORMAL INSPECTION REPORT</h2>
          <p className="text-xs text-slate-500 font-mono">Auto-generated via AI processing</p>
        </div>
        <img src="https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/images/emblem.png" alt="Emblem" className="h-10 opacity-80 mix-blend-multiply" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-8">
        <div 
          className="prose prose-sm max-w-none text-slate-800 font-serif leading-relaxed inspection-markdown"
          style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '4px' }}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .inspection-markdown h1 { font-size: 1.5rem; text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #cbd5e1; padding-bottom: 0.5rem; }
        .inspection-markdown h2 { font-size: 1.1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #1e293b; }
        .inspection-markdown h3 { font-size: 0.95rem; margin-top: 1rem; color: #475569; }
        .inspection-markdown p { margin-bottom: 0.75rem; }
        .inspection-markdown ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .inspection-markdown li { margin-bottom: 0.25rem; }
        .inspection-markdown strong { color: #0f172a; }
      `}} />
    </div>
  );
}
