import { FIGI } from "src/enum";

interface PrepareLastPriceResponse {
  instrumentName: string;
  price: number;
  time: number;
  humanTime: {
    time: string;
    date: string;
  };
}

type LastPricesData = Map<
  PrepareLastPriceResponse["instrumentName"],
  PrepareLastPriceResponse[]
>;

interface AccountInstrument {
  buy: number[];
  sell: number[];
  count: number;
}

interface Account {
  balance: number;
  instruments: Record<FIGI, AccountInstrument | undefined>;
}

export { PrepareLastPriceResponse, LastPricesData, Account };
