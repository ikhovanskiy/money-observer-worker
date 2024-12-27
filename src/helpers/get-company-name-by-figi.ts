import { FIGI } from "src/enum";

const getInstrumentNameByFigi = (figi: string) => {
  return Object.entries(FIGI).find(([, value]) => {
    if (value === figi) return true;
    return false;
  })?.[0];
};

export { getInstrumentNameByFigi };
