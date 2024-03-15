'use client';

import Image from "next/image";

export type TitleType = {
    id: string;
    name: string;
    poster_url: string;
}

export default function Title({ title, onClick }: { title: TitleType, onClick: () => void }) {
    const url = getQuality(title.poster_url, "w342")
    return <Image src={url} alt={title.name} width={200} height={300} objectFit="cover" className="w-full h-full cursor-pointer object-cover rounded" onClick={onClick} />
}

function getQuality(url: string, quality: string) {
    return url.replace("original", quality)
}