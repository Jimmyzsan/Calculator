import { EErrors, ICountryShippingFeeData, IShippingOrder } from "./models";

export const calculate = (
  order: IShippingOrder,
  data: ICountryShippingFeeData[]
) => {
  const countryData = data.find((item) => item.country === order.country);
  if (!countryData) {
    throw EErrors.UnknownCountry;
  }
  const { rate, unitPrice } = countryData;
  return order.projects.reduce((acc, project) => {
    const { length, width, height, weight, quantity } = project;
    const g = (length * width * height) / rate;
    const unit = unitPrice[order.transport];
    const basicPrice = Math.max(g, weight) * unit * quantity;
    const extraPrice = Math.max(length, width, height) > 120 ? 800 : 0;
    return acc + basicPrice + extraPrice;
  }, 0);
};
