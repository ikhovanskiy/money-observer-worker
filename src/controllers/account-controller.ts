import { FIGI } from "src/enum";
import { getInstrumentNameByFigi } from "src/helpers/get-company-name-by-figi";
import { Logger } from "src/logger";
import { Account } from "src/types";

class AccountController {
  static buy(account: Account, figi: FIGI, price: number): Account {
    const { balance } = account;
    const instrumentName = getInstrumentNameByFigi(figi);

    if (balance - price < 0) {
      Logger.log(
        `cant buy ${instrumentName}; balance ${balance} less then price ${price}`
      );
      return account;
    }

    account.balance -= price;

    if (!account.instruments[figi]) {
      account.instruments[figi] = {
        buy: [price],
        sell: [],
        count: 1,
      };
    } else {
      account.instruments[figi].buy.push(price),
        account.instruments[figi].count++;
    }

    Logger.log(`buy ${instrumentName}; price: ${price}`);
    return account;
  }

  static sell(account: Account, figi: FIGI, price: number): Account {
    const instrument = account.instruments[figi];
    const instrumentName = getInstrumentNameByFigi(figi);

    if (!instrument || instrument.count === 0) {
      return account;
    }

    instrument.count--;

    instrument.sell.push(price);

    account.balance += price;

    Logger.log(`sell ${instrumentName}; price: ${price}`);
    return account;
  }
}

export { AccountController };
