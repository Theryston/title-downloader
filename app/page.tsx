import { getRandom } from "./api/title/random";
import Home from "./content"
import { LIMIT } from "@/lib/constants";

export default async function Page() {
    const response = await getRandom({ limit: LIMIT, offset: 0 })

    return <Home titlesProp={response.results} />
}