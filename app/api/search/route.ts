import { NextRequest } from "next/server"
import Sonic from 'sonic-channel'
import betterSqlite3 from 'better-sqlite3'
import path from "path"

export const dynamic = 'force-dynamic'

const sonicSearch = new Sonic.Search({
    host: '127.0.0.1',
    port: 1491,
    auth: 'SecretPassword',
})

sonicSearch.connect({
    connected() {
        console.log('Sonic search connected')
    },
})

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q')
    const limit = Number(searchParams.get('limit')) || 20
    const offset = Number(searchParams.get('offset')) || 0

    if (!q) {
        return Response.json(
            {
                message: "Faltando um termo de busca"
            },
            {
                status: 400
            }
        )
    }

    const searchIds = await sonicSearch.query('all_metadata', 'default', q, {
        lang: 'por',
        limit,
        offset,
    })

    const allMetadataIdsSet = new Set()

    for (const id of searchIds) {
        allMetadataIdsSet.add(id.split(':')[1])
    }

    const dbPath = path.join(process.cwd(), 'db', 'Database.sqlite3')
    const db = betterSqlite3(dbPath)

    try {
        const allMetadataIds = Array.from(allMetadataIdsSet)
        const results = db
            .prepare(`SELECT * FROM all_metadata WHERE id IN (${allMetadataIds.map(() => '?').join(', ')})`)
            .all(allMetadataIds)

        return Response.json({ results })
    } catch (error) {
        return Response.json(
            {
                message: "Por favor, importe os dados antes"
            },
            {
                status: 404
            }
        )
    }
}
