import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import ClipboardIcon from './icons/ClipboardIcon';
import SaveIcon from './icons/SaveIcon';
import { VeoScene } from '../types';

interface OutputCardProps {
  title: string;
  content: string;
  isLoading: boolean;
  loadingMessage: string;
  placeholder: string;
  isVeoJson?: boolean;
  isCharacterJson?: boolean;
  onContentChange?: (newContent: string) => void;
}

interface Character {
    name: string;
    description: string;
}

const SceneItem: React.FC<{ scene: VeoScene; onSceneChange: (updatedScene: VeoScene) => void; }> = ({ scene, onSceneChange }) => {
    const [copyText, setCopyText] = useState('Sao chép Prompt');

    const handleCopyScene = () => {
        navigator.clipboard.writeText(scene.description);
        setCopyText('Đã sao chép!');
        setTimeout(() => setCopyText('Sao chép Prompt'), 2000);
    };

    const handleChange = (value: string) => {
        onSceneChange({ ...scene, description: value });
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-teal-300 text-lg">Cảnh {scene.sceneNumber}</h4>
                <button
                    onClick={handleCopyScene}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                    aria-label={`Sao chép prompt cho cảnh ${scene.sceneNumber}`}
                >
                    <ClipboardIcon className="w-3 h-3" />
                    {copyText}
                </button>
            </div>
            <div className="space-y-3 text-sm">
                 <div>
                     <label htmlFor={`description-${scene.sceneNumber}`} className="font-semibold text-gray-400 uppercase tracking-wider text-xs">Prompt tổng hợp cho cảnh:</label>
                    <textarea
                        id={`description-${scene.sceneNumber}`}
                        value={scene.description}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full mt-1 p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition text-sm text-gray-300 h-48 resize-y"
                     />
                </div>
            </div>
        </div>
    );
};

const CharacterItem: React.FC<{ character: Character; onCharacterChange: (updatedCharacter: Character) => void; }> = ({ character, onCharacterChange }) => {
    const [copyText, setCopyText] = useState('Sao chép Prompt');

    const handleCopy = () => {
        navigator.clipboard.writeText(character.description);
        setCopyText('Đã sao chép!');
        setTimeout(() => setCopyText('Sao chép Prompt'), 2000);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-teal-300 text-lg">{character.name}</h4>
                <button
                    onClick={handleCopy}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                    <ClipboardIcon className="w-3 h-3" />
                    {copyText}
                </button>
            </div>
            <textarea
                value={character.description}
                onChange={(e) => onCharacterChange({ ...character, description: e.target.value })}
                className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition text-sm text-gray-300 h-28 resize-y"
                placeholder="Mô tả nhân vật..."
            />
        </div>
    );
};


const OutputCard: React.FC<OutputCardProps> = ({
  title,
  content,
  isLoading,
  loadingMessage,
  placeholder,
  isVeoJson = false,
  isCharacterJson = false,
  onContentChange
}) => {
  const [copyText, setCopyText] = useState('Sao chép');
  const [saveText, setSaveText] = useState('Lưu thay đổi');
  const [editedContent, setEditedContent] = useState(content);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);
  
  const isDirty = editedContent !== content;

  const handleCopy = () => {
    if (editedContent) {
      navigator.clipboard.writeText(editedContent);
      setCopyText('Đã sao chép!');
      setTimeout(() => setCopyText('Sao chép'), 2000);
    }
  };

  const handleSave = () => {
    if(onContentChange) {
        onContentChange(editedContent);
        setSaveText('Đã lưu!');
        setTimeout(() => setSaveText('Lưu thay đổi'), 2000);
    }
  }

  const renderActualContent = () => {
    if (isLoading) return <Loader message={loadingMessage} />;
    if (!editedContent) return <div className="text-center text-gray-500 p-10">{placeholder}</div>;

    if (isVeoJson) {
        try {
            const data: { scenes: VeoScene[] } = JSON.parse(editedContent);
            const handleSceneUpdate = (index: number, updatedScene: VeoScene) => {
                const newData = { ...data };
                newData.scenes[index] = updatedScene;
                setEditedContent(JSON.stringify(newData, null, 2));
            }
            if (data.scenes && Array.isArray(data.scenes)) {
                return (
                    <div className="divide-y divide-gray-700">
                        {data.scenes.map((scene, index) => (
                            <SceneItem key={scene.sceneNumber} scene={scene} onSceneChange={(updated) => handleSceneUpdate(index, updated)} />
                        ))}
                    </div>
                );
            }
        } catch (e) { /* Fallback to textarea if JSON is invalid */ }
    }
    
     if (isCharacterJson) {
        try {
            const data: { characters: Character[] } = JSON.parse(editedContent);
             const handleCharacterUpdate = (index: number, updatedCharacter: Character) => {
                const newData = { ...data };
                newData.characters[index] = updatedCharacter;
                setEditedContent(JSON.stringify(newData, null, 2));
            }
            if (data.characters && Array.isArray(data.characters)) {
                return (
                    <div className="divide-y divide-gray-700">
                        {data.characters.map((char, index) => (
                           <CharacterItem key={index} character={char} onCharacterChange={(updated) => handleCharacterUpdate(index, updated)} />
                        ))}
                    </div>
                );
            }
        } catch (e) { /* Fallback to textarea if JSON is invalid */ }
    }

    return (
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="w-full h-full p-4 bg-transparent text-gray-300 text-sm focus:outline-none resize-none"
      />
    );
  };
  
  const showFullCopy = isVeoJson || isCharacterJson;

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
            {editedContent && !isLoading && showFullCopy && (
              <button
                onClick={handleCopy}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
              >
                <ClipboardIcon className="w-3 h-3" />
                {copyText} Toàn bộ
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
