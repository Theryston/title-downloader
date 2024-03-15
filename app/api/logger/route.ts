import { NextRequest } from "next/server";
import { getLog } from "./log";

export async function GET(request: NextRequest) {
    const linesCount = Number(request.nextUrl.searchParams.get('lines'))

    const logLines = getLog(linesCount)

    return new Response(
        JSON.stringify({
            lines: logLines
        }),
        { status: 200 }
    )
}