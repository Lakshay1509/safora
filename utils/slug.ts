export function generateSlug(text: string): string {
    
    let slug = text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')   
        .replace(/\s+/g, '-')       
        .replace(/--+/g, '-');
    
   
    const maxLength = 60;
    if (slug.length > maxLength) {
        
        const lastHyphenIndex = slug.substring(0, maxLength).lastIndexOf('-');
        if (lastHyphenIndex !== -1) {
            slug = slug.substring(0, lastHyphenIndex);
        } else {
            
            slug = slug.substring(0, maxLength);
        }
    }

    const uniqueSuffix = Math.random().toString(36).substring(2, 6);

    return `${slug}-${uniqueSuffix}`;
}

