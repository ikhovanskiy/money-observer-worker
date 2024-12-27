import { fetchTInvest } from "./fetch-t-invest";

const fetchAndLog = async (path: string, body: string) =>
  await fetchTInvest(path, body).then(console.log);

export { fetchAndLog };
