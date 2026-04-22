import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cn } from "@/lib";

type BaseInputProps = {
  className?: string;
  name?: string;
  label?: string | null;
};

type TextareaProps = BaseInputProps &
  Omit<ComponentPropsWithoutRef<"textarea">, "className" | "name"> & {
    type: "textarea";
  };

type NativeInputType = Exclude<
  ComponentPropsWithoutRef<"input">["type"],
  undefined
>;

type TextInputProps = BaseInputProps &
  Omit<ComponentPropsWithoutRef<"input">, "className" | "name"> & {
    type?: Exclude<NativeInputType, "textarea">;
  };

type InputProps = TextInputProps | TextareaProps;

const Input = (props: InputProps) => {
  const { className, label = null, name = "input", ...elementProps } = props;
  let field: ReactElement;

  if (props.type === "textarea") {
    const { type, ...textareaProps } = elementProps as Omit<
      TextareaProps,
      "className" | "label" | "name"
    >;
    void type;
    field = (
      <textarea
        id={name}
        className={cn(
          "bg-white h-22 text-[.875rem] font-normal text-[#000000B2] outline-none p-[.875rem_.625rem] rounded-lg",
          className,
        )}
        {...textareaProps}
      />
    );
  } else {
    const inputProps = elementProps as Omit<
      TextInputProps,
      "className" | "label" | "name"
    >;
    const inputType = inputProps.type ?? "text";

    field = (
      <input
        id={name}
        type={inputType}
        className={cn(
          "bg-white h-11 text-[.875rem] font-normal text-[#000000B2] outline-none p-[.875rem_.625rem] rounded-lg",
          className,
        )}
        {...inputProps}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-normal text-[.875rem]" htmlFor={name}>
          {label}
        </label>
      )}
      {field}
    </div>
  );
};

export { Input };
