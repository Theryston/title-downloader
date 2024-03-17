import { NextRequest } from "next/server";
import Transmission from "transmission";
import { getSettings } from "../settings";

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const { magnetUri } = await request.json()
    const { transmissionHost, transmissionUsername, transmissionPassword } = await getSettings()

    if (!transmissionHost) {
        return new Response(
            JSON.stringify({
                message: "Por favor, click em configurações e coloque o endereço do transmission"
            }),
            { status: 400 }
        )
    }

    if (!magnetUri) {
        return new Response(
            JSON.stringify({
                message: "Por favor, adicione o link do torrent"
            }),
            { status: 400 }
        )
    }

    const transmissionUrl = new URL(`http://${transmissionHost.replace("http://", "").replace("https://", "")}`)
    const { hostname: host, port } = transmissionUrl

    const transmission = new Transmission({
        host,
        port: port,
        username: transmissionUsername,
        password: transmissionPassword
    });

    try {
        await new Promise((resolve, reject) => {
            transmission.active(function (err: any, arg: any) {
                if (err) {
                    reject(err)
                } else {
                    resolve(arg)
                }
            });
        })
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: "Acesso negado"
            }),
            { status: 401 }
        )
    }

    try {
        const result = await new Promise((resolve, reject) => {
            transmission.addUrl(magnetUri, {}, function (err: any, arg: any) {
                if (err) {
                    reject(err)
                } else {
                    resolve(arg)
                }
            });
        })

        return new Response(
            JSON.stringify({
                message: "Torrent adicionado ao transmission",
                result
            })
        )
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: "Ocorreu um erro"
            }),
            { status: 500 }
        )
    }
}

export async function GET() {
    const { transmissionHost, transmissionUsername, transmissionPassword } = await getSettings()

    if (!transmissionHost) {
        return new Response(
            JSON.stringify({
                message: "Por favor, click em configurações e coloque o endereço do transmission"
            }),
            { status: 400 }
        )
    }

    const transmissionUrl = new URL(`http://${transmissionHost.replace("http://", "").replace("https://", "")}`)
    const { hostname: host, port } = transmissionUrl

    const transmission = new Transmission({
        host,
        port: port,
        username: transmissionUsername,
        password: transmissionPassword
    });

    try {
        const result: any = await new Promise((resolve, reject) => {
            transmission.get(function (err: any, arg: any) {
                if (err) {
                    reject(err)
                } else {
                    resolve(arg)
                }
            });
        })

        return new Response(JSON.stringify(result?.torrents?.map((torrent: any) => ({
            id: torrent.id,
            magnet_uri: torrent.magnetLink,
            hash: torrent.hashString,
        })) || []))
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: "Acesso negado"
            }),
            { status: 401 }
        )
    }
}