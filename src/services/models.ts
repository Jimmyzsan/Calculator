export interface ISelectItem {
  code: string;
  name: string;
}

export interface IShippingProject {
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
}

export enum ETransport {
  Sea = "sea",
  Air = "air",
}

export enum EErrors {
  UnknownCountry,
  NoTransport,
  OpenFileCanceled,
}


export enum EUnit {
  M3 = "m³",
  CM = "cm",
  KG = "kg"
}
export interface IShippingOrder {
  country: string;
  transport: ETransport | "";
  projects: IShippingProject[];
}

export interface ICountryShippingFeeData {
  country: string;
  rate: number;
  unitPrice: Record<ETransport, number>;
}

export const emptyProject = (): IShippingProject => ({
  height: 0,
  length: 0,
  quantity: 1,
  weight: 0,
  width: 0,
});
export const defaultOrder = (country: string): IShippingOrder => ({
  country,
  projects: [emptyProject()],
  transport: "",
});

export const defaultCountryData = (): ICountryShippingFeeData[] => [
  {
    country: "US",
    rate: 4500,
    unitPrice: {
      sea: 50,
      air: 100,
    },
  },
  {
    country: "UK",
    rate: 4500,
    unitPrice: {
      sea: 60,
      air: 90,
    },
  },
  {
    country: "AU",
    rate: 4500,
    unitPrice: {
      sea: 30,
      air: 85,
    },
  },
];
