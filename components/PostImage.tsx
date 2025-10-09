"use client"

import { useDominantColor } from "@/lib/useDominantColour";
import Image from "next/image";
import { useState } from "react";

interface Props {
    image_url: string
}

const PostImage = ({ image_url }: Props) => {
    const { dominantColor, isLoading: colour_loading } = useDominantColor(image_url);
    const [isVertical, setIsVertical] = useState(false);
    
    // Handle image load to detect aspect ratio
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        setIsVertical(aspectRatio < 0.9); // Consider vertical if aspect ratio < 0.9
    };
    
    return (
        <div className="my-4 mx-0 rounded-lg overflow-hidden relative w-full max-w-xl">
            {/* Blurred background layer */}
            <div
                className="absolute inset-0 scale-110 blur-lg opacity-50"
                style={{
                    backgroundImage: `url(${image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />

            {/* Dynamic colored overlay */}
            <div
                className="absolute inset-0 transition-colors duration-300"
                style={{
                    backgroundColor: dominantColor || 'rgba(251, 191, 36, 0.2)'
                }}
            />

            {/* Main image container with conditional styling */}
            <div 
                className={`relative w-full ${isVertical ? 'aspect-square max-h-[80vw] md:max-h-96 mx-auto' : 'aspect-video'}`}
            >
                <Image
                    src={image_url}
                    alt="post-image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                    className={`rounded-lg z-10 ${isVertical ? 'object-contain' : 'object-cover'}`}
                    priority={false}
                    onLoad={handleImageLoad}
                />
            </div>
        </div>
    )
}

export default PostImage