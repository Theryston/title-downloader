'use client';

import { Image } from "@nextui-org/react";

export type TitleType = {
    id: string;
    name: string;
    poster_url: string;
}

export default function Title({ title, onClick }: { title: TitleType, onClick: () => void }) {
    const url = getQuality(title.poster_url, "w500")

    return <Image
        isBlurred
        isZoomed
        src={url}
        alt={title.name}
        className="w-full h-full cursor-pointer object-cover"
        onClick={onClick}
    />
}

function getQuality(url: string, quality: string) {
    return url.replace("original", quality)
}