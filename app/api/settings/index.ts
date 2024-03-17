import path from "path"
import fs from "fs"
import os from "os"

const projectFolder = path.join(os.homedir(), "title-downloader")
const settingsPath = path.join(projectFolder, "settings.json")

export type Settings = {
    transmissionHost?: string
    transmissionUsername?: string
    transmissionPassword?: string
    hasSet?: boolean
}

export async function getSettings(): Promise<Settings> {
    if (!fs.existsSync(settingsPath)) {
        return {};
    }

    const raw = fs.readFileSync(settingsPath, "utf-8");

    return JSON.parse(raw)
}

export async function setSettings(settings: Settings) {
    if (!fs.existsSync(projectFolder)) {
        fs.mkdirSync(projectFolder, { recursive: true })
    }

    if (!fs.existsSync(settingsPath)) {
        settings.hasSet = true
    }

    fs.writeFileSync(settingsPath, JSON.stringify(settings))
}