import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'C:/dev/site-principal/tina/__generated__/.cache/1779992558020', url: 'https://content.tinajs.io/2.4/content/dummy/github/main', token: 'dummy', queries,  });
export default client;
  