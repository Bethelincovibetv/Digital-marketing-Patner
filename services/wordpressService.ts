import type { WordPressCredentials } from '../types.ts';

function base64ToBlob(base64: string, contentType = ''): Blob {
    const sliceSize = 512;
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}


async function uploadImage(creds: WordPressCredentials, imageBase64: string, title: string): Promise<number> {
    const { url, username, password } = creds;
    if (!password) {
        throw new Error("Application Password is required to upload images.");
    }

    // Fix: Used 'imageBase64' instead of undeclared 'imageData' to extract mimeType.
    const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
    const imageData = imageBase64.split(',')[1];
    const imageBlob = base64ToBlob(imageData, mimeType);
    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-featured-image.jpg`;

    const headers = new Headers();
    headers.append('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
    headers.append('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.append('Content-Type', mimeType);

    const response = await fetch(`${url}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: headers,
        body: imageBlob,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error during image upload.' }));
        console.error("Image upload error:", errorData);
        throw new Error(`Failed to upload image: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.id;
}


export const postArticle = async (
    creds: WordPressCredentials,
    title: string,
    content: string,
    imageBase64: string,
): Promise<{ link: string }> => {
    const { url, username, password } = creds;
     if (!password) {
        throw new Error("Application Password is required to post articles.");
    }

    const mediaId = await uploadImage(creds, imageBase64, title);

    const headers = new Headers();
    headers.append('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({
        title,
        content,
        status: 'publish',
        featured_media: mediaId,
    });

    const response = await fetch(`${url}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error during post creation.' }));
        console.error("Post creation error:", errorData);
        throw new Error(`Failed to create post: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return { link: data.link };
};