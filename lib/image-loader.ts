export default function cloudinaryLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // If it's already a Cloudinary URL, use Cloudinary's transformation
  if (src.startsWith('https://res.cloudinary.com')) {
    const params = [`w_${width}`];
    if (quality) params.push(`q_${quality}`);
    
    // Insert transformations into Cloudinary URL
    return src.replace('/upload/', `/upload/${params.join(',')}/`);
  }
  
  // For other URLs, return as-is
  return src;
}