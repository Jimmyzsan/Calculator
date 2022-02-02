import { ICountryShippingFeeData } from "./models";

export const loadCSV = (text: string) =>
  text
    .split(/\r?\n/g)
    .slice(1)
    .reduce<ICountryShippingFeeData[]>((acc, line) => {
      const items = line.split(",");
      const country = items[0];
      if (!country) {
        return acc;
      }
      const nums = items.slice(1).map((i) => {
        const num = +i;
        return isNaN(num) ? 0 : num;
      });
      const [sea = 0, air = 0, rate = 0] = nums;
      acc.push({
        country,
        rate,
        unitPrice: { air, sea },
      });
      return acc;
    }, []);
