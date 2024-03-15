import { NextRequest } from "next/server";
import path from "path";
import betterSqlite3 from 'better-sqlite3'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params

    if (!id) {
        return Response.json(
            {
                message: "Faltando um identificador de título"
            },
            {
                status: 400
            }
        )
    }

    const dbPath = path.join(process.cwd(), 'db', 'Database.sqlite3')
    const db = betterSqlite3(dbPath)

    const metadata: any = db
        .prepare(`SELECT * FROM all_metadata WHERE id = ?`)
        .get(id)

    const title: any = db
        .prepare(`SELECT * FROM titles WHERE id = ?`)
        .get(metadata?.title_id)

    const torrents: any = db
        .prepare(`SELECT * FROM torrents WHERE title_id = ?`)
        .all(metadata?.title_id)

    const page: any = db.
        prepare(`SELECT * FROM pages WHERE title_id = ?`)
        .get(metadata?.title_id)

    if (torrents.length === 1 && !torrents[0].torrent_title) {

        torrents[0].torrent_title = page?.page_title
    }

    return Response.json({ ...metadata, title, page, torrents })
}