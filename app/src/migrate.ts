import { client } from '$lib/server/db';

await client.migrate({});
