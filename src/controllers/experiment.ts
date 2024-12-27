import { Account } from "src/types";
import * as fs from "node:fs";
import { Logger } from "src/logger";
import { AccountController } from "src/controllers/account-controller";
import { FIGI } from "src/enum";
import { TIME_OF_SYNC_WITH_BACKUP } from "src/constants";
import { Worker } from "src/worker";

abstract class Experiment {
  private experimentName: string;
  private account: Account | null = null;
  public host: Worker;

  constructor(host: Worker, experimentName: string) {
    this.host = host;
    this.experimentName = experimentName;
  }

  public async init() {
    this.account = await this.readBackupAccount();
    this.syncBackupAccount();
  }

  private readBackupAccount = async (): Promise<Account | null> => {
    return await new Promise((resolve) =>
      fs.readFile(
        `./backup/accounts/${this.experimentName}.json`,
        "utf8",
        (err, data) => {
          if (err) {
            Logger.error("error while READ backup account");
          }
          resolve(data ? JSON.parse(data) : null);
        }
      )
    );
  };

  private writeBackupAccount = async (data: Account) => {
    new Promise((resolve) => {
      fs.writeFile(
        `./backup/accounts/${this.experimentName}.json`,
        JSON.stringify(data),
        "utf-8",
        (err) => {
          if (err) {
            Logger.error("error while WRITE backup account");
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });
  };

  public buy = async (figi: FIGI, price: number) => {
    if (!this.account) {
      return;
    }

    this.account = AccountController.buy(this.account, figi, price);
  };

  public sell = async (figi: FIGI, price: number) => {
    if (!this.account) {
      return;
    }

    this.account = AccountController.sell(this.account, figi, price);
  };

  private syncBackupAccount = () => {
    setInterval(() => {
      if (!this.account) {
        return;
      }

      Logger.log("try sync backup account");
      this.writeBackupAccount(this.account);
    }, TIME_OF_SYNC_WITH_BACKUP);
  };
}

export { Experiment };
