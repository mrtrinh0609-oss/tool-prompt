import { GoogleGenAI, Type } from "@google/genai";

export const generateScript = async (topic: string, wordCount: string, genre: string, language: 'vietnamese' | 'english', apiKey: string): Promise<string> => {
    if (!apiKey) {
        const errorMessage = language === 'vietnamese' ? 'Vui lòng cung cấp API Key.' : 'Please provide an API Key.';
        throw new Error(errorMessage);
    }
    const ai = new GoogleGenAI({ apiKey });
    try {
        let prompt = language === 'vietnamese'
            ? `Tạo một kịch bản video ngắn, tập trung vào hình ảnh dựa trên chủ đề sau: "${topic}".
Kịch bản nên được chia thành các cảnh. Đối với mỗi cảnh, hãy cung cấp mô tả rõ ràng về hình ảnh, hành động và bất kỳ lời thoại nào.
Cấu trúc đầu ra một cách rõ ràng với các tiêu đề cảnh (ví dụ: CẢNH 1, CẢNH 2).
`
            : `Generate a short, visually-focused video script based on the following topic: "${topic}".
The script should be divided into scenes. For each scene, provide a clear description of the visuals, actions, and any dialogue.
Structure the output clearly with scene headings (e.g., SCENE 1, SCENE 2).
`;

        if (wordCount.trim()) {
            prompt += language === 'vietnamese'
                ? `\nGiữ cho kịch bản có độ dài khoảng ${wordCount} từ.`
                : `\nKeep the script to approximately ${wordCount} words.`;
        } else {
            prompt += language === 'vietnamese'
                ? `\nGiữ cho kịch bản ngắn gọn và phù hợp cho một video ngắn (khoảng 1-2 phút).`
                : `\nKeep the script concise and suitable for a short video (around 1-2 minutes).`;
        }

        if (genre.trim()) {
            prompt += language === 'vietnamese'
                ? `\nKịch bản phải thuộc thể loại "${genre}".`
                : `\nThe script should be in the "${genre}" genre.`;
        }


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating script:", error);
        const errorMessage = language === 'vietnamese'
            ? "Không thể tạo kịch bản. Vui lòng kiểm tra API key của bạn và thử lại."
            : "Could not generate the script. Please check your API key and try again.";
        throw new Error(errorMessage);
    }
};

export const generateCharacterPrompts = async (script: string, characterStyle: string, language: 'vietnamese' | 'english', apiKey: string): Promise<string> => {
    if (!apiKey) {
        const errorMessage = language === 'vietnamese' ? 'Vui lòng cung cấp API Key.' : 'Please provide an API Key.';
        throw new Error(errorMessage);
    }
    const ai = new GoogleGenAI({ apiKey });
    try {
        let prompt = language === 'vietnamese'
            ? `Dựa vào kịch bản video sau đây, hãy xác định tất cả các nhân vật được đề cập.
Đối với mỗi nhân vật, hãy tạo một prompt mô tả chi tiết để sử dụng cho các mô hình tạo hình ảnh AI.
Prompt này cần mô tả kỹ lưỡng về ngoại hình, quần áo, đặc điểm khuôn mặt, kiểu tóc, biểu cảm đặc trưng, và bất kỳ đạo cụ quan trọng nào gắn liền với họ.
`
            : `Based on the following video script, identify all mentioned characters.
For each character, create a detailed descriptive prompt for use with AI image generation models.
This prompt should thoroughly describe their appearance, clothing, facial features, hairstyle, signature expressions, and any important props associated with them.
`;


        if (characterStyle.trim()) {
             prompt += language === 'vietnamese'
                ? `Tất cả các mô tả phải tuân thủ nghiêm ngặt phong cách nghệ thuật sau: "${characterStyle}".\n`
                : `All descriptions must strictly adhere to the following art style: "${characterStyle}".\n`;
        }

        prompt += language === 'vietnamese'
            ? `
Phân tích kịch bản sau và trả về một đối tượng JSON DUY NHẤT.
Đối tượng JSON phải có một khóa "characters", là một mảng. Mỗi đối tượng trong mảng phải có khóa "name" và "description".
QUAN TRỌNG: Bất kể ngôn ngữ của kịch bản gốc là gì, văn bản trong giá trị "description" PHẢI bằng tiếng Anh.
Không thêm bất kỳ giải thích hay định dạng markdown nào. Chỉ trả về JSON.

Kịch bản:
---
${script}
---
`
            : `
Analyze the following script and return a SINGLE JSON object.
The JSON object must have a "characters" key, which is an array. Each object in the array must have a "name" and "description" key.
IMPORTANT: Regardless of the original script's language, the text in the "description" value MUST be in English.
Do not add any explanation or markdown formatting. Return only the JSON.

Script:
---
${script}
---
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Clean the response to ensure it's valid JSON
        let jsonString = response.text;
        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
        }

        const jsonObject = JSON.parse(jsonString);
        return JSON.stringify(jsonObject, null, 2);

    } catch (error) {
        console.error("Error generating character prompts:", error);
         const errorMessage = language === 'vietnamese'
            ? "Không thể phân tích nhân vật. Vui lòng thử lại."
            : "Could not analyze characters. Please try again.";
        throw new Error(errorMessage);
    }
};


export const generateVeoPrompt = async (script: string, characterPromptsJson: string, characterStyle: string, language: 'vietnamese' | 'english', apiKey: string): Promise<string> => {
    if (!apiKey) {
        const errorMessage = language === 'vietnamese' ? 'Vui lòng cung cấp API Key.' : 'Please provide an API Key.';
        throw new Error(errorMessage);
    }
    const ai = new GoogleGenAI({ apiKey });
    try {
        let characterInjectionPrompt = '';
        if (characterPromptsJson) {
            try {
                // Validate it's non-empty JSON
                const parsed = JSON.parse(characterPromptsJson);
                if (parsed.characters && parsed.characters.length > 0) {
                     characterInjectionPrompt = language === 'vietnamese'
                        ? `\n\nBạn đã được cung cấp một danh sách các mô tả nhân vật. Khi tạo mục "- prompt nhân vật:", bạn PHẢI xác định những nhân vật nào xuất hiện trong cảnh và đặt TOÀN BỘ prompt mô tả ĐẦY ĐỦ, KHÔNG SỬA ĐỔI của họ vào đó. Nếu không có nhân vật nào trong danh sách xuất hiện, hãy ghi "Không có".

Đây là các mô tả nhân vật:
---
${characterPromptsJson}
---
`
                        : `\n\nYou have been provided with a list of character descriptions. When creating the "- character prompt:" item, you MUST identify which characters appear in the scene and place their FULL, UNMODIFIED descriptive prompt there. If no listed characters appear, write "None".

Here are the character descriptions:
---
${characterPromptsJson}
---
`;
                }
            } catch (e) {
                console.warn("Could not parse character prompts, proceeding without them.");
            }
        }

        let prompt = language === 'vietnamese'
            ? `Phân tích kịch bản video sau đây và chuyển đổi nó thành một đối tượng JSON có cấu trúc, BÁM SÁT KỊCH BẢN GỐC.
Mỗi cảnh sẽ trở thành một đối tượng trong mảng "scenes".
Đối với mỗi đối tượng cảnh, hãy cung cấp:
1.  "sceneNumber": Số thứ tự của cảnh.
2.  "description": Một chuỗi văn bản mô tả chi tiết, được định dạng bằng gạch đầu dòng như sau:
    - prompt nhân vật: [Nếu có nhân vật trong cảnh, chèn MÔ TẢ NHÂN VẬT ĐẦY ĐỦ, KHÔNG SỬA ĐỔI vào đây. Nếu không, ghi "Không có".]
    - prompt phân cảnh: [Mô tả hình ảnh chi tiết, sống động về cảnh, BÁM SÁT KỊCH BẢN GỐC.]
    - lời thoại của nhân vật: [Trích dẫn lời thoại chính xác từ kịch bản. Nếu không có, ghi "Không có".]
`
            : `Analyze the following video script and convert it into a structured JSON object, STICKING CLOSELY TO THE ORIGINAL SCRIPT.
Each scene will become an object in the "scenes" array.
For each scene object, provide:
1.  "sceneNumber": The sequence number of the scene.
2.  "description": A detailed text string, formatted with bullet points as follows:
    - character prompt: [If characters are in the scene, insert their FULL, UNMODIFIED DESCRIPTION here. If not, write "None".]
    - scene prompt: [A detailed, vivid visual description of the scene, ADHERING TO THE ORIGINAL SCRIPT.]
    - character dialogue: [Quote the dialogue exactly from the script. If there is none, write "None".]
`;
        
        prompt += characterInjectionPrompt; // Inject the character prompts instruction

        if (characterStyle.trim()) {
            prompt += language === 'vietnamese'
                ? `\nToàn bộ các mô tả trong "prompt phân cảnh" phải tuân thủ chặt chẽ phong cách nghệ thuật sau: "${characterStyle}".`
                : `\nAll descriptions within the "scene prompt" must strictly adhere to the following art style: "${characterStyle}".`;
        }

        prompt += language === 'vietnamese'
            ? `
QUAN TRỌNG: Văn bản trong "prompt nhân vật" và "prompt phân cảnh" PHẢI bằng tiếng Anh. Tuy nhiên, "lời thoại của nhân vật" PHẢI giữ nguyên ngôn ngữ gốc từ kịch bản.
Chỉ trả về đối tượng JSON. Không bao gồm bất kỳ văn bản giải thích hoặc định dạng markdown nào.

Đây là kịch bản:
---
${script}
---
`
            : `
IMPORTANT: The text in "character prompt" and "scene prompt" MUST be in English. However, the "character dialogue" MUST remain in the original language from the script.
Only return the JSON object. Do not include any explanatory text or markdown formatting.

Here is the script:
---
${script}
---
`;


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Clean the response to ensure it's valid JSON
        let jsonString = response.text;
        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
        }

        const jsonObject = JSON.parse(jsonString);
        return JSON.stringify(jsonObject, null, 2);

    } catch (error) {
        console.error("Error generating Veo prompt:", error);
        const errorMessage = language === 'vietnamese'
            ? "Không thể tạo prompt JSON. Kịch bản có thể bị lỗi hoặc API đã gặp sự cố."
            : "Could not generate the JSON prompt. The script may be malformed or the API failed.";
        throw new Error(errorMessage);
    }
};
