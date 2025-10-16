// ...existing code...

// Add this helper function
export const convertUrlsToMarkdownLinks = (text: string): string => {
    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    return text.replace(urlRegex, (url) => {
        // Check if the URL is already wrapped in markdown link syntax
        const beforeUrl = text.substring(0, text.indexOf(url));
        const afterUrl = text.substring(text.indexOf(url) + url.length);
        
        // If already in markdown format [text](url), don't modify
        if (beforeUrl.endsWith('](') || beforeUrl.endsWith('[')) {
            return url;
        }
        
        // Convert plain URL to markdown link
        try {
            const urlObj = new URL(url);
            const displayText = urlObj.hostname;
            return `[${displayText}](${url})`;
        } catch {
            return `[${url}](${url})`;
        }
    });
};

