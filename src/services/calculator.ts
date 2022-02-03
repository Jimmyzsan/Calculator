import {
  EErrors,
  ICountryShippingFeeData,
  IShippingOrder,
  IShippingProject,
} from "./models";

export const calculate = (
  order: IShippingOrder,
  data: ICountryShippingFeeData[]
) => {
  const countryData = data.find((item) => item.country === order.country);
  const { transport } = order;
  if (!transport) {
    throw EErrors.NoTransport;
    
  }
  if (!countryData) {
    throw EErrors.UnknownCountry;
  }
  const { rate, unitPrice } = countryData;
  return order.projects.reduce((acc, project) => {
    const { length, width, height, weight, quantity } = project;
    const g = volumn(project) / rate;
    const unit = unitPrice[transport];
    const basicPrice = Math.max(g, weight) * unit * quantity;
    const extraPrice = Math.max(length, width, height) > 120 ? 800 : 0;
    return acc + basicPrice + extraPrice;
  }, 0);
};
export const volumn = (project: IShippingProject) =>
  project.length * project.width * project.height;

export const volumnM3 = (project: IShippingProject) => 
  volumn(project) / 100 ** 3
