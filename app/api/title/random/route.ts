import { NextRequest } from "next/server"
import { getRandom } from "."

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    const response = await getRandom({ limit: Number(limit), offset: Number(offset) })

    return new Response(JSON.stringify(response))
}