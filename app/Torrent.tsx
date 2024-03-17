'use client';

import { Button } from "@nextui-org/react";
import { TorrentType } from "./ModalTitle";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function Torrent({ torrent }: { torrent: TorrentType }) {
    const [isOnTransmission, setIsOnTransmission] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { data: settings } = useSWR("/api/settings", fetcher)
    const { data: transmissionTorrents, mutate } = useSWR('/api/transmission', fetcher)

    const downloadTorrent = useCallback(async () => {
        setIsLoading(true)

        try {
            const response = await fetch(`/api/transmission`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    magnetUri: torrent.magnet
                })
            })

            const json = await response.json()

            if (!response.ok) {
                toast.error(json.message || "Ocorreu um erro")
                return
            }

            await mutate()
            toast.success("Torrent adicionado ao transmission")
        } catch (error) {
            toast.error("Ocorreu um erro")
        } finally {
            setIsLoading(false)
        }
    }, [torrent, mutate])

    useEffect(() => {
        if (!transmissionTorrents || !transmissionTorrents[0] || !torrent.magnet) return;

        const magnetUrl = new URL(torrent.magnet)
        const xt = magnetUrl.searchParams.get("xt")
        const hash = xt?.split(":").pop()?.trim().toLocaleLowerCase();

        if (!hash) {
            return
        }

        const transmissionTorrent = transmissionTorrents.find((t: any) => t.hash === hash)
        setIsOnTransmission(!!transmissionTorrent)
    }, [transmissionTorrents, torrent.magnet])

    return (
        <div key={torrent.id} className="flex flex-col gap-2 items-center">
            <p className="text-sm text-center break-all">
                {(torrent.torrent_title || 'Torrent sem título').trim()}
            </p>
            {!isOnTransmission && (
                <Button fullWidth color="primary" onClick={downloadTorrent} isLoading={isLoading}>
                    Baixar
                </Button>
            )}
            {isOnTransmission && (
                <Button
                    fullWidth
                    color="primary"
                    onClick={() => {
                        const transmissionHost = (settings.transmissionHost || "").trim().replace("http://", "").replace("https://", "")
                        const url = `http://${transmissionHost}/transmission/web/`
                        window.open(url, "_blank")
                    }}
                >
                    Abrir transmission
                </Button>
            )}
        </div>
    )
}