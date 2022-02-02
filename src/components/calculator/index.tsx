import { produce } from "immer";
import React, { createContext, useContext, useState } from "react";
import { calculate } from "../../services/calculator";
import { askFile } from "../../services/file";
import {
  defaultCountryData,
  defaultOrder,
  emptyProject,
  ETransport,
  ICountryShippingFeeData,
  IShippingOrder,
  IShippingProject,
} from "../../services/models";
import { loadCSV } from "../../services/profile";
import styles from "./styles.module.css";
interface IShippingCalculatorContext {
  order: IShippingOrder;
  countryData: ICountryShippingFeeData[];
  dispatch(mutation: (ctx: IShippingCalculatorContext) => void): void;
}

const Context = createContext<IShippingCalculatorContext>({
  order: defaultOrder(""),
  countryData: defaultCountryData(),
  dispatch() {
    throw new Error("Not implemented");
  },
});

const useService = () => {
  const [context, setContext] = useState<IShippingCalculatorContext>(() => {
    const countryData = defaultCountryData();
    return {
      order: defaultOrder(countryData[0]!.country),
      countryData,
      dispatch(mutation) {
        setContext(produce(mutation));
      },
    };
  });
  return context;
};

export const ShippingCalculator: React.FC = () => {
  const context = useService();
  return (
    <div className={styles.calculator}>
      <div className={styles["actions-header"]}>
        <button
          onClick={async () => {
            const data = loadCSV(await askFile());
            if (!data.length) {
              return;
            }
            context.dispatch((ctx) => {
              ctx.countryData = data;
              ctx.order.country = data[0].country;
            });
          }}
        >
          import csv
        </button>
        <label>transport</label>
        <select
          name="transport"
          title="transport"
          value={context.order.transport}
          onChange={(e) => {
            context.dispatch((ctx) => {
              // @ts-expect-error select value
              ctx.order.transport = e.target.value;
            });
          }}
        >
          {Object.values(ETransport).map((transport, i) => (
            <option key={i} value={transport}>
              {transport}
            </option>
          ))}
        </select>
        <label>country</label>
        <select
          name="country"
          title="country"
          value={context.order.country}
          onChange={(e) => {
            context.dispatch((ctx) => {
              ctx.order.country = e.target.value;
            });
          }}
        >
          {context.countryData.map((data, i) => (
            <option key={i} value={data.country}>
              {data.country}
            </option>
          ))}
        </select>
      </div>
      <div className={styles["input-header"]}>
        <label>length</label>
        <label>width</label>
        <label>height</label>
        <label>weight</label>
        <label>quantity</label>
      </div>
      <Context.Provider value={context}>
        {context.order.projects.map((project, i) => (
          <ProjectForm project={project} index={i} key={i} />
        ))}
      </Context.Provider>
      <div>
        {(() => {
          try {
            const value = calculate(context.order, context.countryData);
            return isNaN(value) ? "Error" : `total: ${value}`;
          } catch (error) {
            return "Error";
          }
        })()}
      </div>
    </div>
  );
};

interface IProjectFormProps {
  project: IShippingProject;
  index: number;
}

const ProjectForm: React.FC<IProjectFormProps> = React.memo(
  ({ project, index }) => {
    const context = useContext(Context);
    const createProjectInputProps = (field: keyof IShippingProject) => {
      const number = project[field];
      const commonProps: React.InputHTMLAttributes<HTMLInputElement> = {
        type: "number",
        name: field,
        min: "0",
        autoComplete: "off",
      };
      return {
        value: number.toString(),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const inputNumber = +e.target.value;
          if (isNaN(inputNumber)) {
            return;
          }
          context.dispatch((ctx) => {
            ctx.order.projects[index][field] = inputNumber;
          });
        },
        ...commonProps,
      };
    };
    const lengthProps = createProjectInputProps("length");
    const widthProps = createProjectInputProps("width");
    const heightProps = createProjectInputProps("height");
    const weightProps = createProjectInputProps("weight");
    const quantityProps = createProjectInputProps("quantity");
    const handleAddProject = () => {
      context.dispatch((ctx) => {
        ctx.order.projects.push(emptyProject());
      });
    };
    const handleRemoveProject = () => {
      context.dispatch((ctx) => {
        ctx.order.projects = ctx.order.projects.filter((_, i) => i !== index);
      });
    };
    const isLast = index + 1 === context.order.projects.length;
    return (
      <div className={styles["input-row"]}>
        <input {...lengthProps} />
        <input {...widthProps} />
        <input {...heightProps} />
        <input {...weightProps} />
        <input {...quantityProps} min="1" />
        <button
          type="button"
          onClick={isLast ? handleAddProject : handleRemoveProject}
        >
          {isLast ? "+" : "x"}
        </button>
      </div>
    );
  }
);
