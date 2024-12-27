import { PrepareLastPriceResponse, Worker } from "src/worker";
import * as fs from "node:fs";
import { TIME_OF_SYNC_WITH_BACKUP } from "src/constants";
import { Logger } from "src/logger";
import { LastPricesData } from "src/types";

class BackupController {
  private host: Worker;
  constructor(host: Worker) {
    this.host = host;
  }

  public readBackupLastPricesData = async (): Promise<
    LastPricesData | undefined
  > => {
    return await new Promise((resolve) =>
      fs.readFile("./backup/last-prices-data.json", "utf8", (err, data) => {
        if (err) {
          Logger.error("error while READ backup last prices data");
        }
        resolve(new Map(Object.entries(JSON.parse(data))));
      })
    );
  };

  private writeToBackupLastPricesData = async (data: LastPricesData) => {
    new Promise((resolve) => {
      fs.writeFile(
        "./backup/last-prices-data.json",
        JSON.stringify(Object.fromEntries(data)),
        "utf-8",
        (err) => {
          if (err) {
            Logger.error("error while WRITE backup last prices data");
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });
  };

  private syncBackupLastPricesData = async () => {
    Logger.log("try to sync backup last prices data");
    const backupData = await this.readBackupLastPricesData();

    const fastLastPricesData = this.host.getFastLastPricesData();

    if (!backupData) {
      await this.writeToBackupLastPricesData(fastLastPricesData);
      return;
    }

    let changes = false;

    for (let [key, value] of fastLastPricesData) {
      const backupValue = backupData.get(key);

      if (!backupValue) {
        backupData.set(key, value);
        changes = true;
      } else {
        for (const lastPrice of value) {
          if (
            !backupValue.find(
              (backupLastPrice) => backupLastPrice.time === lastPrice.time
            )
          ) {
            backupValue.push(lastPrice);
            changes = true;
          }
        }
      }
    }

    if (changes) {
      await this.writeToBackupLastPricesData(backupData);
      Logger.log("successfully sync");
    } else {
      Logger.log("no changes while sync backup last prices data");
    }
  };

  private setIntervalCallback = async () => {
    await this.syncBackupLastPricesData();
  };

  public init() {
    setInterval(this.setIntervalCallback, TIME_OF_SYNC_WITH_BACKUP);
  }
}

export { BackupController };
