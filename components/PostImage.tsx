"use client"

import { useDominantColor } from "@/lib/useDominantColour";
import Image from "next/image";

interface Props {
    image_url: string
}

const PostImage = ({ image_url }: Props) => {
    const { dominantColor, isLoading: colour_loading } = useDominantColor(image_url);
    return (
        // Remove negative margins and use proper containment
        <div className="my-4 mx-0 rounded-lg overflow-hidden relative">
            {/* Blurred background layer */}
            <div
                className="absolute inset-0 scale-110 blur-lg opacity-60"
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

            {/* Main image container - fixed max width to prevent overflow */}
            <div className="relative aspect-square max-h-[100vw] w-full h-full md:w-100 md:h-100 mx-auto">
              <Image
                src={image_url}
                alt="post-image"
                fill
                sizes="(min-width: 1415px) 750px, (min-width: 768px) 50vw, 100vw"
                className="object-contain rounded-lg z-10"
              />
            </div>
        </div>
    )
}

export default PostImage