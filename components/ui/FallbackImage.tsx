"use client";

import { useState, type ImgHTMLAttributes } from "react";

type FallbackImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "onError"> & {
  fallbackClassName?: string;
};

export default function FallbackImage({
  src,
  alt,
  className,
  fallbackClassName,
  ...rest
}: FallbackImageProps) {
  const [isError, setIsError] = useState(!src);

  if (isError) {
    return (
      <div
        className={
          fallbackClassName ??
          "flex h-full w-full items-center justify-center p-6"
        }
      >
        <span className="text-center font-sans text-sm text-black/40">
          Yah, gambar belum ada nih:(
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setIsError(true)}
      {...rest}
    />
  );
}
