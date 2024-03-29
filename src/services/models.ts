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

export const transportNames: Record<ETransport, string> = {
  air: '空运',
  sea: '海运'
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
    rate: 5000,
    unitPrice: {
      sea: 50,
      air: 70,
    },
  },
  {
    country: "UK",
    rate: 5000,
    unitPrice: {
      sea: 60,
      air: 80,
    },
  },
  {
    country: "AU",
    rate: 5000,
    unitPrice: {
      sea: 30,
      air: 65,
    },
  },
];
