import { z } from "zod";

const accountInstrumentSchema = z.object({
  buy: z.array(z.number()),
  sell: z.array(z.number()),
  count: z.number(),
});

const accountSchema = z.object({
  balance: z.number(),
  instruments: z
    .record(z.string(), accountInstrumentSchema.optional())
    .optional(),
});

const getAccountOutputSchema = accountSchema;

const getAllAccountsOutputSchema = z.array(accountSchema);

const updateAccountOutputSchema = accountSchema;

const initAccountsTableOutputSchema = accountSchema.nullable();

const addLastPriceDataOutputSchema = z.object({
  instrument_name: z.string(),
  price: z.string(),
  timestamp: z.string(),
});

const getLastPricesDataOutputSchema = z.array(
  z.object({
    instrument_name: z.string(),
    price: z.string(),
    timestamp: z.string(),
  })
);

export {
  accountInstrumentSchema,
  accountSchema,
  getAccountOutputSchema,
  getAllAccountsOutputSchema,
  updateAccountOutputSchema,
  initAccountsTableOutputSchema,
  addLastPriceDataOutputSchema,
  getLastPricesDataOutputSchema,
};
