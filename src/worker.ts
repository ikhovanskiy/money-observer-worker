import { TinkoffInvestApi } from "tinkoff-invest-api";
import { Logger } from "./logger";

import { LastPriceProvider } from "./provider/last-price-provider";
import { LastPrice } from "tinkoff-invest-api/cjs/generated/marketdata";

import { BackupController } from "src/controllers/backup-controller";
import { FastLastPricesDataController } from "src/controllers/fast-last-prices-data-controller";
import { PrepareLastPriceResponse } from "src/types";
import { FIGI } from "src/enum";
import { prepareLastPriceResponse } from "src/helpers/prepare-last-price-response";
import { TOKEN } from "src/constants";
import { TestExperiment } from "src/experiments/test-experiment";

class Worker {
  private lastPriceProvider: LastPriceProvider;

  private backupController: BackupController;
  private fastLastPricesData: FastLastPricesDataController;

  private testExperiment: TestExperiment;

  private api: TinkoffInvestApi;

  constructor() {
    this.api = new TinkoffInvestApi({ token: TOKEN });

    this.lastPriceProvider = new LastPriceProvider(this.api);

    this.backupController = new BackupController(this);
    this.fastLastPricesData = new FastLastPricesDataController(this);

    this.testExperiment = new TestExperiment(this, "test-experiment");
  }

  private lastPriceProviderCallback = async (lastPrice: LastPrice) => {
    const data = prepareLastPriceResponse(lastPrice);

    if (!data) return;

    this.fastLastPricesData.uploadToLastPricesData(data);
    await this.testExperiment.processResponse(data);
  };

  public readBackupLastPricesData = () => {
    return this.backupController.readBackupLastPricesData();
  };

  public getFastLastPricesData() {
    return this.fastLastPricesData.getLastPricesData();
  }

  public async init() {
    Logger.log("worker started");

    this.fastLastPricesData.init();
    this.backupController.init();

    this.testExperiment.init();

    this.lastPriceProvider.subscribe(
      [FIGI.YDEX, FIGI.SBER],
      this.lastPriceProviderCallback
    );
  }
}

export { Worker, PrepareLastPriceResponse };
