import betterSqlite3 from 'better-sqlite3'
import path from "path"
import fs from "fs"
import Sonic from 'sonic-channel'

const GITHUB_PROJECT_NAME = "Theryston/comandotorrent.info-indexer"

const sonicIngest = new Sonic.Ingest({
    host: '127.0.0.1',
    port: 1491,
    auth: 'SecretPassword',
})

sonicIngest.connect({
    connected() {
        console.log('Sonic ingest connected')
    },
    error(err) {
        console.log('Sonic ingest error', err)
    }
})

async function main() {
    try {
        const dbPath = path.join(process.cwd(), 'db', 'Database.sqlite3')

        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath)
        }

        console.log('>>>Starting ingestion<<<')
        console.log('Downloading the database...')

        const latestRelease = await fetch(`https://api.github.com/repos/${GITHUB_PROJECT_NAME}/releases/latest`)

        if (!latestRelease.ok) {
            throw new Error('Failed to find the latest release')
        }

        const { tag_name } = await latestRelease.json()

        const dbFileUrl = `https://github.com/${GITHUB_PROJECT_NAME}/releases/download/${tag_name}/Database.sqlite3`
        const dbFile = await fetch(dbFileUrl)

        if (!dbFile.ok) {
            throw new Error('Failed to download the database')
        }

        const dbFileBuffer = await dbFile.arrayBuffer()

        fs.writeFileSync(dbPath, Buffer.from(dbFileBuffer))

        const db = betterSqlite3(dbPath)

        const all_metadata = db
            .prepare('SELECT * FROM all_metadata')
            .all()

        for (let i = 0; i < all_metadata.length; i++) {
            const metadata = all_metadata[i]
            await sonicIngest.push('all_metadata', 'default', `all_metadata:${metadata.id}`, `${metadata.name} ${metadata.genres}`, {
                lang: 'por'
            })
            console.log(`Added ${i + 1} of ${all_metadata.length} titles`)
        }

        console.log(`>>>Ingestion finished | Imported: ${all_metadata.length} titles<<<`)
    } catch (error) {
        console.log(`>>>Ingestion finished | Error: ${error.message}<<<`)
    } finally {
        sonicIngest.close()
    }
}

main()