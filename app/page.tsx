import { getRandom } from "./api/title/random";
import Home from "./content"
import { LIMIT } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function Page() {
    try {
        const response = await getRandom({ limit: LIMIT, offset: 0 })

        return <Home titlesProp={response.results} />
    } catch {
        return <>Error fetching titles</>
    }
}