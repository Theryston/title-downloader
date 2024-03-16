import betterSqlite3 from 'better-sqlite3'
import path from "path"
import fs from "fs"
import Sonic from 'sonic-channel'
import { addLog, cleanLog, getLog } from '../../logger/log'

export const dynamic = 'force-dynamic'

const sonicIngest = new Sonic.Ingest({
    host: '127.0.0.1',
    port: 1491,
    auth: 'SecretPassword',
})

sonicIngest.connect({
    connected() {
        console.log('Sonic ingest connected')
    },
    error(err: any) {
        console.log('Sonic ingest error', err)
    }
})

const GITHUB_PROJECT_NAME = "Theryston/comandotorrent.info-indexer"

export const POST = async () => {
    try {
        const dbPath = path.join(process.cwd(), 'db', 'Database.sqlite3')

        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath)
        }

        cleanLog()
        addLog('>>>Starting ingestion')
        addLog('Baixando o banco de dados...')

        const latestRelease = await fetch(`https://api.github.com/repos/${GITHUB_PROJECT_NAME}/releases/latest`)

        if (!latestRelease.ok) {
            throw new Error('Falha ao encontrar última versão do banco de dados')
        }

        const { tag_name } = await latestRelease.json()

        const dbFileUrl = `https://github.com/${GITHUB_PROJECT_NAME}/releases/download/${tag_name}/Database.sqlite3`
        const dbFile = await fetch(dbFileUrl)

        if (!dbFile.ok) {
            throw new Error('Falha ao encontrar o arquivo de banco de dados')
        }

        const dbFileBuffer = await dbFile.arrayBuffer()

        fs.writeFileSync(dbPath, Buffer.from(dbFileBuffer))

        const db = betterSqlite3(dbPath)

        const all_metadata: any[] = db
            .prepare('SELECT * FROM all_metadata')
            .all()

        for (let i = 0; i < all_metadata.length; i++) {
            const metadata = all_metadata[i]
            await sonicIngest.push('all_metadata', 'default', `all_metadata:${metadata.id}`, `${metadata.name} ${metadata.genres}`, {
                lang: 'por'
            })
            addLog(`Adicionado ${i + 1} de ${all_metadata.length} títulos`)
        }

        addLog(`>>>Ingestion finished|success:${all_metadata.length} títulos importados`)
        return Response.json({ message: "success" })
    } catch (error: any) {
        addLog(`>>>Ingestion finished|error:${error.message || 'Erro na importação dos dados'}`)
        return Response.json({ message: error.message || 'Erro na importação dos dados' }, { status: 500 })
    }
}

export function GET() {
    const lines = getLog();

    let indexStartIngestion = undefined
    let indexEndIngestion = undefined
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (line.startsWith('>>>Starting ingestion')) {
            indexStartIngestion = i
            continue
        }

        if (line.includes('>>>Ingestion finished')) {
            indexEndIngestion = i
            break
        }
    }

    if (typeof indexStartIngestion === 'undefined' && typeof indexEndIngestion === 'undefined') {
        return Response.json({ isImporting: false })
    }

    if (typeof indexStartIngestion !== 'undefined' && typeof indexEndIngestion === 'undefined') {
        return Response.json({ isImporting: true, progressText: lines[lines.length - 1] })
    }

    if (typeof indexStartIngestion !== 'undefined' && typeof indexEndIngestion !== 'undefined') {
        const endLine = lines[indexEndIngestion]
        const [status, message] = endLine.split('|')[1].split(':')
        return Response.json({ isImporting: false, isSuccess: status === 'success', message })
    }

    return Response.json({ isImporting: false })
}