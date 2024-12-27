import { getInstrumentNameByFigi } from "src/helpers/get-company-name-by-figi";
import { PrepareLastPriceResponse } from "src/types";
import { Helpers } from "tinkoff-invest-api";
import { LastPrice } from "tinkoff-invest-api/cjs/generated/marketdata";

const prepareLastPriceResponse = (
  lastPrice: LastPrice
): PrepareLastPriceResponse | null => {
  if (!lastPrice.time || !lastPrice.figi || !lastPrice.price) return null;

  const instrumentName = getInstrumentNameByFigi(lastPrice.figi);

  if (!instrumentName) return null;

  return {
    instrumentName,
    price: Helpers.toNumber(lastPrice.price),
    time: new Date(lastPrice.time).getTime(),
    humanTime: {
      time: new Date(lastPrice.time).toLocaleTimeString(),
      date: new Date(lastPrice.time).toLocaleDateString(),
    },
  };
};

export { prepareLastPriceResponse };
