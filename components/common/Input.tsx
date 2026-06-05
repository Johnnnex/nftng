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
  useMemo,
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
import { defaultCountries, parseCountry } from "react-international-phone";
import { Icon } from "@iconify/react";
import { cn } from "@/lib";

export type SelectOption = { value: string; label: string };

// ── Country data (built once at module load) ──────────────────────────────────

function flagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(ch.charCodeAt(0) + 127397));
}

type CountryOption = {
  value: string;
  label: string;
  dialCode: string;
  name: string;
  flag: string;
};

const COUNTRY_OPTIONS: CountryOption[] = defaultCountries.map((raw) => {
  const { iso2, dialCode, name } = parseCountry(raw);
  const flag = flagEmoji(iso2);
  return { value: iso2, label: `${flag} +${dialCode}`, dialCode, name, flag };
});

const DEFAULT_COUNTRY =
  COUNTRY_OPTIONS.find((c) => c.value === "ng") ?? COUNTRY_OPTIONS[0];


// ── Types ─────────────────────────────────────────────────────────────────────

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
  onChange?: (event: {
    target: { name?: string; value: string | string[] };
  }) => void;
  placeholder?: string;
  disabled?: boolean;
};

type NativeInputType = Exclude<
  ComponentPropsWithoutRef<"input">["type"],
  undefined
>;

type TextInputProps = BaseInputProps &
  Omit<ComponentPropsWithoutRef<"input">, "className" | "name" | "ref"> & {
    type?: Exclude<NativeInputType, "textarea" | "tel">;
  };

type RichTextInputProps = BaseInputProps & {
  type: "rich-text";
  value?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void;
};

type DateInputProps = BaseInputProps & {
  type: "date" | "datetime-local";
  value?: string | null;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
};

// tel — custom country dropdown (fixed position) + national number input
// onChange emits the full combined value: "+{dialCode}{number}" e.g. "+2348012345678"
type TelInputProps = BaseInputProps & {
  type: "tel";
  value?: string;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  /** ISO2 country to pre-select, lowercase. Defaults to "ng". */
  defaultCountry?: string;
};

export type InputProps =
  | TextInputProps
  | TextareaProps
  | SelectInputProps
  | RichTextInputProps
  | DateInputProps
  | TelInputProps;

// ── react-select custom components (shared) ───────────────────────────────────

const CustomOption: FC<
  OptionProps<SelectOption, boolean, GroupBase<SelectOption>>
> = (props) => {
  const { isSelected, label, data, options } = props;
  const isLast =
    (options[options.length - 1] as SelectOption)?.value === data?.value;
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
        {isSelected && (
          <Icon
            icon="lucide:check"
            color="#6EC93E"
            width="1rem"
            height="1rem"
          />
        )}
      </li>
    </components.Option>
  );
};

const CustomControl: FC<
  ControlProps<SelectOption, boolean, GroupBase<SelectOption>>
> = ({ children, ...props }) => (
  <components.Control {...props}>
    <div
      style={{
        padding: "0 0.1875rem 0 0.875rem",
        alignItems: "center",
        margin: 0,
        width: "100%",
        minWidth: 0,
        height: "100%",
        fontSize: ".875rem",
        display: "flex",
      }}
    >
      {children}
    </div>
  </components.Control>
);

const CustomMultiValueRemove = (
  props: MultiValueRemoveProps<SelectOption, boolean, GroupBase<SelectOption>>,
) => (
  <components.MultiValueRemove {...props}>
    <Icon
      icon="hugeicons:cancel-circle"
      color="#98A2B3"
      width=".875rem"
      height=".875rem"
    />
  </components.MultiValueRemove>
);

const CustomValueContainer: FC<
  ValueContainerProps<SelectOption, boolean, GroupBase<SelectOption>>
> = ({ children, ...props }) => {
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
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }

  return (
    <components.ValueContainer {...props}>
      {showEllipsis && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "#98A2B3",
            flexShrink: 0,
            userSelect: "none",
            paddingRight: "4px",
          }}
        >
          …
        </span>
      )}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "auto",
          overflowY: "hidden",
          flex: 1,
          minWidth: 0,
          alignItems: "center",
          scrollbarWidth: "none",
        }}
      >
        {children}
      </div>
    </components.ValueContainer>
  );
};

const ErrorDropdownIndicator: FC<
  DropdownIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>
> = (props) => (
  <components.DropdownIndicator {...props}>
    <Icon
      icon="hugeicons:information-circle"
      color="#F04438"
      width="1.125rem"
      height="1.125rem"
    />
  </components.DropdownIndicator>
);

const CustomDropdownIndicator: FC<
  DropdownIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>
> = (props) => (
  <components.DropdownIndicator {...props}>
    <Icon
      icon="hugeicons:arrow-up-01"
      color={props.isFocused ? "#6EC93E" : "#D0D5DD"}
      height="1.125rem"
      width="1.125rem"
      style={{
        transition: "all .3s",
        transform: !props.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
      }}
    />
  </components.DropdownIndicator>
);

// ── TelCountrySelect — fully custom, fixed-position dropdown ──────────────────

type TelCountrySelectProps = {
  selected: CountryOption;
  onChange: (c: CountryOption) => void;
  disabled?: boolean;
};

const TelCountrySelect: FC<TelCountrySelectProps> = ({
  selected,
  onChange,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COUNTRY_OPTIONS;
    return COUNTRY_OPTIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.value.includes(q),
    );
  }, [search]);

  const openDropdown = () => {
    if (disabled) return;
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setDropStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: 260,
      zIndex: 9999,
    });
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 40);
  };

  const closeDropdown = () => {
    setOpen(false);
    setSearch("");
  };

  // Outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (dropRef.current?.contains(e.target as Node)) return;
      closeDropdown();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="relative h-full shrink-0">
      {/* Trigger button */}
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={open ? closeDropdown : openDropdown}
        className={cn(
          "flex items-center gap-1.5 h-full pl-3 pr-2 w-32",
          "border-r border-[#E5E7EB] bg-transparent",
          "text-[.875rem] text-[#000000B2] cursor-pointer",
          "hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors",
          "focus:outline-none",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="text-[1rem] leading-none shrink-0">
          {selected.flag}
        </span>
        <span className="tabular-nums flex-1 text-left">
          +{selected.dialCode}
        </span>
        <Icon
          icon="hugeicons:arrow-up-01"
          className="w-[1.125rem] h-[1.125rem] text-[#D0D5DD] shrink-0"
          style={{
            transition: "transform .3s",
            transform: open ? "rotate(0deg)" : "rotate(180deg)",
          }}
        />
      </button>

      {/* Dropdown — rendered at fixed position to escape any overflow:hidden parent */}
      {open && (
        <div
          ref={dropRef}
          style={dropStyle}
          className="bg-white rounded-[0.5rem] border border-[#EAECF0] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] overflow-hidden"
        >
          {/* Search */}
          <div className="px-2.5 pt-2.5 pb-2">
            <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-[0.5rem] px-2.5 py-1.5 bg-white focus-within:border-[#6EC93E] transition-colors">
              <Icon
                icon="mynaui:search"
                className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0"
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country…"
                className="flex-1 min-w-0 border-none! bg-transparent outline-none text-[.8125rem] text-black placeholder:text-[#9CA3AF]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[#9CA3AF] hover:text-black transition-colors"
                >
                  <Icon icon="mdi:close" className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul className="overflow-y-auto max-h-52 px-1.5 pb-1.5">
            {filtered.length === 0 && (
              <li className="text-[.8125rem] text-[#9CA3AF] px-2 py-3 text-center">
                No countries found
              </li>
            )}
            {filtered.map((c, i) => {
              const isSelected = selected.value === c.value;
              const isLast = i === filtered.length - 1;
              return (
                <li key={c.value} className={isLast ? "" : "mb-0.75"}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c);
                      closeDropdown();
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-md px-2 py-[0.4375rem]",
                      "text-[.875rem] font-normal text-left cursor-pointer",
                      "transition-colors hover:bg-[#F9FAFB]",
                      isSelected && "bg-[#F9FAFB]",
                    )}
                  >
                    <span className="text-[1.125rem] leading-none shrink-0">
                      {c.flag}
                    </span>
                    <span className="flex-1 text-[#101828] truncate">
                      {c.name}
                    </span>
                    <span className="text-[#9CA3AF] text-[.8125rem] tabular-nums shrink-0">
                      +{c.dialCode}
                    </span>
                    {isSelected && (
                      <Icon
                        icon="lucide:check"
                        color="#6EC93E"
                        width=".875rem"
                        height=".875rem"
                        className="shrink-0"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

// ── TelInput ──────────────────────────────────────────────────────────────────

type TelInputRenderProps = {
  name: string;
  value?: string;
  onChange?: TelInputProps["onChange"];
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  defaultCountry: string;
  error?: string;
  className?: string;
};

function parseInitialTel(
  value: string | undefined,
  defaultIso2: string,
): { iso2: string; number: string } {
  if (!value || !value.startsWith("+"))
    return { iso2: defaultIso2, number: value ?? "" };
  const match = COUNTRY_OPTIONS.find((c) => value.startsWith(`+${c.dialCode}`));
  if (!match) return { iso2: defaultIso2, number: value };
  return { iso2: match.value, number: value.slice(match.dialCode.length + 1) };
}

const TelInput: FC<TelInputRenderProps> = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  defaultCountry,
  error,
  className,
}) => {
  const parsed = parseInitialTel(value, defaultCountry);
  const [country, setCountry] = useState<CountryOption>(
    COUNTRY_OPTIONS.find((c) => c.value === parsed.iso2) ?? DEFAULT_COUNTRY,
  );
  const [rawNumber, setRawNumber] = useState(parsed.number);

  const emit = (c: CountryOption, num: string) => {
    onChange?.({ target: { name, value: num ? `+${c.dialCode}${num}` : "" } });
  };

  const handleCountryChange = (c: CountryOption) => {
    setCountry(c);
    emit(c, rawNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawNumber(e.target.value);
    emit(country, e.target.value);
  };

  return (
    <div
      className={cn(
        "flex h-10 md:h-11 rounded-lg border bg-white overflow-hidden transition-colors",
        "focus-within:border-[#6EC93E]",
        error ? "border-[#FDA29B]" : "border-transparent",
        className,
      )}
    >
      <TelCountrySelect
        selected={country}
        onChange={handleCountryChange}
        disabled={disabled}
      />

      <input
        type="tel"
        name={name}
        value={rawNumber}
        onChange={handleNumberChange}
        onBlur={onBlur}
        placeholder={placeholder ?? "801 234 5678"}
        disabled={disabled}
        className={cn(
          "flex-1 min-w-0 bg-transparent outline-none",
          "px-3 h-full",
          "text-[.75rem] md:text-[.875rem] font-normal text-[#000000B2]",
          "placeholder:text-[#00000040] placeholder:font-light",
          disabled && "cursor-not-allowed opacity-50",
        )}
      />
    </div>
  );
};

// ── SSR stubs ─────────────────────────────────────────────────────────────────
const emptySubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

// ── Main Input component ──────────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const { className, label = null, name = "input", error } = props;
    const hydrated = useSyncExternalStore(emptySubscribe, getTrue, getFalse);

    // ── tel ───────────────────────────────────────────────────────────────────
    if (props.type === "tel") {
      const {
        name: telName,
        value,
        onChange,
        onBlur,
        placeholder,
        disabled,
        defaultCountry = "ng",
      } = props as TelInputProps;
      return (
        <div className="flex flex-col gap-2">
          {label && (
            <label
              className="font-normal text-[.875rem] text-black"
              htmlFor={telName ?? name}
            >
              {label}
            </label>
          )}
          <TelInput
            name={telName ?? name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            defaultCountry={defaultCountry}
            error={error}
            className={className}
          />
          {error && (
            <p className="text-[.8125rem] font-normal text-[#F04438]">
              {error}
            </p>
          )}
        </div>
      );
    }

    // ── date / datetime-local ─────────────────────────────────────────────────
    if (props.type === "date" || props.type === "datetime-local") {
      const {
        name: dtName,
        value,
        onChange,
        onBlur,
        error: dtErr,
        placeholder,
        disabled,
      } = props as DateInputProps;
      return (
        <div className="flex flex-col gap-2">
          {label && (
            <label className="font-normal text-[.875rem] text-black">
              {label}
            </label>
          )}
          <CustomDateTimePicker
            name={dtName ?? name}
            value={value ?? undefined}
            onChange={onChange}
            onBlur={onBlur as React.FocusEventHandler<HTMLInputElement>}
            error={dtErr}
            placeholder={placeholder}
            disabled={disabled}
          />
          {dtErr && (
            <p className="text-[.8125rem] font-normal text-[#F04438]">
              {dtErr}
            </p>
          )}
        </div>
      );
    }

    // ── rich-text ─────────────────────────────────────────────────────────────
    if (props.type === "rich-text") {
      const {
        name: rtName,
        value,
        onChange,
        onBlur,
        error: rtErr,
      } = props as RichTextInputProps;
      return (
        <div className="flex flex-col gap-2">
          {label && (
            <label className="font-normal text-[.875rem] text-black">
              {label}
            </label>
          )}
          <TipTap
            name={rtName ?? name}
            value={value}
            onChange={
              onChange as (e: {
                target: { name: string; value: string };
              }) => void
            }
            onBlur={onBlur}
            error={rtErr}
            richTextProps={{ image: { allowed: false, folder: "" } }}
          />
          {rtErr && (
            <p className="text-[.8125rem] font-normal text-[#F04438]">
              {rtErr}
            </p>
          )}
        </div>
      );
    }

    let field: ReactElement;

    // ── select / multi-select ─────────────────────────────────────────────────
    if (props.type === "select" || props.type === "multi-select") {
      const {
        type,
        selectOptions = [],
        value,
        onChange,
        placeholder,
        disabled,
      } = props as SelectInputProps;
      const isMulti = type === "multi-select";

      const normalizedValues: string[] = isMulti
        ? Array.isArray(value)
          ? (value as string[])
          : value
            ? String(value)
                .split(",")
                .map((v) => v.trim())
            : []
        : [];

      const selectedValue = isMulti
        ? (normalizedValues
            .map((v) => selectOptions.find((o) => o.value === v))
            .filter(Boolean) as SelectOption[])
        : (selectOptions.find((o) => o.value === value) ?? null);

      if (!hydrated) {
        field = (
          <div
            className={cn(
              "bg-white h-10 md:h-11 rounded-lg border flex items-center px-3.5",
              error ? "border-[#FDA29B]" : "border-[#D0D5DD]",
              className,
            )}
          >
            <span className="text-[.875rem] text-black/40 font-normal">
              {placeholder ?? "Select..."}
            </span>
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
                : ((selected as SelectOption | null)?.value ?? "");
              onChange?.({ target: { name, value: val } });
            }}
            closeMenuOnSelect={!isMulti}
            blurInputOnSelect={isMulti ? false : undefined}
            hideSelectedOptions={false}
            components={{
              Option: CustomOption,
              Control: CustomControl,
              DropdownIndicator: error
                ? ErrorDropdownIndicator
                : CustomDropdownIndicator,
              MultiValueRemove: CustomMultiValueRemove,
              ValueContainer: CustomValueContainer,
              ClearIndicator: null as unknown as ComponentType<
                ClearIndicatorProps<
                  SelectOption,
                  boolean,
                  GroupBase<SelectOption>
                >
              >,
            }}
            styles={{
              container: (base) => ({ ...base, overflow: "hidden" }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              valueContainer: (base) => ({
                ...base,
                padding: 0,
                flexWrap: "nowrap",
                overflow: "hidden",
                minWidth: 0,
              }),
              placeholder: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
                opacity: 0.4,
                fontWeight: 300,
                fontSize: ".875rem",
              }),
              singleValue: (base) => ({
                ...base,
                fontWeight: 400,
                color: "#000000B2",
                fontSize: ".875rem",
              }),
              indicatorSeparator: () => ({ display: "none" }),
              option: () => ({ padding: 0, margin: 0 }),
              multiValue: () => ({
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fff",
                flexShrink: 0,
                gap: "0.1875rem",
                width: "max-content",
                boxSizing: "border-box" as const,
                border: "1px solid #D0D5DD",
                padding: "0.1875rem 0.3125rem",
                borderRadius: "0.375rem",
                margin: 0,
                marginRight: "0.25rem",
              }),
              multiValueLabel: () => ({
                fontSize: ".8125rem",
                color: "#344054",
                fontWeight: 400,
                lineHeight: "1.25rem",
              }),
              multiValueRemove: () => ({}),
              menu: (base) => ({
                ...base,
                backgroundColor: "#fff",
                minHeight: 0,
                marginTop: "0.25rem",
                overflow: "auto",
                padding: "0.25rem 0.375rem",
                borderRadius: "0.5rem",
                border: error ? "1px solid #FDA29B" : "1px solid #EAECF0",
                boxShadow:
                  "0px 12px 16px -4px rgba(16,24,40,0.08), 0px 4px 6px -2px rgba(16,24,40,0.03)",
              }),
              control: (base, state) => ({
                ...base,
                outline: "none",
                width: "100%",
                borderColor: error
                  ? "#FDA29B"
                  : state.isFocused
                    ? "#6EC93E"
                    : "#D0D5DD",
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
      // ── textarea ──────────────────────────────────────────────────────────────
    } else if (props.type === "textarea") {
      const {
        type: _t,
        label: _l,
        name: _n,
        error: _e,
        className: _c,
        ...rest
      } = props as TextareaProps;
      void _t;
      void _l;
      void _n;
      void _e;
      void _c;
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
      // ── plain text inputs ─────────────────────────────────────────────────────
    } else {
      const {
        label: _l,
        name: _n,
        error: _e,
        className: _c,
        ...rest
      } = props as TextInputProps;
      void _l;
      void _n;
      void _e;
      void _c;
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
          <label
            className="font-normal text-[.875rem] text-black"
            htmlFor={name}
          >
            {label}
          </label>
        )}
        {field}
        {error && (
          <p className="text-[.8125rem] font-normal text-[#F04438]">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
