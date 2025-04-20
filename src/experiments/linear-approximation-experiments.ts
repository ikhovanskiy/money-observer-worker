import { minutesToMilliseconds } from "date-fns";
import { Experiment } from "src/controllers/experiment";
import { getFigiByInstrumentName } from "src/helpers/get-figi-by-company-name";
import { createLinearApproximation } from "src/helpers/linear-approximation";
import { PG } from "src/pg";

class LinearApproximationExperiment extends Experiment {
  minutes: number;
  aPlus: number;
  aMinus: number;
  avgCoef: number;

  constructor(
    experimentName: string,
    minutes: number,
    aPlus: number,
    aMinus: number,
    avgCoef: number
  ) {
    super(experimentName);
    this.minutes = minutes;
    this.aPlus = aPlus;
    this.aMinus = aMinus;
    this.avgCoef = avgCoef;
  }

  public processResponse = async (instrumentName: string) => {
    const lastPrices = await PG.getLastPricesData({
      instrumentName,
      fromTimestamp: Date.now() - minutesToMilliseconds(this.minutes),
    });
    const lastInstrumentPrice = lastPrices.at(-1)?.price;

    if (!lastInstrumentPrice) {
      return;
    }

    const uniquePointsMap = new Map();

    lastPrices.forEach(({ price, timestamp }) => {
      const point = {
        x: Number(Date.now() - timestamp),
        y: Number(price),
      };

      uniquePointsMap.set(point.x, point);
    });

    const uniquePoints = Array.from(uniquePointsMap.values());

    const linearApproximation = createLinearApproximation(uniquePoints);

    const aCoefficient = linearApproximation?.coefficients.a;

    if (this.shouldBuy(aCoefficient)) {
      const figi = getFigiByInstrumentName(instrumentName);

      if (figi) {
        this.buy(figi, lastInstrumentPrice);
      }
      return;
    }

    if (this.shouldSell(aCoefficient, instrumentName, lastInstrumentPrice)) {
      const figi = getFigiByInstrumentName(instrumentName);

      if (figi) {
        this.sell(figi, lastInstrumentPrice);
      }
    }
  };

  private shouldBuy(coefficient: number = 0) {
    return coefficient > this.aPlus;
  }

  private shouldSell(
    coefficient: number = 0,
    instrumentName: string,
    lastPrice: number
  ) {
    if (!this.account) {
      return false;
    }

    if (coefficient < this.aMinus) {
      return true;
    }

    const arrayBuy = this.account.instruments?.[instrumentName]?.buy ?? [];
    const arraySell = this.account.instruments?.[instrumentName]?.sell ?? [];

    const sumBuy = arrayBuy.reduce((a, b) => a + b, 0);
    const sumSell = arraySell.reduce((a, b) => a + b, 0);

    const avgSum =
      ((sumBuy - sumSell) / (arrayBuy.length - arraySell.length)) *
      this.avgCoef;

    return avgSum < lastPrice;
  }
}

class LinearApproximationExperiments {
  experiments: LinearApproximationExperiment[];
  constructor() {
    this.experiments = [
      new LinearApproximationExperiment(
        "linear_approximation_15min_0.01_-0.01_1.1",
        15,
        0.01,
        -0.01,
        1.1
      ),
      new LinearApproximationExperiment(
        "linear_approximation_60min_0.01_-0.01_1.1",
        60,
        0.01,
        -0.01,
        1.1
      ),
    ];
  }
  init() {
    this.experiments.forEach((experiment) => {
      experiment.init();
    });
  }
  public processResponse = async (instrumentName: string) => {
    this.experiments.forEach((experiment) => {
      experiment.processResponse(instrumentName);
    });
  };
}
export { LinearApproximationExperiments };
