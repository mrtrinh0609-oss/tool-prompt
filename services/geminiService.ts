import { GoogleGenAI } from "@google/genai";

export const generateScript = async (topic: string, wordCount: string, language: 'vietnamese' | 'english', apiKey: string): Promise<string> => {
    if (!apiKey) {
        const errorMessage = language === 'vietnamese' ? 'Vui lòng cung cấp API Key.' : 'Please provide an API Key.';
        throw new Error(errorMessage);
    }
    const ai = new GoogleGenAI({ apiKey });
    try {
        let prompt = language === 'vietnamese'
            ? `Tạo một kịch bản video ngắn dựa trên chủ đề sau: "${topic}".
YÊU CẦU ĐỊNH DẠNG NGHIÊM NGẶT:
- Chỉ sử dụng văn bản thuần túy.
- Các cảnh được đánh dấu là 'CẢNH 1:', 'CẢNH 2:', v.v.
- Trong mỗi cảnh, phải có các mục được ghi rõ ràng:
  - BỐI CẢNH: [Mô tả bối cảnh]
  - HÀNH ĐỘNG: [Mô tả hành động của nhân vật]
  - LỜI THOẠI: [Tên Nhân vật: Lời thoại] (Nếu không có lời thoại thì ghi "Không có")
- Tuyệt đối không sử dụng bất kỳ ký tự định dạng nào khác (không có dấu hoa thị, không có chữ in đậm, v.v.).
`
            : `Generate a short video script based on the following topic: "${topic}".
STRICT FORMATTING REQUIREMENTS:
- Use only plain text.
- Scenes should be marked as 'SCENE 1:', 'SCENE 2:', etc.
- Within each scene, there must be clearly labeled sections:
  - CONTEXT: [Description of the setting]
  - ACTION: [Description of character actions]
  - DIALOGUE: [Character Name: Dialogue] (If no dialogue, write "None")
- Absolutely no other formatting characters (no asterisks, no bolding, etc.).
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

export const generateVeoPrompt = async (
    script: string, 
    characterStyle: string, 
    language: 'vietnamese' | 'english', 
    apiKey: string
): Promise<string> => {
    if (!apiKey) {
        const errorMessage = language === 'vietnamese' ? 'Vui lòng cung cấp API Key.' : 'Please provide an API Key.';
        throw new Error(errorMessage);
    }
    const ai = new GoogleGenAI({ apiKey });
    try {
        const styleInstruction = characterStyle.trim() 
            ? (language === 'vietnamese' 
                ? `\n- Phong cách hình ảnh tổng thể phải tuân theo phong cách sau: "${characterStyle}". Hãy áp dụng phong cách này một cách tinh tế vào mô tả.`
                : `\n- The overall visual style must adhere to the following: "${characterStyle}". Subtly apply this style to the description.`)
            : '';

        const prompt = language === 'vietnamese'
            ? `Phân tích kịch bản video sau đây và chuyển đổi nó thành một đối tượng JSON có cấu trúc để tạo video.

YÊU CẦU VỀ CẤU TRÚC JSON:
- Đối tượng JSON gốc phải có một key là "scenes", là một mảng các đối tượng cảnh.
- Mỗi đối tượng cảnh phải có "sceneNumber" (số nguyên) và một mảng "shots".
- Mỗi đối tượng "shot" trong mảng "shots" đại diện cho một phân đoạn video dài 8 GIÂY. Hãy chia nhỏ mô tả cảnh gốc thành các phân đoạn 8 giây một cách hợp lý.
- Mỗi "shot" phải có:
  1. "shotNumber": Số thứ tự của phân đoạn trong cảnh (bắt đầu từ 1).
  2. "duration": Luôn là số 8.
  3. "prompt": Một chuỗi văn bản DUY NHẤT chứa tất cả thông tin cho phân đoạn 8 giây này.

YÊU CẦU VỀ NỘI DUNG TRƯỜNG "PROMPT":
- Kết hợp "BỐI CẢNH" và "HÀNH ĐỘNG" từ kịch bản thành một đoạn văn mô tả liền mạch, súc tích và giàu hình ảnh bằng TIẾNG ANH.
- Nếu có "LỜI THOẠI", hãy lồng ghép nó một cách tự nhiên vào cuối đoạn mô tả, theo định dạng 'The character [Tên nhân vật] says: "[Lời thoại]".' Giữ nguyên ngôn ngữ gốc của lời thoại.
- Toàn bộ nội dung này sẽ là giá trị cho trường "prompt".${styleInstruction}
- VÍ DỤ PROMPT HOÀN CHỈNH: "A stunning wide shot of a futuristic city with flying cars. The character Alex looks out from a balcony, amazed. The character Alex says: 'Thật không thể tin được.'"
- TUYỆT ĐỐI KHÔNG sử dụng dấu gạch ngang ('-'), dấu đầu dòng, hoặc các định dạng danh sách bên trong chuỗi prompt.
- Chỉ trả về đối tượng JSON. Không bao gồm bất kỳ văn bản giải thích hoặc định dạng markdown nào xung quanh JSON.

Đây là kịch bản (được cấu trúc với BỐI CẢNH, HÀNH ĐỘNG, LỜI THOẠI):
---
${script}
---
`
            : `Analyze the following video script and convert it into a complex, structured JSON object for video generation.

JSON STRUCTURE REQUIREMENTS:
- The root JSON object must have a "scenes" key, which is an an array of scene objects.
- Each scene object must have a "sceneNumber" (integer) and a "shots" array.
- Each "shot" object in the "shots" array represents an 8-SECOND video segment. Logically divide the original scene description into 8-second segments.
- Each "shot" must have:
  1. "shotNumber": The sequence number of the shot within the scene (starting from 1).
  2. "duration": Always the number 8.
  3. "prompt": A SINGLE string containing all information for this 8-second segment.

CONTENT REQUIREMENTS FOR THE "PROMPT" FIELD:
- Combine "CONTEXT" and "ACTION" from the script into a single, cohesive, concise, and visually rich descriptive paragraph in ENGLISH.
- If "DIALOGUE" exists, naturally integrate it at the end of the description using the format 'The character [Character Name] says: "[Dialogue]".' Retain the original language of the dialogue.
- This entire combined text will be the value for the "prompt" field.${styleInstruction}
- EXAMPLE OF A COMPLETE PROMPT: "A stunning wide shot of a futuristic city with flying cars. The character Alex looks out from a balcony, amazed. The character Alex says: 'This is incredible.'"
- ABSOLUTELY DO NOT use hyphens ('-'), bullet points, or list formats inside the prompt string.
- Only return the JSON object. Do not include any explanatory text or markdown formatting around the JSON.

Here is the script (structured with CONTEXT, ACTION, DIALOGUE):
---
${script}
---
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
             config: {
                responseMimeType: "application/json",
            }
        });

        let jsonString = response.text.trim();
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