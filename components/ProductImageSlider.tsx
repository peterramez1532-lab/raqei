"use client";

import { useEffect, useState } from "react";

type ProductImageSliderProps = {
  images: string[];
  alt: string;
};

export default function ProductImageSlider({
  images,
  alt,
}: ProductImageSliderProps) {
  const validImages = images.filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (validImages.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((current) => {
        return (current + 1) % validImages.length;
      });
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [validImages.length]);

  if (validImages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-black/20">
        Product Image
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {validImages.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            index === currentIndex
              ? "opacity-100"
              : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
