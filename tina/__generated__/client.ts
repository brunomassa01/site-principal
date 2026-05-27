import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'C:/dev/site-principal/tina/__generated__/.cache/1779911726276', url: 'http://localhost:4001/graphql', token: 'null', queries,  });
export default client;
  