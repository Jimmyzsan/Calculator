import { EErrors } from "./models";

declare global {
  interface Window {
    showOpenFilePicker(options?: {
      multiple?: boolean;
      excludeAcceptAllOption?: boolean;
      types?: {
        description?: string;
        accept?: Record<string, string[]>;
      }[];
    }): Promise<FileSystemFileHandle[]>;
  }
  interface FileSystemFileHandle {
    getFile(): Promise<File>;
  }
}

const getFileByNonStandardAPI = async (): Promise<string> => {
  try {
    const handles = await window.showOpenFilePicker({
      multiple: false,
      excludeAcceptAllOption: true,
      types: [
        {
          description: "csv file",
          accept: {
            "application/x-csv": [".csv"],
          },
        },
      ],
    });
    const handle = handles[0]!;
    const file = await handle.getFile();
    return await file.text();
  } catch (error) {
    if (error instanceof DOMException) {
      throw EErrors.OpenFileCanceled;
    }
    throw error;
  }
};

const getFileContentByInputElement = async () => {
  return await new Promise<string>((resolve, reject) => {
    const cleanUp = () => {
      input.removeEventListener("change", handleChange);
    };
    const fail = (message?: string) => {
      cleanUp();
      reject(message);
    };
    const finish = (text: string) => {
      cleanUp();
      resolve(text);
    };
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".csv");
    const handleChange = () => {
      if (input.files) {
        const file = input.files.item(0);
        if (file) {
          const reader = new FileReader();
          reader.addEventListener("loadend", () => {
            const currentResult = reader.result;
            if (typeof currentResult === "string") {
              finish(currentResult);
            } else {
              fail("Error occured when read file.");
            }
          });
          reader.readAsText(file);
        } else {
          fail("No file selected");
        }
      }
    };
    input.addEventListener("change", handleChange);
    input.click();
  });
};

export const askFile = async () =>
  typeof window.showOpenFilePicker === "function"
    ? await getFileByNonStandardAPI()
    : await getFileContentByInputElement();
