import { useState, useCallback } from 'react';
import { UploadCloud, FileText, CalendarPlus } from 'lucide-react';
import { PlanEvent } from '../types';
import { parseFile } from '../services/scheduleService';

interface TheVaultProps {
  onIntegrate: (events: PlanEvent[]) => void;
}

export default function TheVault({ onIntegrate }: TheVaultProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [parsedEvents, setParsedEvents] = useState<PlanEvent[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = async (uploadedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
    const parsedEventsPromises = uploadedFiles.map(file => parseFile(file));
    const parsedEventsArrays = await Promise.all(parsedEventsPromises);
    const newEvents = parsedEventsArrays.flat();
    setParsedEvents(prevEvents => [...prevEvents, ...newEvents]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, []);

  const handleIntegrate = () => {
    onIntegrate(parsedEvents);
    setParsedEvents([]);
    setFiles([]); // Clear files after integration
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Upload Your Schedule</h3>
        <p className="text-slate-600 mb-4 text-sm">Upload your calendar (.ics), syllabus (.pdf), or task list (.csv) to merge them with your PSE deadlines.</p>
        
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors h-48 flex flex-col justify-center ${
            isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'
          }`}>
          <input 
            type="file" 
            multiple 
            onChange={handleFileChange} 
            className="hidden" 
            id="file-upload"
            accept=".ics,.csv,.pdf"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">Drag & drop or click to upload</p>
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 flex-grow overflow-y-auto">
          <h4 className="text-sm font-medium text-slate-800">Uploaded Files:</h4>
          <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <li key={index} className="flex items-center p-2 bg-slate-100 rounded-md">
                <FileText className="h-5 w-5 text-slate-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-slate-700 truncate" title={file.name}>{file.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsedEvents.length > 0 && (
        <div className="mt-4">
          <button 
            onClick={handleIntegrate}
            className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            <CalendarPlus className="h-5 w-5 mr-2" />
            Integrate {parsedEvents.length} Event(s)
          </button>
        </div>
      )}
    </div>
  );
}
