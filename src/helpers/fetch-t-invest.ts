import { HEADERS } from "../constants";

const fetchTInvest = async (path: string, body: string) =>
  await fetch(path, {
    method: "post",
    headers: HEADERS,
    body,
  }).then((res) => res.json());

export { fetchTInvest };
