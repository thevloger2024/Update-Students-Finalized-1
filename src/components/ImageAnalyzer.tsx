import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Loader2, X, Tag, Star,
  FileText, Palette, CheckCircle, AlertCircle, Eye,
  ZoomIn, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageAnalysisResult {
  description: string;
  extractedText: string;
  suggestedTitle: string;
  suggestedTags: string[];
  suggestedCategory: string;
  qualityScore: number;
  qualityFeedback: string;
  dominantColors: string[];
  contentType: string;
  isAppropriate: boolean;
}

interface ImageAnalyzerProps {
  onTagsApply?: (tags: string[]) => void;
  onTitleApply?: (title: string) => void;
  onCategoryApply?: (category: string) => void;
  compact?: boolean;
}

function QualityBar({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Poor';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">Quality Score</span>
        <span className="text-xs font-bold" style={{ color }}>{score}/100 — {label}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export function ImageAnalyzer({ onTagsApply, onTitleApply, onCategoryApply, compact = false }: ImageAnalyzerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      // Extract base64 part only
      const b64 = dataUrl.split(',')[1];
      setBase64Data(b64);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleAnalyze = async () => {
    if (!base64Data) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const response = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, mimeType }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      toast.success('Image analyzed successfully!');
    } catch (err: any) {
      toast.error(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setBase64Data(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const CATEGORY_LABELS: Record<string, string> = {
    job: '💼 Job', admit_card: '🎫 Admit Card',
    result: '📊 Result', scholarship: '🎓 Scholarship',
    quiz: '🧩 Quiz', other: '📄 Other',
  };

  return (
    <div className={`space-y-4 ${compact ? '' : 'p-4 bg-slate-50 rounded-2xl border border-slate-100'}`}>
      {/* Drop Zone */}
      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/80'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">
                {isDragging ? 'Drop image here!' : 'Upload image for AI analysis'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Drag & drop or click • PNG, JPG, WebP • Max 10MB</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>Gemini Vision with High Thinking</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-all flex items-center justify-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 bg-white rounded-xl shadow-lg hover:scale-110 transition-all"
              title="Preview"
            >
              <ZoomIn className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={clearImage}
              className="p-2 bg-white rounded-xl shadow-lg hover:scale-110 transition-all"
              title="Remove"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
          <div className="absolute top-2 right-2">
            <button onClick={clearImage} className="p-1 bg-white/90 rounded-lg shadow">
              <X className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {preview && !result && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          style={{ background: isAnalyzing ? '#94a3b8' : 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI Analyzing with Deep Thinking...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Image with AI
            </>
          )}
        </button>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Quality Score */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <QualityBar score={result.qualityScore} />
              <p className="text-xs text-slate-500 mt-2">{result.qualityFeedback}</p>
              
              {/* Appropriateness */}
              <div className={`flex items-center gap-2 mt-3 text-xs font-medium ${result.isAppropriate ? 'text-green-600' : 'text-red-600'}`}>
                {result.isAppropriate
                  ? <><CheckCircle className="w-3.5 h-3.5" /> Appropriate for website</>
                  : <><AlertCircle className="w-3.5 h-3.5" /> Not recommended</>
                }
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">AI Description</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{result.description}</p>
            </div>

            {/* Suggested Title */}
            {result.suggestedTitle && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Suggested Title</span>
                  </div>
                  {onTitleApply && (
                    <button
                      onClick={() => { onTitleApply(result.suggestedTitle); toast.success('Title applied!'); }}
                      className="text-xs text-blue-600 font-bold hover:underline flex-shrink-0"
                    >Apply →</button>
                  )}
                </div>
                <p className="text-sm text-slate-700 font-medium">{result.suggestedTitle}</p>
              </div>
            )}

            {/* Category & Content Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Category</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    {CATEGORY_LABELS[result.suggestedCategory] || result.suggestedCategory}
                  </span>
                  {onCategoryApply && (
                    <button
                      onClick={() => { onCategoryApply(result.suggestedCategory); toast.success('Category applied!'); }}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >Apply</button>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Content Type</p>
                <span className="text-sm font-bold text-slate-700 capitalize">{result.contentType}</span>
              </div>
            </div>

            {/* Colors */}
            {result.dominantColors?.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Dominant Colors</span>
                </div>
                <div className="flex gap-2">
                  {result.dominantColors.map((color, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg shadow border border-slate-100"
                        style={{ background: color }} />
                      <span className="text-xs text-slate-500 font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {result.suggestedTags?.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Suggested Tags</span>
                  </div>
                  {onTagsApply && (
                    <button
                      onClick={() => { onTagsApply(result.suggestedTags); toast.success('Tags applied!'); }}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >Apply All →</button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.suggestedTags.map((tag, i) => (
                    <span key={i}
                      className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100 cursor-pointer hover:bg-blue-100 transition-all"
                      onClick={() => onTagsApply?.([tag])}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Text (OCR) */}
            {result.extractedText && result.extractedText.trim() && result.extractedText !== 'None' && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Extracted Text (OCR)</span>
                </div>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg font-mono leading-relaxed whitespace-pre-wrap">
                  {result.extractedText}
                </p>
              </div>
            )}

            {/* Analyze Again Button */}
            <button
              onClick={() => { setResult(null); }}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Analyze Different Image
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {showPreview && preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={preview}
              alt="Full preview"
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-lg"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
