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
    const { data: transmissionTorrents, mutate } = useSWR(`/api/transmission?transmission_host=${localStorage.getItem("transmissionHost")}&transmission_username=${localStorage.getItem("transmissionUsername")}&transmission_password=${localStorage.getItem("transmissionPassword")}`, fetcher)

    const downloadTorrent = useCallback(async () => {
        const transmissionHost = localStorage.getItem("transmissionHost")
        const transmissionUsername = localStorage.getItem("transmissionUsername")
        const transmissionPassword = localStorage.getItem("transmissionPassword")

        if (!transmissionHost) {
            toast.error("Por favor, click em configurações e adicione o endereço do seu transmission")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`/api/transmission`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transmission_host: transmissionHost,
                    transmission_username: transmissionUsername,
                    transmission_password: transmissionPassword,
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
        const magnetUrl = new URL(torrent.magnet)
        const xt = magnetUrl.searchParams.get("xt")
        const hash = xt?.split(":").pop()?.trim().toLocaleLowerCase();

        if (!hash) {
            return
        }

        const transmissionTorrent = transmissionTorrents?.find((t: any) => t.hash === hash)
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
                        const transmissionHost = (localStorage.getItem("transmissionHost") || "").trim().replace("http://", "").replace("https://", "")
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