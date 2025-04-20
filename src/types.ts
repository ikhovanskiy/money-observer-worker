interface PrepareLastPriceResponse {
  instrumentName: string;
  price: number;
  timestamp: number;
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
  instruments?: Record<string, AccountInstrument | undefined>;
}

export { PrepareLastPriceResponse, LastPricesData, Account };
