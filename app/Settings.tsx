'use client';

import { fetcher } from "@/lib/fetcher";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from "@nextui-org/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type Props = {
    onSuccessImport: () => void
}

export default function Settings({ onSuccessImport }: Props) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [transmissionHost, setTransmissionHost] = useState("")
    const [transmissionUsername, setTransmissionUsername] = useState("")
    const [transmissionPassword, setTransmissionPassword] = useState("")
    const [isLoadingImport, setIsLoadingImport] = useState(false)
    const { data: importData, mutate } = useSWR('/api/search/import', fetcher, { refreshInterval: isLoadingImport ? 1000 : 0, revalidateOnFocus: false })
    const toastImportingId = useRef<any>(null)
    const alreadyNotified = useRef(false)

    const onSubmit = useCallback((onClose: () => void) => {
        localStorage.setItem("transmissionHost", transmissionHost)
        localStorage.setItem("transmissionUsername", transmissionUsername)
        localStorage.setItem("transmissionPassword", transmissionPassword)
        onClose()
    }, [transmissionHost, transmissionUsername, transmissionPassword])

    const onCancel = useCallback((onClose: () => void) => {
        onClose()
    }, [])

    const onImport = useCallback(async () => {
        setIsLoadingImport(true)

        try {
            await fetch("/api/search/import", {
                method: "POST",
            })
            await mutate()
        } finally {
            setIsLoadingImport(false)
        }
    }, [mutate])

    useEffect(() => {
        if (!importData) {
            return
        }

        if (!importData.isImporting) {
            setIsLoadingImport(false)

            if (typeof importData.isSuccess !== 'undefined' && !importData.isSuccess) {
                if (!alreadyNotified.current) {
                    alreadyNotified.current = true
                    toast.error(importData.message)
                }
            }

            if (typeof importData.isSuccess !== 'undefined' && importData.isSuccess) {
                if (!alreadyNotified.current) {
                    alreadyNotified.current = true
                    toast.success(importData.message)
                    onSuccessImport()
                }
            }

            if (toastImportingId.current) {
                toast.dismiss(toastImportingId.current)
            }

            return
        }

        alreadyNotified.current = false
        setIsLoadingImport(true)
        toastImportingId.current = toast.loading(importData.progressText, { id: toastImportingId.current })
    }, [importData, onSuccessImport])

    // const checkImporting = useCallback(() => {
    //     if (toastImportingId.current) {
    //         return;
    //     }

    //     toastImportingId.current = toast.loading("Verificando a importação de dados...")

    //     setInterval(async () => {
    //         const response = await fetch("/api/search/import")

    //         if (!response.ok) {
    //             toast.dismiss(toastImportingId.current)
    //             setIsLoadingImport(false)
    //             return
    //         }

    //         const json = await response.json()

    //         if (!json.isImporting) {
    //             toast.dismiss(toastImportingId.current)
    //             setIsLoadingImport(false)

    //             if (typeof json.isSuccess !== 'undefined' && !json.isSuccess) {
    //                 if (!alreadyNotified.current) {
    //                     alreadyNotified.current = true
    //                     toast.error(json.message)
    //                 }
    //             }

    //             if (typeof json.isSuccess !== 'undefined' && json.isSuccess) {
    //                 if (!alreadyNotified.current) {
    //                     console.log('json.message', json.message)
    //                     alreadyNotified.current = true
    //                     toast.success(json.message)
    //                     onSuccessImport()
    //                 }
    //             }

    //             return
    //         }

    //         alreadyNotified.current = false
    //         setIsLoadingImport(true)
    //         toast.loading(json.progressText, { id: toastImportingId.current })
    //     }, 1000)
    // }, [onSuccessImport])

    // useEffect(() => {
    //     checkImporting()
    // }, [checkImporting])

    useEffect(() => {
        setTransmissionHost(localStorage.getItem("transmissionHost") || "")
        setTransmissionUsername(localStorage.getItem("transmissionUsername") || "")
        setTransmissionPassword(localStorage.getItem("transmissionPassword") || "")
    }, [isOpen])

    return (
        <>
            <div className="absolute top-4 right-4 flex gap-2">
                <Button
                    size="sm"
                    color="secondary"
                    onClick={() => onImport()}
                    isLoading={isLoadingImport}
                >
                    Importar dados
                </Button>

                <Button onClick={onOpen} size="sm" color="primary" >
                    Configurações
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
                                <Button color="primary" onClick={() => onSubmit(onClose)}>
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
