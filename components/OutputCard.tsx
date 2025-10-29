import React, { useState, useEffect, useMemo } from 'react';
import Loader from './Loader';
import ClipboardIcon from './icons/ClipboardIcon';
import SaveIcon from './icons/SaveIcon';
import DownloadIcon from './icons/DownloadIcon';
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

  const originalParsedJson: VeoPrompt | null = useMemo(() => {
    if (!content) return null;
    try {
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  }, [content]);

  const handleCopy = () => {
    const textToCopy = isRawView ? editedContent : content;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
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

  const handleDownload = () => {
    if (!isVeoJson || !editedContent) return;

    try {
        const parsed = JSON.parse(editedContent) as VeoPrompt;
        if (!parsed || !Array.isArray(parsed.scenes)) {
            throw new Error("Cấu trúc JSON không hợp lệ");
        }

        const allPrompts = parsed.scenes
            .flatMap(scene => scene.shots.map(shot => `SCENE ${scene.sceneNumber} - SHOT ${shot.shotNumber}\n${shot.prompt}`))
            .join('\n\n---\n\n');

        const blob = new Blob([allPrompts], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'veo_prompts.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Không thể phân tích và tải xuống các prompt:", e);
        alert("Lỗi: Không thể xử lý dữ liệu JSON để tải xuống. Vui lòng kiểm tra xem JSON có hợp lệ không.");
    }
  };
  
  const handleShotCopy = (e: React.MouseEvent<HTMLButtonElement>, prompt: string) => {
    e.stopPropagation(); 
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

  const handlePromptChange = (newPrompt: string, sceneIndex: number, shotIndex: number) => {
      try {
        const currentJson = JSON.parse(editedContent) as VeoPrompt;
        // Deep copy to avoid direct state mutation
        const newJson = JSON.parse(JSON.stringify(currentJson));
        
        if (newJson.scenes[sceneIndex] && newJson.scenes[sceneIndex].shots[shotIndex]) {
            newJson.scenes[sceneIndex].shots[shotIndex].prompt = newPrompt;
            setEditedContent(JSON.stringify(newJson, null, 2));
        }
    } catch (e) {
        console.error("Failed to parse and update JSON content. Switching to raw view.", e);
        setIsRawView(true);
    }
  };

  let parsedJson: VeoPrompt | null = null;
  let isCurrentContentValidJson = false;

  if (isVeoJson && editedContent) {
      try {
          const parsed = JSON.parse(editedContent);
          if (parsed && Array.isArray(parsed.scenes)) {
            parsedJson = parsed;
            isCurrentContentValidJson = true;
          }
      } catch (e) {
        // Not valid JSON
      }
  }

  const showStructuredView = isVeoJson && isCurrentContentValidJson && !isRawView;

  const renderActualContent = () => {
    if (isLoading) return <Loader message={loadingMessage} />;
    if (!content && !editedContent) return <div className="text-center text-gray-500 p-10">{placeholder}</div>;
    
    if (showStructuredView && parsedJson) {
      return (
        <div className="p-4 space-y-6">
          {parsedJson.scenes.map((scene, sceneIndex) => (
            <div key={scene.sceneNumber} className="space-y-4">
              <h4 className="text-lg font-semibold text-purple-300 border-b border-gray-700 pb-2">
                Cảnh {scene.sceneNumber}
              </h4>
              <div className="space-y-3 pl-2 sm:pl-4">
                {scene.shots.map((shot, shotIndex) => {
                    const originalShotPrompt = originalParsedJson?.scenes?.[sceneIndex]?.shots?.[shotIndex]?.prompt;
                    const isShotDirty = originalShotPrompt !== undefined && originalShotPrompt !== shot.prompt;

                    return (
                      <div key={shot.shotNumber} className="bg-gray-900/50 p-3 rounded-md border border-gray-700/50 relative group transition-shadow hover:shadow-lg hover:border-gray-600">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-mono bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                            Shot {shot.shotNumber} / {shot.duration}s
                          </span>
                          <div className={`absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all ${isShotDirty ? '!opacity-100' : ''}`}>
                            {isShotDirty && (
                                <button
                                    onClick={handleSave}
                                    className="px-2 py-1 bg-purple-600 rounded-md text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-500"
                                    aria-label="Lưu các thay đổi"
                                    title={saveText}
                                >
                                    <SaveIcon className="w-3 h-3" />
                                    <span>Lưu</span>
                                </button>
                            )}
                            <button
                                onClick={(e) => handleShotCopy(e, shot.prompt)}
                                className="px-2 py-1 bg-gray-800 rounded-md text-gray-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-600 hover:text-white"
                                aria-label="Sao chép prompt"
                            >
                                <ClipboardIcon className="w-3 h-3" />
                                <span>Sao chép</span>
                            </button>
                          </div>
                        </div>
                        <textarea
                            value={shot.prompt}
                            onChange={(e) => handlePromptChange(e.target.value, sceneIndex, shotIndex)}
                            className="w-full bg-transparent focus:bg-gray-900 p-1 -m-1 rounded-md text-gray-300 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                            rows={3}
                            aria-label={`Prompt for Scene ${scene.sceneNumber}, Shot ${shot.shotNumber}`}
                        />
                      </div>
                    );
                })}
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
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-700 p-3 flex-wrap gap-2">
        <h3 className="text-md font-semibold text-gray-200">{title}</h3>
        <div className="flex items-center gap-2">
             {isDirty && !isLoading && (
              <button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
              >
                <SaveIcon className="w-3 h-3" />
                {saveText}
              </button>
            )}
            {isVeoJson && content && !isLoading && (
                <button
                    onClick={handleDownload}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                    title="Tải xuống tất cả prompt dưới dạng file .txt"
                >
                    <DownloadIcon className="w-3 h-3" />
                    Tải xuống
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