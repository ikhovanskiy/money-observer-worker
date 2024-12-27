import { FIGI } from "src/enum";

const getFigiByInstrumentName = (instrumentName: string) => {
  if (instrumentName in FIGI) {
    return FIGI[instrumentName as keyof typeof FIGI];
  }
  return undefined;
};

export { getFigiByInstrumentName };
