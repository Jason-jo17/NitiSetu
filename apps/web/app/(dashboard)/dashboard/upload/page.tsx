"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  documentId?: string;
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (uploadFile: UploadedFile) => {
      const formData = new FormData();
      formData.append("file", uploadFile.file);
      return api.upload("/api/documents/upload", formData, (pct) => {
        setFiles(prev => prev.map(f => 
          f.file === uploadFile.file ? { ...f, progress: pct, status: 'uploading' } : f
        ));
      });
    },
    onSuccess: (data: any, uploadFile) => {
      setFiles(prev => prev.map(f => 
        f.file === uploadFile.file 
          ? { ...f, status: 'done', progress: 100, documentId: data.document_id } 
          : f
      ));
      toast.success(`${uploadFile.file.name} uploaded successfully`);
    },
    onError: (err, uploadFile) => {
      setFiles(prev => prev.map(f =>
        f.file === uploadFile.file
          ? { ...f, status: 'error', error: err.message }
          : f
      ));
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(f => ({
      file: f, status: 'pending', progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => uploadMutation.mutate(f));
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: '#F1F5F9' }}>
          Document Upload
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Upload PDFs, images, audio files, or Word documents for AI processing.
          Supported: CT-04/CT-06 applications, SAE reports, inspection notes, meeting recordings.
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all"
        style={{
          borderColor: isDragActive ? 'var(--accent-primary)' : 'var(--border-default)',
          background: isDragActive ? 'var(--accent-muted)' : 'var(--bg-surface)',
        }}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
            <Upload size={24} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#CBD5E1' }}>
              {isDragActive ? "Drop files here..." : "Drag & drop regulatory documents"}
            </p>
            <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              PDF, DOCX, JPG, PNG, MP3, WAV — up to 50MB per file
            </p>
          </div>
        </motion.div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 space-y-2"
          >
            {files.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 rounded-lg border"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <File size={16} style={{ color: '#64748B', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#CBD5E1' }}
                    className="truncate">{f.file.name}</p>
                  <p style={{ fontSize: 11, color: '#475569' }}>
                    {(f.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {f.status === 'uploading' && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        <span>Uploading...</span>
                        <span>{f.progress}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'var(--accent-primary)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${f.progress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {f.status === 'done' && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
                  {f.status === 'error' && <AlertCircle size={16} style={{ color: 'var(--danger)' }} />}
                  {f.status === 'uploading' && (
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: 'var(--accent-primary)' }} />
                  )}
                </div>
                {f.documentId && (
                  <div className="flex-shrink-0">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--success)',
                      background: 'var(--success-muted)', padding: '2px 6px', borderRadius: 4 }}>
                      ID: {f.documentId.slice(0,8)}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
