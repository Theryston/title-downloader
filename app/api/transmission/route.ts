import { NextRequest } from "next/server";
import Transmission from "transmission";

export async function POST(request: NextRequest) {
    const { transmission_host, transmission_username, transmission_password, magnetUri } = await request.json()

    if (!transmission_host) {
        return new Response(
            JSON.stringify({
                message: "Por favor, adicione o endereço do seu transmission"
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

    const transmissionUrl = new URL(`http://${transmission_host.replace("http://", "").replace("https://", "")}`)
    const { hostname: host, port } = transmissionUrl

    const transmission = new Transmission({
        host,
        port: port,
        username: transmission_username,
        password: transmission_password
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

export async function GET(request: NextRequest) {
    const search = request.nextUrl.searchParams
    const transmission_host = search.get('transmission_host')
    const transmission_username = search.get('transmission_username')
    const transmission_password = search.get('transmission_password')

    if (!transmission_host) {
        return new Response(
            JSON.stringify({
                message: "Por favor, adicione o endereço do seu transmission"
            }),
            { status: 400 }
        )
    }

    const transmissionUrl = new URL(`http://${transmission_host.replace("http://", "").replace("https://", "")}`)
    const { hostname: host, port } = transmissionUrl

    const transmission = new Transmission({
        host,
        port: port,
        username: transmission_username,
        password: transmission_password
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