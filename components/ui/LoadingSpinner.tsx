"use client";

import { ArrowsClockwise } from "@phosphor-icons/react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ size = 20, className = "" }: LoadingSpinnerProps) {
  return (
    <ArrowsClockwise
      size={size}
      className={`animate-spin text-teal-600 ${className}`}
      weight="bold"
    />
  );
}
