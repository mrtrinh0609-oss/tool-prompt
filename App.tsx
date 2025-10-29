import React, { useState, useEffect } from 'react';
import { generateScript, generateVeoPrompt } from './services/geminiService';
import Header from './components/Header';
import OutputCard from './components/OutputCard';
import SparklesIcon from './components/icons/SparklesIcon';
import JsonIcon from './components/icons/JsonIcon';
import KeyIcon from './components/icons/KeyIcon';

type ActiveTab = 'script' | 'json';

const styleOptions = {
    vietnamese: [
        { value: '', label: 'Chọn một phong cách (tùy chọn)' },
        { value: '3D Animation (Pixar Style)', label: 'Hoạt hình 3D (Phong cách Pixar)' },
        { value: 'Japanese Anime (Ghibli Style)', label: 'Anime Nhật Bản (Phong cách Ghibli)' },
        { value: 'Classic Black and White Film', label: 'Phim đen trắng cổ điển' },
        { value: 'Cyberpunk Sci-Fi', label: 'Phim khoa học viễn tưởng Cyberpunk' },
        { value: 'Realistic Documentary', label: 'Phim tài liệu thực tế' },
        { value: 'Photorealistic', label: 'Quang học (Photorealistic)' },
        { value: 'Cinematic Realism', label: 'Hiện thực Điện ảnh (Cinematic Realism)' },
        { value: 'Stop-motion Claymation', label: 'Hoạt hình đất sét (Stop-motion)' },
        { value: 'High Fantasy (Lord of the Rings style)', label: 'Fantasy (Chúa tể những chiếc nhẫn)' },
        { value: 'Film Noir (Crime, mystery)', label: 'Phim Noir (Tội phạm, bí ẩn)' },
        { value: 'Vaporwave Aesthetic Video', label: 'Video theo phong cách Vaporwave' },
        { value: 'Watercolor Painting', label: 'Tranh màu nước' },
        { value: '8-bit Pixel Art', label: 'Nghệ thuật Pixel 8-bit' },
        { value: 'Steampunk', label: 'Steampunk (Cơ khí hơi nước)' },
        { value: 'Vintage Comic Book Style', label: 'Truyện tranh cổ điển' },
        { value: 'Surrealism (Dali-esque)', label: 'Chủ nghĩa siêu thực (Phong cách Dali)' },
        { value: 'Gothic Horror (Tim Burton style)', label: 'Kinh dị Gothic (Phong cách Tim Burton)' },
        { value: 'Lo-fi / Chillhop Aesthetic', label: 'Thẩm mỹ Lo-fi / Chillhop' },
        { value: 'Nature Documentary (BBC Planet Earth style)', label: 'Phim tài liệu thiên nhiên (Phong cách BBC)' },
        { value: 'Wes Anderson Style (Symmetrical, Quirky)', label: 'Phong cách Wes Anderson (Đối xứng, độc đáo)' },
        { value: 'Psychedelic / Trippy Visuals', label: 'Hình ảnh ảo giác / Psychedelic' },
        { value: 'Hand-drawn Sketch Animation', label: 'Hoạt hình phác thảo bằng tay' },
        { value: 'Cinematic Drone Footage', label: 'Cảnh quay điện ảnh bằng Drone' },
    ],
    english: [
        { value: '', label: 'Select a style (optional)' },
        { value: '3D Animation (Pixar Style)', label: '3D Animation (Pixar Style)' },
        { value: 'Japanese Anime (Ghibli Style)', label: 'Japanese Anime (Ghibli Style)' },
        { value: 'Classic Black and White Film', label: 'Classic Black and White Film' },
        { value: 'Cyberpunk Sci-Fi', label: 'Cyberpunk Sci-Fi' },
        { value: 'Realistic Documentary', label: 'Realistic Documentary' },
        { value: 'Photorealistic', label: 'Photorealistic' },
        { value: 'Cinematic Realism', label: 'Cinematic Realism' },
        { value: 'Stop-motion Claymation', label: 'Stop-motion Claymation' },
        { value: 'High Fantasy (Lord of the Rings style)', label: 'High Fantasy (Lord of the Rings style)' },
        { value: 'Film Noir (Crime, mystery)', label: 'Film Noir (Crime, mystery)' },
        { value: 'Vaporwave Aesthetic Video', label: 'Vaporwave Aesthetic Video' },
        { value: 'Watercolor Painting', label: 'Watercolor Painting' },
        { value: '8-bit Pixel Art', label: '8-bit Pixel Art' },
        { value: 'Steampunk', label: 'Steampunk' },
        { value: 'Vintage Comic Book Style', label: 'Vintage Comic Book Style' },
        { value: 'Surrealism (Dali-esque)', label: 'Surrealism (Dali-esque)' },
        { value: 'Gothic Horror (Tim Burton style)', label: 'Gothic Horror (Tim Burton style)' },
        { value: 'Lo-fi / Chillhop Aesthetic', label: 'Lo-fi / Chillhop Aesthetic' },
        { value: 'Nature Documentary (BBC Planet Earth style)', label: 'Nature Documentary (BBC Planet Earth style)' },
        { value: 'Wes Anderson Style (Symmetrical, Quirky)', label: 'Wes Anderson Style (Symmetrical, Quirky)' },
        { value: 'Psychedelic / Trippy Visuals', label: 'Psychedelic / Trippy Visuals' },
        { value: 'Hand-drawn Sketch Animation', label: 'Hand-drawn Sketch Animation' },
        { value: 'Cinematic Drone Footage', label: 'Cinematic Drone Footage' },
    ]
};


const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
    const [tempApiKey, setTempApiKey] = useState<string>(apiKey);
    const [isKeySaved, setIsKeySaved] = useState<boolean>(!!apiKey);
    const [activeTab, setActiveTab] = useState<ActiveTab>('script');

    const [topic, setTopic] = useState<string>('');
    const [wordCount, setWordCount] = useState<string>('500');
    const [language, setLanguage] = useState<'vietnamese' | 'english'>('vietnamese');
    const [script, setScript] = useState<string>('');
    const [veoJson, setVeoJson] = useState<string>('');
    const [characterStyle, setCharacterStyle] = useState<string>('');
    const [isLoadingScript, setIsLoadingScript] = useState<boolean>(false);
    const [isLoadingJson, setIsLoadingJson] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('gemini-api-key', apiKey);
            setIsKeySaved(true);
        } else {
            localStorage.removeItem('gemini-api-key');
            setIsKeySaved(false);
        }
    }, [apiKey]);
    
    const handleSaveApiKey = () => {
        setApiKey(tempApiKey);
        setError(null);
    };
    
    const anyLoading = isLoadingScript || isLoadingJson;
    
    const checkApiKey = () => {
        if (!apiKey) {
            setError(language === 'vietnamese' ? 'Vui lòng thiết lập API Key của bạn ở đầu trang này trước.' : 'Please set your API Key at the top of this page first.');
            return false;
        }
        return true;
    }

    const handleGenerateScript = async () => {
        if (!checkApiKey()) return;
        if (!topic.trim()) {
            setError(language === 'vietnamese' ? 'Vui lòng nhập chủ đề cho kịch bản.' : 'Please enter a topic for the script.');
            return;
        }
        setError(null);
        setIsLoadingScript(true);
        setScript('');
        setVeoJson('');
        try {
            const result = await generateScript(topic, wordCount, language, apiKey);
            setScript(result);
            setActiveTab('json'); // Automatically move to the next step
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoadingScript(false);
        }
    };
    
    const handleUseOriginalScript = () => {
        if (!checkApiKey()) return;
        if (!topic.trim()) {
             setError(language === 'vietnamese' ? 'Vui lòng nhập hoặc dán kịch bản gốc của bạn vào ô văn bản.' : 'Please enter or paste your original script into the text box.');
            return;
        }
        setError(null);
        setScript(topic);
        setVeoJson('');
        // Automatically switch to the next step
        setActiveTab('json');
    };

    const handleGenerateVeoJson = async () => {
        if (!checkApiKey()) return;
        if (!script) {
            setError(language === 'vietnamese' ? 'Vui lòng tạo hoặc cung cấp kịch bản trước.' : 'Please generate or provide a script first.');
            return;
        }
        setError(null);
        setIsLoadingJson(true);
        setVeoJson('');
        try {
            const result = await generateVeoPrompt(script, characterStyle, language, apiKey);
            setVeoJson(result);
        } catch (err: unknown) {
             setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoadingJson(false);
        }
    };

    const TabButton: React.FC<{tabName: ActiveTab; label: string; disabled?: boolean;}> = ({ tabName, label, disabled = false }) => (
        <button
          onClick={() => !disabled && setActiveTab(tabName)}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ease-in-out border-b-2 ${
            activeTab === tabName
              ? 'bg-purple-600/20 text-purple-300 border-purple-500'
              : `text-gray-400 border-transparent hover:bg-gray-700/50 hover:text-gray-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
          }`}
          disabled={disabled}
        >
          {label}
        </button>
      );

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto flex flex-col gap-4">
                    
                    {/* Main Tab Navigation */}
                    <div className="flex rounded-lg overflow-hidden bg-gray-800/50">
                        <TabButton tabName="script" label="1. Kịch bản & API" />
                        <TabButton tabName="json" label="2. Prompt Veo" />
                    </div>

                    {/* Tab Content Panels */}
                    <div className="mt-4">
                        {activeTab === 'script' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left: Script Controls */}
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6 flex flex-col gap-4">
                                    {/* API KEY SECTION */}
                                    <div className="flex flex-col gap-4 p-4 border border-gray-700 rounded-lg bg-gray-900/30">
                                         <h2 className="text-xl font-semibold text-gray-200">Thiết lập API Key</h2>
                                         <p className="text-gray-400 text-sm">
                                             Vui lòng nhập API Key của bạn từ Google AI Studio để sử dụng ứng dụng. 
                                             Key của bạn sẽ được lưu trữ an toàn trong bộ nhớ cục bộ của trình duyệt.
                                         </p>
                                         <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-teal-400 hover:text-teal-300 underline">
                                            Nhận API Key của bạn tại đây
                                         </a>
                                         <div className="relative">
                                             <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                             <input
                                                 type="password"
                                                 value={tempApiKey}
                                                 onChange={(e) => setTempApiKey(e.target.value)}
                                                 placeholder="Dán API Key của bạn vào đây"
                                                 className="w-full p-3 pl-10 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                             />
                                         </div>
                                         <button
                                             onClick={handleSaveApiKey}
                                             disabled={!tempApiKey || tempApiKey === apiKey}
                                             className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                         >
                                             Lưu Key
                                         </button>
                                         {isKeySaved && (
                                             <p className="text-green-400 text-sm text-center">API Key đã được lưu và đang hoạt động.</p>
                                         )}
                                    </div>
                                    
                                    <hr className="border-gray-700 my-2"/>

                                    {/* SCRIPT GENERATION SECTION */}
                                    <h2 className="text-xl font-semibold text-gray-200">Tạo hoặc Cung cấp Kịch bản</h2>
                                    <p className="text-gray-400 text-sm">Nhập chủ đề để AI tạo kịch bản, hoặc dán kịch bản có sẵn của bạn vào ô bên dưới.</p>
                                    <textarea
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Nhập chủ đề (ví dụ: Một chú mèo khám phá thành phố tương lai) HOẶC dán kịch bản đầy đủ của bạn vào đây..."
                                        className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition h-40 resize-none"
                                        disabled={anyLoading}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <select
                                            id="language" value={language} onChange={(e) => setLanguage(e.target.value as 'vietnamese' | 'english')}
                                            className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition text-sm"
                                            disabled={anyLoading}
                                        >
                                            <option value="vietnamese">Ngôn ngữ: Tiếng Việt</option>
                                            <option value="english">Language: English</option>
                                        </select>
                                        <input
                                            type="number" id="wordCount" value={wordCount}
                                            onChange={(e) => setWordCount(e.target.value)}
                                            placeholder="Số lượng từ (tùy chọn)"
                                            className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition text-sm"
                                            disabled={anyLoading}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        <button
                                            onClick={handleGenerateScript} disabled={anyLoading || !apiKey || !topic.trim()}
                                            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-wait disabled:transform-none"
                                        >
                                            <SparklesIcon className="w-5 h-5" />
                                            {isLoadingScript ? 'Đang tạo...' : 'Tạo theo Gợi ý'}
                                        </button>
                                        <button
                                            onClick={handleUseOriginalScript} disabled={anyLoading || !apiKey || !topic.trim()}
                                            className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:transform-none"
                                        >
                                            Sử dụng Kịch bản Gốc
                                        </button>
                                    </div>
                                </div>
                                {/* Right: Script Result */}
                                <div className="min-h-[500px]">
                                     <OutputCard 
                                        title="Kết quả Kịch bản"
                                        content={script}
                                        isLoading={isLoadingScript}
                                        loadingMessage="Đang tạo kịch bản..."
                                        placeholder="Kịch bản bạn tạo sẽ xuất hiện ở đây."
                                        onContentChange={setScript}
                                      />
                                </div>
                            </div>
                        )}
                        {activeTab === 'json' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left: JSON Controls */}
                                <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6 flex flex-col gap-4">
                                    <h2 className="text-xl font-semibold text-gray-200">Tạo Prompt Veo</h2>
                                    <p className="text-gray-400 text-sm">Chuyển đổi kịch bản của bạn thành prompt JSON có cấu trúc để Veo sử dụng, được chia thành các phân đoạn 8 giây.</p>
                                     
                                     <div>
                                        <label htmlFor="characterStyle" className="block text-sm font-medium text-gray-300 mb-2">
                                            Phong cách hình ảnh
                                        </label>
                                        <select
                                            id="characterStyle"
                                            value={characterStyle}
                                            onChange={(e) => setCharacterStyle(e.target.value)}
                                            className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                                            disabled={anyLoading}
                                        >
                                            {styleOptions[language].map(option => (
                                                <option key={option.value} value={option.value} disabled={option.value === ''}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                     <button
                                        onClick={handleGenerateVeoJson}
                                        disabled={!script || anyLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 shadow-lg shadow-cyan-900/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
                                    >
                                        <JsonIcon className="w-5 h-5" />
                                        {isLoadingJson ? 'Đang tạo...' : 'Tạo Prompt'}
                                    </button>
                                </div>
                                {/* Right: JSON Result */}
                                <div className="min-h-[500px]">
                                    <OutputCard
                                        title="Kết quả Prompt JSON Veo"
                                        content={veoJson}
                                        isLoading={isLoadingJson}
                                        loadingMessage="Đang tạo prompt JSON Veo..."
                                        placeholder="Prompt JSON Veo bạn tạo sẽ xuất hiện ở đây."
                                        isVeoJson={true}
                                        onContentChange={setVeoJson}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                     {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-sm mt-4">
                            <strong className="font-semibold">Lỗi:</strong> {error}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;