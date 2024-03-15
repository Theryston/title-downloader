import path from "path";
import fs from "fs";

const logFilePath = path.join(process.cwd(), 'db', 'log.txt')

export function getLog(linesCount?: number) {
    linesCount = linesCount ? linesCount + 1 : undefined

    if (!fs.existsSync(logFilePath)) {
        cleanLog()
    }

    let logLines = fs.readFileSync(logFilePath, 'utf8').split('\n')

    if (linesCount) {
        logLines = logLines.slice(-linesCount)
    }

    logLines.pop()

    return logLines
}

export function addLog(message: string) {
    fs.appendFileSync(logFilePath, `${message}\n`)
}

export function cleanLog() {
    fs.writeFileSync(logFilePath, '')
}