'use client';

import { Modal, ModalBody, ModalContent, ModalHeader, Progress } from "@nextui-org/react";
import { TitleType } from "./Title"
import { useCallback, useEffect, useState } from "react";
import Torrent from "./Torrent";

type Props = {
    title: TitleType | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export type TorrentType = {
    id: string
    torrent_title: string
    magnet: string
    title_id: string
}

type FullTitle = TitleType & { torrents: TorrentType[] }

export default function ModalTitle({ title, isOpen, onOpenChange }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [fullTitle, setFullTitle] = useState<FullTitle | null>(null)

    const getTorrents = useCallback(async (currentTitle: TitleType) => {
        setIsLoading(true)

        try {
            const response = await fetch(`/api/title/${currentTitle.id}`)
            const json = await response.json()
            setFullTitle(json)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!title) {
            return
        }

        getTorrents(title)
    }, [title, getTorrents])

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 items-center text-center">
                    {title?.name}
                </ModalHeader>
                <ModalBody className="w-full mb-5">
                    {isLoading &&
                        <Progress
                            size="sm"
                            isIndeterminate
                            label="Loading..."
                        />
                    }

                    {!isLoading && (
                        <div className="flex flex-col gap-5">
                            {!fullTitle?.torrents.length && <p className="text-center text-sm">Nenhum torrent encontrado</p>}
                            {fullTitle?.torrents.map(torrent => <Torrent key={torrent.id} torrent={torrent} />)}
                        </div>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal >
    )
}