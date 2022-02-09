import { produce } from "immer";
import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { calculate, volumnM3 } from "../../services/calculator";
import { askFile } from "../../services/file";
import {
  defaultCountryData,
  defaultOrder,
  emptyProject,
  ETransport,
  EUnit,
  ICountryShippingFeeData,
  IShippingOrder,
  IShippingProject,
  transportNames,
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
      order: defaultOrder(""),
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
  const [calculateTimes, recalculate] = useReducer((n: number) => n + 1, 0);
  const lastCalculated = useMemo(() => {
    if (calculateTimes === 0) {
      return null;
    }
    try {
      const value = calculate(context.order, context.countryData);
      return `total 共计: ${value} RMB`;
    } catch (error) {
      return "Error 发生了错误";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateTimes]);
  const cannotCalculateHint =
    (!context.order.transport && "please select transport") ||
    (!context.order.country && "please select country") ||
    undefined;
  const cannotCalculate = !!cannotCalculateHint;
  return (
    <div className={styles.calculator}>
      <div className={styles.title}>Transportation Calculator 运费计算器</div>
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
          <br />
          导入 CSV
          <br />
        </button>
        <label htmlFor="transport">
          form of transport <br /> 交通方式{" "}
        </label>
        <select
          id="transport"
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
          <option value="">--select--</option>
          {Object.values(ETransport).map((transport, i) => (
            <option key={i} value={transport}>
              {transport} {transportNames[transport]}
            </option>
          ))}
        </select>
        <label htmlFor="country">
          country <br /> 国家
        </label>
        <select
          id="country"
          name="country"
          title="country"
          value={context.order.country}
          onChange={(e) => {
            context.dispatch((ctx) => {
              ctx.order.country = e.target.value;
            });
          }}
        >
          <option value="">--select--</option>
          {context.countryData.map((data, i) => (
            <option key={i} value={data.country}>
              {data.country}
            </option>
          ))}
        </select>
      </div>
      <div className={styles["input-header"]}>
        <label>
          length 长度
          <Unit type={EUnit.CM} />
        </label>
        <label>
          width 宽度
          <Unit type={EUnit.CM} />
        </label>
        <label>
          height 高度
          <Unit type={EUnit.CM} />
        </label>
        <label>
          weight 重量
          <Unit type={EUnit.KG} />
        </label>
        <label>
          volume 体积
          <Unit type={EUnit.M3} />
        </label>
        <label>quantity 数量</label>
      </div>
      <Context.Provider value={context}>
        {context.order.projects.map((project, i) => (
          <ProjectForm project={project} index={i} key={i} />
        ))}
      </Context.Provider>
      <div className={styles.footer}>
        <button
          title={cannotCalculateHint}
          disabled={cannotCalculate}
          onClick={recalculate}
        >
          calculate 计算
        </button>
        <span className={styles.result}>
          {cannotCalculateHint || lastCalculated}
        </span>
      </div>
    </div>
  );
};

interface IUnitProps {
  type: EUnit;
}

const Unit: React.FC<IUnitProps> = React.memo(({ type }) => (
  <strong className={styles.unit}>({type})</strong>
));

interface IProjectFormProps {
  project: IShippingProject;
  index: number;
}

const ProjectForm: React.FC<IProjectFormProps> = React.memo(
  ({ project, index }) => {
    const context = useContext(Context);
    type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
    const inputCommonProps: InputProps = {
      type: "number",
      min: "0",
      autoComplete: "off",
    };
    const createProjectInputProps = (
      field: keyof IShippingProject
    ): InputProps => {
      const number = project[field];
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
        ...inputCommonProps,
        name: field,
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
        <input {...inputCommonProps} disabled value={volumnM3(project)} />
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
