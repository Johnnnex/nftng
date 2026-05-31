"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactElement,
  type FC,
  type ComponentType,
  type Ref,
  type FocusEvent,
  forwardRef,
  useRef,
  useState,
  useEffect,
  useSyncExternalStore,
} from "react";
import { TipTap } from "./TipTap";
import { CustomDateTimePicker } from "./CustomDateTimePicker";
import Select, {
  type ControlProps,
  type DropdownIndicatorProps,
  type GroupBase,
  type MultiValueRemoveProps,
  type OptionProps,
  type ClearIndicatorProps,
  type ValueContainerProps,
  components,
} from "react-select";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";

export type SelectOption = { value: string; label: string };

type BaseInputProps = {
  className?: string;
  name?: string;
  label?: string | null;
  error?: string;
};

type TextareaProps = BaseInputProps &
  Omit<ComponentPropsWithoutRef<"textarea">, "className" | "name" | "ref"> & {
    type: "textarea";
  };

type SelectInputProps = BaseInputProps & {
  type: "select" | "multi-select";
  selectOptions?: SelectOption[];
  value?: string | string[] | null;
  onChange?: (event: { target: { name?: string; value: string | string[] } }) => void;
  placeholder?: string;
  disabled?: boolean;
};

type NativeInputType = Exclude<ComponentPropsWithoutRef<"input">["type"], undefined>;

type TextInputProps = BaseInputProps &
  Omit<ComponentPropsWithoutRef<"input">, "className" | "name" | "ref"> & {
    type?: Exclude<NativeInputType, "textarea">;
  };

// Rich-text via TipTap — images always disabled for admin forms
type RichTextInputProps = BaseInputProps & {
  type: "rich-text";
  value?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
};

// Date / datetime — renders CustomDateTimePicker
type DateInputProps = BaseInputProps & {
  type: "date" | "datetime-local";
  value?: string | null;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  placeholder?: string;
  disabled?: boolean;
};

export type InputProps = TextInputProps | TextareaProps | SelectInputProps | RichTextInputProps | DateInputProps;

// ── react-select custom components ───────────────────────────────────────────

const CustomOption: FC<OptionProps<SelectOption, boolean, GroupBase<SelectOption>>> = (props) => {
  const { isSelected, label, data, options } = props;
  const isLast = (options[options.length - 1] as SelectOption)?.value === data?.value;
  return (
    <components.Option {...props}>
      <li
        className={cn(
          "flex cursor-pointer items-center justify-between rounded-md p-2 text-[#101828] text-[.875rem] font-normal transition-colors duration-200 hover:bg-[#F9FAFB]",
          isSelected && "bg-[#F9FAFB]",
          !isLast && "mb-1",
        )}
      >
        {label}
        {isSelected && <Icon icon="lucide:check" color="#6EC93E" width="1rem" height="1rem" />}
      </li>
    </components.Option>
  );
};

const CustomControl: FC<ControlProps<SelectOption, boolean, GroupBase<SelectOption>>> = ({ children, ...props }) => (
  <components.Control {...props}>
    <div style={{ padding: "0 0.1875rem 0 0.875rem", alignItems: "center", margin: 0, width: "100%", minWidth: 0, height: "100%", fontSize: ".875rem", display: "flex" }}>
      {children}
    </div>
  </components.Control>
);

const CustomMultiValueRemove = (props: MultiValueRemoveProps<SelectOption, boolean, GroupBase<SelectOption>>) => (
  <components.MultiValueRemove {...props}>
    <Icon icon="hugeicons:cancel-circle" color="#98A2B3" width=".875rem" height=".875rem" />
  </components.MultiValueRemove>
);

const CustomValueContainer: FC<ValueContainerProps<SelectOption, boolean, GroupBase<SelectOption>>> = ({ children, ...props }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEllipsis, setShowEllipsis] = useState(false);
  const count = (props.getValue() as SelectOption[]).length;

  useEffect(() => {
    if (!props.isMulti) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const overflowing = el.scrollWidth > el.clientWidth;
      setShowEllipsis(overflowing);
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
  }, [count, props.isMulti]);

  if (!props.isMulti) {
    return <components.ValueContainer {...props}>{children}</components.ValueContainer>;
  }

  return (
    <components.ValueContainer {...props}>
      {showEllipsis && (
        <span style={{ fontSize: "0.75rem", color: "#98A2B3", flexShrink: 0, userSelect: "none", paddingRight: "4px" }}>
          …
        </span>
      )}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", overflowY: "hidden", flex: 1, minWidth: 0, alignItems: "center", scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </components.ValueContainer>
  );
};

const ErrorDropdownIndicator: FC<DropdownIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>> = (props) => (
  <components.DropdownIndicator {...props}>
    <Icon icon="hugeicons:information-circle" color="#F04438" width="1.125rem" height="1.125rem" />
  </components.DropdownIndicator>
);

const CustomDropdownIndicator: FC<DropdownIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>> = (props) => (
  <components.DropdownIndicator {...props}>
    <Icon
      icon="hugeicons:arrow-up-01"
      color={props.isFocused ? "#6EC93E" : "#D0D5DD"}
      height="1.125rem"
      width="1.125rem"
      style={{ transition: "all .3s", transform: !props.selectProps.menuIsOpen ? "rotate(180deg)" : undefined }}
    />
  </components.DropdownIndicator>
);

// Stable refs outside component to avoid identity changes
const emptySubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

// ── main component ────────────────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>((props, ref) => {
  const { className, label = null, name = "input", error } = props;

  // SSR-safe hydration detection without setState-in-effect
  const hydrated = useSyncExternalStore(emptySubscribe, getTrue, getFalse);

  let field: ReactElement;

  if (props.type === "date" || props.type === "datetime-local") {
    const { name: dtName, value, onChange, onBlur, error: dtErr, placeholder, disabled } = props as DateInputProps;
    return (
      <div className="flex flex-col gap-2">
        {label && <label className="font-normal text-[.875rem] text-black">{label}</label>}
        <CustomDateTimePicker
          name={dtName ?? name}
          value={value ?? undefined}
          onChange={onChange}
          onBlur={onBlur as React.FocusEventHandler<HTMLInputElement>}
          error={dtErr}
          placeholder={placeholder}
          disabled={disabled}
        />
        {dtErr && <p className="text-[.8125rem] font-normal text-[#F04438]">{dtErr}</p>}
      </div>
    );
  }

  if (props.type === "rich-text") {
    const { name: rtName, value, onChange, onBlur, error: rtErr } = props as RichTextInputProps;
    return (
      <div className="flex flex-col gap-2">
        {label && <label className="font-normal text-[.875rem] text-black">{label}</label>}
        <TipTap
          name={rtName ?? name}
          value={value}
          onChange={onChange as (e: { target: { name: string; value: string } }) => void}
          onBlur={onBlur}
          error={rtErr}
          richTextProps={{ image: { allowed: false, folder: "" } }}
        />
        {rtErr && <p className="text-[.8125rem] font-normal text-[#F04438]">{rtErr}</p>}
      </div>
    );
  }

  if (props.type === "select" || props.type === "multi-select") {
    const { type, selectOptions = [], value, onChange, placeholder, disabled } = props as SelectInputProps;
    const isMulti = type === "multi-select";

    const normalizedValues: string[] = isMulti
      ? Array.isArray(value)
        ? (value as string[])
        : value
          ? String(value).split(",").map((v) => v.trim())
          : []
      : [];

    const selectedValue = isMulti
      ? normalizedValues.map((v) => selectOptions.find((o) => o.value === v)).filter(Boolean) as SelectOption[]
      : selectOptions.find((o) => o.value === value) ?? null;

    if (!hydrated) {
      field = (
        <div
          className={cn(
            "bg-white h-10 md:h-11 rounded-lg border flex items-center px-3.5",
            error ? "border-[#FDA29B]" : "border-[#D0D5DD]",
            className,
          )}
        >
          <span className="text-[.875rem] text-black/40 font-normal">{placeholder ?? "Select..."}</span>
        </div>
      );
    } else {
      field = (
        <Select<SelectOption, boolean, GroupBase<SelectOption>>
          instanceId={`select-${name}`}
          isDisabled={!!disabled}
          isMulti={isMulti}
          options={selectOptions}
          value={selectedValue}
          menuPlacement="auto"
          menuPosition="fixed"
          menuPortalTarget={document.body}
          placeholder={placeholder ?? "Select..."}
          onChange={(selected) => {
            const val = Array.isArray(selected)
              ? (selected as SelectOption[]).map((o) => o.value)
              : (selected as SelectOption | null)?.value ?? "";
            onChange?.({ target: { name, value: val } });
          }}
          closeMenuOnSelect={!isMulti}
          blurInputOnSelect={isMulti ? false : undefined}
          hideSelectedOptions={false}
          components={{
            Option: CustomOption,
            Control: CustomControl,
            DropdownIndicator: error ? ErrorDropdownIndicator : CustomDropdownIndicator,
            MultiValueRemove: CustomMultiValueRemove,
            ValueContainer: CustomValueContainer,
            ClearIndicator: null as unknown as ComponentType<ClearIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>>,
          }}
          styles={{
            container: (base) => ({ ...base, overflow: "hidden" }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            valueContainer: (base) => ({ ...base, padding: 0, flexWrap: "nowrap", overflow: "hidden", minWidth: 0 }),
            placeholder: (base) => ({ ...base, margin: 0, padding: 0, opacity: 0.4, fontWeight: 300, fontSize: ".875rem" }),
            singleValue: (base) => ({ ...base, fontWeight: 400, color: "#000000B2", fontSize: ".875rem" }),
            indicatorSeparator: () => ({ display: "none" }),
            option: () => ({ padding: 0, margin: 0 }),
            multiValue: () => ({
              display: "flex", alignItems: "center", backgroundColor: "#fff",
              flexShrink: 0, gap: "0.1875rem", width: "max-content", boxSizing: "border-box" as const,
              border: "1px solid #D0D5DD", padding: "0.1875rem 0.3125rem",
              borderRadius: "0.375rem", margin: 0, marginRight: "0.25rem",
            }),
            multiValueLabel: () => ({ fontSize: ".8125rem", color: "#344054", fontWeight: 400, lineHeight: "1.25rem" }),
            multiValueRemove: () => ({}),
            menu: (base) => ({
              ...base, backgroundColor: "#fff", minHeight: 0, marginTop: "0.25rem",
              overflow: "auto", padding: "0.25rem 0.375rem", borderRadius: "0.5rem",
              border: error ? "1px solid #FDA29B" : "1px solid #EAECF0",
              boxShadow: "0px 12px 16px -4px rgba(16,24,40,0.08), 0px 4px 6px -2px rgba(16,24,40,0.03)",
            }),
            control: (base, state) => ({
              ...base,
              outline: "none",
              width: "100%",
              borderColor: error ? "#FDA29B" : state.isFocused ? "#6EC93E" : "#D0D5DD",
              minHeight: 0,
              height: "100%",
              cursor: "pointer",
              borderRadius: "0.5rem",
              overflow: "hidden",
              boxShadow: "none",
              "&:hover": { borderColor: error ? "#FDA29B" : "#6EC93E" },
            }),
          }}
          className={cn("bg-white h-10 md:h-11 rounded-lg w-full", className)}
        />
      );
    }
  } else if (props.type === "textarea") {
    // extract only textarea-safe props — base props already grabbed above
    const { type: _t, label: _l, name: _n, error: _e, className: _c, ...rest } = props as TextareaProps;
    void _t; void _l; void _n; void _e; void _c;
    field = (
      <textarea
        id={name}
        name={name}
        ref={ref as Ref<HTMLTextAreaElement>}
        className={cn(
          "bg-white h-22 text-[.875rem] font-normal text-[#000000B2] outline-none p-[.875rem_.625rem] rounded-lg border",
          error ? "border-[#FDA29B]" : "border-transparent",
          className,
        )}
        {...rest}
      />
    );
  } else {
    const { label: _l, name: _n, error: _e, className: _c, ...rest } = props as TextInputProps;
    void _l; void _n; void _e; void _c;
    const inputType = rest.type ?? "text";
    field = (
      <input
        id={name}
        name={name}
        type={inputType}
        ref={ref as Ref<HTMLInputElement>}
        className={cn(
          "bg-white h-10 md:h-11 text-[.75rem] md:text-[.875rem] font-normal text-[#000000B2] outline-none p-[.875rem_.625rem] rounded-lg border",
          error ? "border-[#FDA29B]" : "border-transparent",
          className,
        )}
        {...rest}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-normal text-[.875rem] text-black" htmlFor={name}>
          {label}
        </label>
      )}
      {field}
      {error && (
        <p className="text-[.8125rem] font-normal text-[#F04438]">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
