import { Account } from "src/types";
import * as fs from "node:fs";
import { Logger } from "src/logger";
import { AccountController } from "src/controllers/account-controller";
import { FIGI } from "src/enum";
import { TIME_OF_SYNC_WITH_BACKUP } from "src/constants";
import { Worker } from "src/worker";
import { PG } from "src/pg";

abstract class Experiment {
  private experimentName: string;
  public account: Account | null = null;

  constructor(experimentName: string) {
    this.experimentName = experimentName;
  }

  public async init() {
    this.account = await PG.initAccountsTable(this.experimentName, {
      balance: 100000,
    });
  }

  public buy = async (figi: string, price: number) => {
    if (!this.account) {
      return;
    }
    this.account = AccountController.buy(this.account, figi, price);
    PG.updateAccount(this.experimentName, this.account);
  };

  public sell = async (figi: string, price: number) => {
    if (!this.account) {
      return;
    }
    this.account = AccountController.sell(this.account, figi, price);
    PG.updateAccount(this.experimentName, this.account);
  };
}

export { Experiment };
