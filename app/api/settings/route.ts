import { getSettings, setSettings } from ".";

export async function GET() {
    return new Response(JSON.stringify(await getSettings()))
}

export async function POST(request: Request) {
    const settings = await request.json();

    await setSettings(settings);

    return new Response(JSON.stringify(await getSettings()))
}