import { Pool } from "pg";
import fs from "fs";
import { Logger } from "src/logger";
import { Account } from "src/types";
import {
  getAccountOutputSchema,
  getAllAccountsOutputSchema,
  updateAccountOutputSchema,
  initAccountsTableOutputSchema,
  addLastPriceDataOutputSchema,
  getLastPricesDataOutputSchema,
} from "src/schemas/account-schema";

const {
  POSTGRESQL_PASSWORD,
  POSTGRESQL_PORT,
  POSTGRESQL_HOST,
  POSTGRESQL_DATABASE,
} = process.env;

const pool = new Pool({
  user: "i-khovanskiy",
  host: POSTGRESQL_HOST,
  database: POSTGRESQL_DATABASE,
  password: POSTGRESQL_PASSWORD,
  port: Number(POSTGRESQL_PORT),
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./RootCA.pem").toString(),
  },
});

class PG {
  static async getAccount(name: string): Promise<Account> {
    const result = await pool.query(
      `
      SELECT *
      FROM accounts
      WHERE accounts.name = $1
      `,
      [name]
    );

    const { account } = result.rows[0];

    return getAccountOutputSchema.parse(account);
  }

  static async getAllAccounts(): Promise<Account[]> {
    const result = await pool.query(
      `
      SELECT *
      FROM accounts
      `
    );

    const accounts = result.rows.map(({ account }) => account);

    return getAllAccountsOutputSchema.parse(accounts);
  }

  static async updateAccount(name: string, account: Account): Promise<Account> {
    Logger.log(`updateAccount ${name}`);
    const result = await pool.query(
      `
      UPDATE accounts  
      SET account = $1
      WHERE accounts.name = $2
      RETURNING *
      `,
      [account, name]
    );

    const updatedAccount = result.rows[0].account;

    return updateAccountOutputSchema.parse(updatedAccount);
  }
  static async initAccountsTable(
    name: string,
    defaultAccount: Account = { balance: 0 }
  ) {
    Logger.log(`init table ${name}`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        account JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`SELECT * FROM accounts WHERE name = $1`, [
      name,
    ]);

    if (result.rows.length === 0) {
      const insertResult = await pool.query(
        `
        INSERT INTO accounts (name, account)
        VALUES ($1, $2)
        RETURNING *
        `,
        [name, defaultAccount]
      );

      const newAccount = insertResult.rows[0].account;

      return initAccountsTableOutputSchema.parse(newAccount);
    }

    const existingAccount = result.rows[0].account;

    return initAccountsTableOutputSchema.parse(existingAccount);
  }

  static async addLastPriceData({
    instrumentName,
    price,
    timestamp,
  }: {
    instrumentName: string;
    price: number;
    timestamp: number;
  }) {
    Logger.log(`addLastPriceData ${instrumentName}, price: ${price}`);
    const result = await pool.query(
      `
      INSERT INTO last_prices_data (instrument_name, price, timestamp)
      VALUES($1, $2, $3)
      RETURNING *
      `,
      [instrumentName, price, timestamp]
    );

    const lastPrice = addLastPriceDataOutputSchema.parse(result.rows[0]);

    return {
      instrumentName: lastPrice.instrument_name,
      price: lastPrice.price,
      timestamp: lastPrice.timestamp,
    };
  }

  static async getLastPricesData({
    instrumentName,
    fromTimestamp,
  }: {
    instrumentName: string;
    fromTimestamp: number;
  }): Promise<
    {
      instrumentName: string;
      price: number;
      timestamp: number;
    }[]
  > {
    const result = await pool.query(
      `
      SELECT *
      FROM last_prices_data
      WHERE last_prices_data.instrument_name = $1 AND last_prices_data.timestamp > $2
      `,
      [instrumentName, fromTimestamp]
    );

    const pricesData = getLastPricesDataOutputSchema.parse(result.rows);

    return pricesData.map(({ timestamp, price, instrument_name }) => ({
      timestamp: Number(timestamp),
      price: Number(price),
      instrumentName: instrument_name,
    }));
  }
}

export { pool, PG };
