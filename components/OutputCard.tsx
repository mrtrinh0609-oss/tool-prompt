import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import ClipboardIcon from './icons/ClipboardIcon';
import SaveIcon from './icons/SaveIcon';
import EditIcon from './icons/EditIcon';
import JsonIcon from './icons/JsonIcon';
import { VeoPrompt } from '../types';

interface OutputCardProps {
  title: string;
  content: string;
  isLoading: boolean;
  loadingMessage: string;
  placeholder: string;
  isVeoJson?: boolean;
  onContentChange?: (newContent: string) => void;
}

const OutputCard: React.FC<OutputCardProps> = ({
  title,
  content,
  isLoading,
  loadingMessage,
  placeholder,
  isVeoJson = false,
  onContentChange
}) => {
  const [copyText, setCopyText] = useState('Sao chép tất cả');
  const [saveText, setSaveText] = useState('Lưu thay đổi');
  const [editedContent, setEditedContent] = useState(content);
  const [isRawView, setIsRawView] = useState(false);

  useEffect(() => {
    setEditedContent(content);
    setIsRawView(false); // Default to structured view on new content
  }, [content]);
  
  const isDirty = editedContent !== content;

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopyText('Đã sao chép!');
      setTimeout(() => setCopyText('Sao chép tất cả'), 2000);
    }
  };

  const handleSave = () => {
    if(onContentChange) {
        onContentChange(editedContent);
        setSaveText('Đã lưu!');
        setTimeout(() => setSaveText('Lưu thay đổi'), 2000);
    }
  };
  
  const handleShotCopy = (e: React.MouseEvent<HTMLButtonElement>, prompt: string) => {
    e.stopPropagation(); // Prevent card from switching to raw view
    navigator.clipboard.writeText(prompt);
    
    const button = e.currentTarget;
    const textSpan = button.querySelector('span');
    
    if (textSpan) {
        const originalText = textSpan.textContent;
        textSpan.textContent = 'Đã sao chép!';
        button.classList.add('text-green-400');
        button.classList.remove('text-gray-300');
        
        setTimeout(() => {
            if (textSpan) {
              textSpan.textContent = originalText;
              button.classList.remove('text-green-400');
              button.classList.add('text-gray-300');
            }
        }, 2000);
    }
  };

  let parsedJson: VeoPrompt | null = null;
  if (isVeoJson && content) {
      try {
          const parsed = JSON.parse(content);
          if (parsed && Array.isArray(parsed.scenes)) {
            parsedJson = parsed;
          }
      } catch (e) {
        // Not valid JSON, will default to raw textarea view
      }
  }

  const canBeStructured = parsedJson !== null;
  const showStructuredView = canBeStructured && !isRawView;

  const renderActualContent = () => {
    if (isLoading) return <Loader message={loadingMessage} />;
    if (!content && !editedContent) return <div className="text-center text-gray-500 p-10">{placeholder}</div>;
    
    if (showStructuredView && parsedJson) {
      return (
        <div 
            className="p-4 space-y-6 cursor-pointer hover:bg-gray-800/30 transition-colors"
            onClick={() => setIsRawView(true)}
            title="Nhấn để chỉnh sửa JSON"
        >
          {parsedJson.scenes.map((scene) => (
            <div key={scene.sceneNumber} className="space-y-4">
              <h4 className="text-lg font-semibold text-purple-300 border-b border-gray-700 pb-2">
                Cảnh {scene.sceneNumber}
              </h4>
              <div className="space-y-3 pl-2 sm:pl-4">
                {scene.shots.map((shot) => (
                  <div key={shot.shotNumber} className="bg-gray-900/50 p-3 rounded-md border border-gray-700/50 relative group transition-shadow hover:shadow-lg hover:border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                        Shot {shot.shotNumber} / {shot.duration}s
                      </span>
                      <button
                        onClick={(e) => handleShotCopy(e, shot.prompt)}
                        className="absolute top-2 right-2 px-2 py-1 bg-gray-800 rounded-md text-gray-300 text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-600 hover:text-white focus:opacity-100"
                        aria-label="Sao chép prompt"
                      >
                        <ClipboardIcon className="w-3 h-3" />
                        <span>Sao chép</span>
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed pr-8">{shot.prompt}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="w-full h-full p-4 bg-transparent text-gray-300 text-sm focus:outline-none resize-none"
        style={{ fontFamily: isVeoJson ? 'monospace' : 'inherit' }}
        placeholder={placeholder}
      />
    );
  };
  
  const showTextarea = !showStructuredView;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-700 p-3 flex-wrap gap-2">
        <h3 className="text-md font-semibold text-gray-200">{title}</h3>
        <div className="flex items-center gap-2">
             {canBeStructured && (
              <button
                onClick={() => setIsRawView(!isRawView)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                title={isRawView ? "Xem dạng cấu trúc" : "Chỉnh sửa JSON"}
              >
                {isRawView ? <JsonIcon className="w-3 h-3" /> : <EditIcon className="w-3 h-3" />}
                {isRawView ? 'Xem cấu trúc' : 'Chỉnh sửa'}
              </button>
            )}
             {isDirty && !isLoading && (
              <button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
              >
                <SaveIcon className="w-3 h-3" />
                {saveText}
              </button>
            )}
            {content && !isLoading && (
              <button
                onClick={handleCopy}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
              >
                <ClipboardIcon className="w-3 h-3" />
                {copyText}
              </button>
            )}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto min-h-[400px] lg:max-h-[calc(100vh-22rem)]">
        {renderActualContent()}
      </div>
    </div>
  );
};

export default OutputCard;