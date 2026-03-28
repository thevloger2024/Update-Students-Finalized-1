import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Upload, Download, Image as ImageIcon, FileText, Scissors, FileUp, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'sonner';

export default function Tools() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<'image' | 'signature' | 'pdf' | 'img2pdf'>('image');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          title={t('backToHome')}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{t('tools')}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <ToolCard 
          icon={<ImageIcon className="w-6 h-6" />}
          title={t('imageCompressor')}
          description={t('imageCompressorDesc')}
          active={activeTool === 'image'}
          onClick={() => setActiveTool('image')}
        />
        <ToolCard 
          icon={<Scissors className="w-6 h-6" />}
          title={t('signatureResizer')}
          description={t('signatureResizerDesc')}
          active={activeTool === 'signature'}
          onClick={() => setActiveTool('signature')}
        />
        <ToolCard 
          icon={<FileText className="w-6 h-6" />}
          title={t('pdfCompressor')}
          description={t('pdfCompressorDesc')}
          active={activeTool === 'pdf'}
          onClick={() => setActiveTool('pdf')}
        />
        <ToolCard 
          icon={<FileUp className="w-6 h-6" />}
          title={t('imageToPdf')}
          description={t('imageToPdfDesc')}
          active={activeTool === 'img2pdf'}
          onClick={() => setActiveTool('img2pdf')}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTool === 'image' && <ImageTool type="image" />}
        {activeTool === 'signature' && <ImageTool type="signature" />}
        {activeTool === 'pdf' && <PdfCompressorTool />}
        {activeTool === 'img2pdf' && <ImageToPdfTool />}
      </div>
    </div>
  );
}

function ToolCard({ icon, title, description, active, onClick }: { icon: React.ReactNode, title: string, description: string, active: boolean, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-xl text-left transition-colors ${
        active 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'bg-white text-gray-900 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
        active ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600'
      }`}>
        {icon}
      </div>
      <h3 className={`font-semibold text-lg mb-2 ${active ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm ${active ? 'text-indigo-100' : 'text-gray-500'}`}>{description}</p>
    </motion.button>
  );
}

function ImageTool({ type }: { type: 'image' | 'signature' }) {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetSize, setTargetSize] = useState<number>(50); // KB
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setCrop(undefined);
      setCompletedCrop(null);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 1);
    });
  };

  const handleProcess = async () => {
    if (!file && !completedCrop) return;
    setIsProcessing(true);

    // Yield to main thread to allow UI to update (show loading spinner)
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const imageCompression = (await import('browser-image-compression')).default;
      let imageToProcess: File | Blob = file!;

      // If cropped, use the cropped image
      if (completedCrop && imgRef.current) {
        imageToProcess = await getCroppedImg(imgRef.current, completedCrop);
      }

      // Resize if width/height are provided
      if (width || height) {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = URL.createObjectURL(imageToProcess);
        await new Promise((resolve) => { img.onload = resolve; });
        
        const targetWidth = Number(width) || img.width;
        const targetHeight = Number(height) || img.height;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          imageToProcess = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 1);
          });
        }
      }

      // Compress
      const options = {
        maxSizeMB: targetSize / 1024,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(
        imageToProcess instanceof File ? imageToProcess : new File([imageToProcess], file?.name || 'image.jpg', { type: 'image/jpeg' }), 
        options
      );

      // Download
      const url = URL.createObjectURL(compressedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = `processed_${type}_${file?.name || 'image.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(t('success'));
    } catch (error) {
      console.error(error);
      toast.error(t('error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t('uploadImage')}</span></p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      {previewUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{t('crop')}</h3>
            <div className="border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center min-h-[300px]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img ref={imgRef} src={previewUrl} alt="Preview" className="max-h-[500px] object-contain" />
              </ReactCrop>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('targetSize')} (KB)</label>
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('width')} (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Auto"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('height')} (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Auto"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>{t('processing')}</span>
              ) : (
                <span className="flex items-center"><Download className="w-4 h-4 mr-2" />{t('download')}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PdfCompressorTool() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [targetSize, setTargetSize] = useState<number>(500); // KB
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    // Yield to main thread to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      // Note: True PDF compression in browser is complex without a backend.
      // We'll use pdf-lib to re-save it, which might reduce size slightly by removing unused objects,
      // but it won't compress images within the PDF effectively in the browser.
      // For a robust solution, a backend API is recommended.
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Save with useObjectStreams to potentially reduce size
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(t('success'));
    } catch (error) {
      console.error(error);
      toast.error(t('error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t('uploadPdf')}</span></p>
            {file && <p className="text-xs text-indigo-600">{file.name}</p>}
          </div>
          <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
        </label>
      </div>

      {file && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('targetSize')} (KB)</label>
            <input
              type="number"
              value={targetSize}
              onChange={(e) => setTargetSize(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Note: Browser-based PDF compression is limited. For best results, use a dedicated backend service.</p>
          </div>
          
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>{t('processing')}</span>
            ) : (
              <span className="flex items-center"><Download className="w-4 h-4 mr-2" />{t('compress')} & {t('download')}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ImageToPdfTool() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    
    // Yield to main thread to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      const { jsPDF } = await import('jspdf');
      const imageCompression = (await import('browser-image-compression')).default;
      const doc = new jsPDF();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Compress image before adding to PDF to save memory and reduce final PDF size
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });

        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(compressedFile);
        });

        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        if (i > 0) doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
        // Yield to main thread to update progress UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      doc.save('converted_images.pdf');
      toast.success(t('success'));
    } catch (error) {
      console.error(error);
      toast.error(t('error'));
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t('uploadImage')}</span></p>
          </div>
          <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>{t('processing')} {progress > 0 ? `${progress}%` : ''}</span>
            ) : (
              <span className="flex items-center"><Download className="w-4 h-4 mr-2" />{t('convert')}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
