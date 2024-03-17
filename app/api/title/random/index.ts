import path from "path"
import betterSqlite3 from 'better-sqlite3'

export async function getRandom({ limit = 20, offset = 0 }: { limit?: number, offset?: number }) {
    try {
        const dbPath = path.join(process.cwd(), 'db', 'Database.sqlite3')
        const db = betterSqlite3(dbPath)

        const columns = db.prepare("PRAGMA table_info(all_metadata)").all();
        const hasRandomColumn = columns.some((column: any) => column.name === 'random');

        if (!hasRandomColumn) {
            db.prepare("ALTER TABLE all_metadata ADD COLUMN random REAL").run();
        }

        if (offset === 0) {
            db.prepare("UPDATE all_metadata SET random = RANDOM()").run();
        }

        const all_metadata: any = db
            .prepare(`SELECT * FROM all_metadata ORDER BY random LIMIT ${limit} OFFSET ${offset}`)
            .all();

        const { total }: any = db
            .prepare(`SELECT COUNT(*) as total FROM all_metadata`)
            .get()

        return { amount: all_metadata.length, total, results: all_metadata }
    } catch (error) {
        console.log('Get random error', error)
        throw error
    }
}