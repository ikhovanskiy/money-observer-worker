import { MAX_TIME_OF_LAST_PRICES_DATA } from "src/constants";
import { Logger } from "src/logger";
import { LastPricesData } from "src/types";
import { PrepareLastPriceResponse, Worker } from "src/worker";

class FastLastPricesDataController {
  private lastPricesData: LastPricesData = new Map();

  private host: Worker;
  constructor(host: Worker) {
    this.host = host;
  }

  public uploadToLastPricesData = (data: PrepareLastPriceResponse) => {
    const lastPricesData = this.lastPricesData.get(data.instrumentName) ?? [];

    if (lastPricesData.find((lastPrice) => lastPrice.time === data.time)) {
      return;
    }

    lastPricesData.push(data);

    if (
      Date.now() - (lastPricesData[0]?.time ?? 0) >
      MAX_TIME_OF_LAST_PRICES_DATA
    )
      lastPricesData.shift();

    Logger.log(
      `upload to last prices data ${data.instrumentName}, price: ${data.price}, ${data.humanTime.date} at ${data.humanTime.time}`
    );
    this.lastPricesData.set(data.instrumentName, lastPricesData);
  };

  private getLastPricesOnInit = async () => {
    Logger.log("get last prices on init ");
    const data = await this.host.readBackupLastPricesData();

    if (!data) return;

    for (const [key, value] of data) {
      data.set(
        key,
        value.filter(({ time }) => {
          return Date.now() - time < MAX_TIME_OF_LAST_PRICES_DATA;
        })
      );
    }

    this.lastPricesData = data;
    Logger.log(`current fast lastPrices`);

    const lastPricesDataEntries = this.lastPricesData.entries();
    for (const [key, value] of lastPricesDataEntries) {
      const lastValue = value.at(-1);

      if (!lastValue) {
        Logger.error(`last value empty, ${key}: ${value}`);
        return;
      }

      const {
        humanTime: { date, time },
        price,
      } = lastValue;

      Logger.log(
        `${key}: ${value.length} record, last: ${date} at ${time}; price: ${price}`
      );
    }
  };

  public getLastPricesData() {
    return this.lastPricesData;
  }

  public init() {
    this.getLastPricesOnInit();
  }
}

export { FastLastPricesDataController };
