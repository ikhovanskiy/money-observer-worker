import { T_INVEST_API } from "../constants";
import { fetchAndLog } from "../helpers/fetch-and-log";

const API_PREFIX =
  T_INVEST_API + "tinkoff.public.invest.api.contract.v1.InstrumentsService/";

class InstrumentsProvider {
  //Запрос на поиск инструментов.
  public findInstrument = async (
    query: string,
    instrumentKind: string = "INSTRUMENT_TYPE_SHARE"
  ) => {
    const body = JSON.stringify({
      query,
      instrumentKind,
      apiTradeAvailableFlag: true,
    });

    return await fetchAndLog(`${API_PREFIX}FindInstrument`, body);
  };
}

export { InstrumentsProvider };
