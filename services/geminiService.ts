import { GoogleGenAI, Modality, Type } from "@google/genai";

let ai: GoogleGenAI;

const getAi = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

// Fix: Implement and export generateBlogPost to resolve missing export error.
export const generateBlogPost = async (topic: string): Promise<{ title: string; content: string; }> => {
    const ai = getAi();
    const prompt = `Write a blog post about "${topic}". The post should be engaging, well-structured, and written in Markdown format. The response must be a JSON object with two keys: "title" (a catchy title for the blog post) and "content" (the full blog post in Markdown).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy title for the blog post." },
                    content: { type: Type.STRING, description: "The full blog post content in Markdown format." }
                },
                required: ['title', 'content']
            }
        }
    });
    
    let jsonText = response.text.trim();
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }

    try {
        const parsed = JSON.parse(jsonText);
        if (parsed.title && parsed.content) {
            return parsed;
        } else {
            throw new Error("Invalid JSON structure in response.");
        }
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", response.text, e);
        throw new Error("Failed to generate blog post due to invalid response format.");
    }
};

// Fix: Implement and export generateFeaturedImage to resolve missing export error.
export const generateFeaturedImage = async (topic: string): Promise<string> => {
    const ai = getAi();
    const prompt = `Create a visually stunning and relevant featured image for a blog post about "${topic}". The image should be high-quality, eye-catching, and suitable for a blog header. The aspect ratio should be 16:9.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image.imageBytes) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    throw new Error("Image generation failed, no image data returned.");
};

export const generateThumbnail = async (imageBase64: string, title: string, style: string): Promise<string> => {
    const ai = getAi();

    if (!imageBase64.includes(';base64,')) {
        throw new Error('Invalid base64 image format.');
    }

    const parts = imageBase64.split(';base64,');
    const mimeType = parts[0].replace('data:', '');
    const base64Data = parts[1];

    const prompt = `
        Create an eye-catching YouTube thumbnail with a 16:9 aspect ratio based on the provided image for a video titled "${title}".
        The video style is "${style}".
        Make the thumbnail vibrant, engaging, and easy to read at small sizes.
        You can add stylized text of the title, graphical elements, or adjust the image to make it more dramatic.
        Do not change the main subject of the image.
        The output must be a single image.
    `;

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const resultMimeType = part.inlineData.mimeType;
                return `data:${resultMimeType};base64,${base64ImageBytes}`;
            }
        }
    }

    throw new Error("Image generation failed, no image data returned.");
};