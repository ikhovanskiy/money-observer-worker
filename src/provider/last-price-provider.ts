import { FIGI } from "src/enum";
import { TinkoffInvestApi } from "tinkoff-invest-api";
import { LastPrice } from "tinkoff-invest-api/cjs/generated/marketdata";

class LastPriceProvider {
  private host: TinkoffInvestApi;

  constructor(host: TinkoffInvestApi) {
    this.host = host;
  }

  public subscribe = async (
    figies: FIGI[],
    callback: (lastPrice: LastPrice) => unknown
  ) => {
    const instruments = figies.map((figi) => ({
      figi,
      instrumentId: figi,
    }));

    await this.host.stream.market.lastPrice(
      {
        instruments,
      },
      callback
    );
  };
}

export { LastPriceProvider };
