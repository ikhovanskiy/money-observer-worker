import { Experiment } from "src/controllers/experiment";

import { PrepareLastPriceResponse } from "src/types";

class TestExperiment extends Experiment {
  public processResponse = async (data: PrepareLastPriceResponse) => {};
}

export { TestExperiment };
