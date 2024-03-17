'use client';

import { fetcher } from "@/lib/fetcher";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from "@nextui-org/react";
import { GearIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

export default function Settings() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { data: settings, mutate } = useSWR("/api/settings", fetcher)
    const [transmissionHost, setTransmissionHost] = useState("")
    const [transmissionUsername, setTransmissionUsername] = useState("")
    const [transmissionPassword, setTransmissionPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = useCallback(async (onClose: () => void) => {
        try {
            setIsLoading(true)
            await fetch("/api/settings", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transmissionHost,
                    transmissionUsername,
                    transmissionPassword
                })
            })
            await mutate()
        } finally {
            setIsLoading(false)
            onClose()
        }
    }, [transmissionHost, transmissionUsername, transmissionPassword, mutate])

    const onCancel = useCallback((onClose: () => void) => {
        onClose()
    }, [])

    useEffect(() => {
        if (!isOpen) {
            setTransmissionHost("")
            setTransmissionUsername("")
            setTransmissionPassword("")
        } else {
            setTransmissionHost(settings?.transmissionHost || "")
            setTransmissionUsername(settings?.transmissionUsername || "")
            setTransmissionPassword(settings?.transmissionPassword || "")
        }
    }, [isOpen, settings])

    return (
        <>
            <div className="fixed z-50 top-4 right-4 flex gap-2">
                <Button
                    onClick={onOpen}
                    size="sm"
                    color="primary"
                    className={`${!isOpen && !settings?.hasSet ? 'pulse' : ''}`}
                    isIconOnly
                >
                    <GearIcon className="w-5 h-5" />
                </Button>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Configurações
                            </ModalHeader>
                            <ModalBody>
                                <Input type="text" label="Endereço do transmission" placeholder="localhost:9091" value={transmissionHost} onChange={(e) => setTransmissionHost(e.target.value)} />
                                <Input type="text" label="Usuário do transmission" placeholder="transmission" value={transmissionUsername} onChange={(e) => setTransmissionUsername(e.target.value)} />
                                <Input type="text" label="Senha do transmission" placeholder="******" value={transmissionPassword} onChange={(e) => setTransmissionPassword(e.target.value)} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onClick={() => onCancel(onClose)}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onClick={() => onSubmit(onClose)} isLoading={isLoading}>
                                    Salvar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
