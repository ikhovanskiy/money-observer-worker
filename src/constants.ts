const T_INVEST_API = "https://sandbox-invest-public-api.tinkoff.ru/rest/";

const TOKEN = process.env.TOKEN ?? ''

const BEARER =
  `Bearer ${TOKEN}`;

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: BEARER,
};

const HOURS = 1000 * 60 * 60;

const MAX_TIME_OF_LAST_PRICES_DATA = HOURS;

const TIME_OF_SYNC_WITH_BACKUP = 30000;

export {
  T_INVEST_API,
  HEADERS,
  TOKEN,
  MAX_TIME_OF_LAST_PRICES_DATA,
  TIME_OF_SYNC_WITH_BACKUP,
};
