import { TinkoffInvestApi } from "tinkoff-invest-api";
import { Logger } from "./logger";

import { LastPriceProvider } from "./provider/last-price-provider";
import { throttle } from "src/helpers/throttle";
import { LastPrice } from "tinkoff-invest-api/cjs/generated/marketdata";

import { PrepareLastPriceResponse } from "src/types";
import { FIGI } from "src/enum";
import { prepareLastPriceResponse } from "src/helpers/prepare-last-price-response";
import { TOKEN } from "src/constants";
import { LinearApproximationExperiments } from "src/experiments/linear-approximation-experiments";
import { PG } from "src/pg";

class Worker {
  private lastPriceProvider: LastPriceProvider;

  private linearApproximationExperiments: LinearApproximationExperiments;

  private api: TinkoffInvestApi;

  constructor() {
    this.api = new TinkoffInvestApi({ token: TOKEN });

    this.lastPriceProvider = new LastPriceProvider(this.api);

    this.linearApproximationExperiments = new LinearApproximationExperiments();
  }

  private lastPriceProviderCallback = async (lastPrice: LastPrice) => {
    const data = prepareLastPriceResponse(lastPrice);
    if (!data) return;
    await PG.addLastPriceData(data);

    await this.linearApproximationExperiments.processResponse(
      data.instrumentName
    );
  };

  private throttledLastPriceProviderCallback = throttle(
    this.lastPriceProviderCallback,
    10
  );

  public async init() {
    Logger.log("worker started");

    this.linearApproximationExperiments.init();

    this.lastPriceProvider.subscribe(
      [...Object.values(FIGI)],
      this.throttledLastPriceProviderCallback
    );
  }
}

export { Worker, PrepareLastPriceResponse };
