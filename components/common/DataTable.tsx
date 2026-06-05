/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { TableVirtuoso } from "react-virtuoso";
import { CheckBox } from "./Checkbox";
import { debounce } from "@/lib";
import { satoshi } from "@/app/layout";
import { Icon } from "@iconify/react";

type thOptions = {
  title: string;
  customTableHead?: (value: any) => ReactNode;
  customTableBody?: (value: any) => ReactNode;
  minWidth?: number;
  width?: number;
  maxWidth?: number;
};

type metaDataOPtions = {
  endPage?: number;
  currentPage?: number;
  totalRecords?: number;
  onPageChange?: (skip: number) => void;
};

type searchOptions = {
  show?: boolean;
  placeholder?: string;
  onResolve?: (data: string | number) => void;
};

type filterOptions = {
  show?: boolean;
  avoid?: number[];
  mask?: Record<number, { value: any; mask: any }[]>;
};

type IDataTableProps = {
  columns: Array<string | thOptions>;
  data: Array<Array<any>>;
  pagination?: boolean;
  head?: boolean;
  metaData?: metaDataOPtions;
  search?: searchOptions;
  filter?: filterOptions;
  recordsPerPage?: number;
  isCheckable?: boolean;
  numberColName?: string;
  customEmptyState?: ReactNode;
  loading?: boolean;
  emptyStateProps?: {
    svg: string;
    title: string;
    text: string;
    cta?: { text: string; action: () => void };
  };
  shouldNotHaveBorder?: boolean;
  nonScrollable?: boolean;
  onCheckChange?: (e: any) => void;
};

const DataTable = ({
  columns,
  numberColName,
  onCheckChange = () => null,
  shouldNotHaveBorder = false,
  ...props
}: IDataTableProps) => {
  const [isBottom, setIsBottom] = useState<boolean>(false);
  const container = useRef<HTMLDivElement | null>(null);
  const [selectedCheckBoxes, setSelectedCheckedBoxes] = useState<Array<number>>(
    [],
  );
  const [filter, setFilter] = useState<{
    popover: boolean;
    selectedOptions: Record<number, { name: string; isOpen: boolean }>;
    filters: Record<number, (number | string)[]>;
  }>({
    popover: false,
    selectedOptions: {},
    filters: {},
  });

  const popoverRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const triggerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const handleSearch = useCallback(
    debounce((value: string) => {
      props?.search?.onResolve?.(value);
    }, 500),
    [],
  );

  const filterColumns = (data: any[][]) => {
    return data?.map((row) => {
      return row?.filter((_, columnIndex) => {
        const filterValues = filter.filters[columnIndex];
        if (!filterValues || !filterValues.length) return true;

        const columnValue = row[columnIndex];
        return filterValues.includes(columnValue);
      });
    });
  };

  const handleScroll = () => {
    if (container.current) {
      const { scrollTop, scrollHeight, clientHeight } = container?.current;
      setIsBottom(scrollTop + clientHeight >= scrollHeight);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    popoverRefs.current.forEach((popoverRef, index) => {
      const triggerRef = triggerRefs.current.get(index);
      if (
        popoverRef &&
        !popoverRef.contains(event.target as Node) &&
        triggerRef &&
        !triggerRef.contains(event.target as Node)
      ) {
        if (index === 1001)
          setFilter((prev) => ({
            ...prev,
            popover: false,
          }));
        else
          setFilter((prev) => ({
            ...prev,
            selectedOptions: {
              ...prev.selectedOptions,
              [index]: {
                ...prev.selectedOptions[+index],
                isOpen: false,
              },
            },
          }));
      }
    });
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const formattedData = filterColumns(props?.data) || [];

  useEffect(() => {
    handleScroll();
    const parent = container.current;
    if (parent) {
      parent.addEventListener("scroll", handleScroll);
      return () => parent.removeEventListener("scroll", handleScroll);
    }
  }, [JSON.stringify(formattedData)]);

  useEffect(() => {
    setFilter({
      popover: false,
      selectedOptions: {},
      filters: {},
    });
  }, [JSON.stringify(columns)]);

  useEffect(() => {
    const selectedData = formattedData.filter((_, index) =>
      selectedCheckBoxes.includes(index),
    );
    onCheckChange(selectedData);
  }, [JSON.stringify(selectedCheckBoxes)]); // eslint-disable-line react-hooks/exhaustive-deps

  const Table = React.forwardRef((restProps: any, ref) => (
    <table
      style={{
        borderCollapse: "collapse",
        overflow: "auto",
        height: "100%",
      }}
      ref={ref}
      {...restProps}
    >
      <thead className="sticky top-0 z-2! h-fit bg-white!">
        <tr className="h-11.5 min-h-11.5 overflow-hidden">
          {props?.isCheckable ? (
            <th
              align="left"
              className="px-6 py-2 text-xs font-bold leading-[120%] text-[#344054]"
            >
              <CheckBox
                value={
                  selectedCheckBoxes.length === formattedData.length &&
                  formattedData.length > 0
                }
                onChange={(checked) => {
                  if (checked) {
                    setSelectedCheckedBoxes(
                      Array.from({ length: formattedData.length }, (_, i) => i),
                    );
                  } else {
                    setSelectedCheckedBoxes([]);
                  }
                }}
              />
            </th>
          ) : (
            <th
              className={`${satoshi.className} px-6 py-2 text-left text-xs font-medium leading-4 text-[#475467]`}
            >
              {numberColName ? numberColName : "S/N"}
            </th>
          )}
          {columns?.map((e, index) => {
            if (typeof e !== "string") {
              const { customTableHead }: thOptions = e;
              if (!!customTableHead) {
                return (
                  <th
                    align="left"
                    className="px-6 py-2 text-xs font-medium leading-4 text-[#475467]"
                    key={`__head-${e.title + index}`}
                  >
                    {e.customTableHead && e.customTableHead(e.title)}
                  </th>
                );
              }
              return (
                <th
                  align="left"
                  className="px-6 py-2 text-xs font-medium leading-4 text-[#475467]"
                  key={`__head-${e.title + index}`}
                >
                  {e.title}
                </th>
              );
            } else {
              return (
                <th
                  align="left"
                  className="px-6 py-2 text-xs font-medium leading-4 text-[#475467]"
                  key={`__head-${e + index}`}
                >
                  {e}
                </th>
              );
            }
          })}
        </tr>
      </thead>
      {restProps?.children}
    </table>
  ));

  Table.displayName = "Table";

  const TableRow = React.forwardRef((restProps: any, ref) => {
    const row_index = restProps["data-index"];
    return (
      <tr
        ref={ref}
        key={1}
        {...restProps}
        data-index={restProps["data-index"]}
        style={{
          backgroundColor: restProps["data-index"] % 2 ? "#FCFCFD" : "#fff",
          ...restProps?.style,
        }}
      >
        {props?.isCheckable ? (
          <td
            className={`h-24 px-6 py-2 text-sm font-normal leading-[120%] ${
              row_index === formattedData?.length - 1 && isBottom
                ? "last-row"
                : ""
            }`}
          >
            <CheckBox
              value={selectedCheckBoxes.includes(row_index)}
              onChange={(checked) => {
                if (!checked) {
                  setSelectedCheckedBoxes((prev) =>
                    prev.filter((i) => i !== row_index),
                  );
                } else {
                  setSelectedCheckedBoxes((prev) => [...prev, row_index]);
                }
              }}
            />
          </td>
        ) : (
          <td
            className={`${
              satoshi.className
            } h-24 px-6 py-2 text-sm font-medium leading-[18.9px] text-[#A7AEB1] ${
              row_index === formattedData.length - 1 && isBottom
                ? "last-row"
                : ""
            }`}
          >
            {row_index + 1}
          </td>
        )}
        {columns?.map((e, index) => {
          const data = restProps?.item[index];
          if (typeof e === "string") {
            return (
              <td
                className={`h-24 px-6 py-2 text-sm font-normal leading-[120%] ${
                  row_index === formattedData.length - 1 && isBottom
                    ? "last-row"
                    : ""
                }`}
                key={"__table_column_data" + index + row_index}
              >
                {data}
              </td>
            );
          } else {
            const { customTableBody, minWidth, width, maxWidth }: thOptions = e;
            if (!!customTableBody) {
              return (
                <td
                  className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${
                    row_index === formattedData.length - 1 && isBottom
                      ? "last-row"
                      : ""
                  }`}
                  style={{
                    minWidth,
                    maxWidth,
                    width,
                  }}
                  key={"__table_column_data" + index + row_index}
                >
                  {customTableBody!(data)}
                </td>
              );
            }
            return (
              <td
                className={`h-24 px-6 py-2 text-sm font-normal leading-[120%] ${
                  row_index === formattedData.length - 1 && isBottom
                    ? "last-row"
                    : ""
                }`}
                key={"__table_column_data" + index + row_index}
              >
                {data}
              </td>
            );
          }
        })}
      </tr>
    );
  });

  TableRow.displayName = "TableBody";

  const TableBody = React.forwardRef((restProps: any, ref) => (
    <tbody ref={ref} {...restProps}>
      {props.loading ? (
        <tr className="h-fit w-full bg-white">
          <td
            colSpan={columns.length + 1}
            className="last-row"
            height={`620px`}
          >
            <div className="flex h-full w-full flex-col overflow-hidden">
              {Array.from({ length: 10 }, (_, index) => (
                <div
                  key={`pulse__child__${index}`}
                  className={`min-h-[6em] ${
                    index % 2 === 0
                      ? "animate-pulse bg-[#f5f5f9b8]"
                      : "bg-white"
                  }`}
                />
              ))}
            </div>
          </td>
        </tr>
      ) : !formattedData.length ? (
        <tr className="h-fit w-full bg-white">
          <td
            colSpan={columns.length + 1}
            className="last-row mx-auto"
            height={`500px`}
          >
            {!!props?.customEmptyState ? (
              props.customEmptyState
            ) : (
              <div className="mx-auto flex h-full max-w-120.75 flex-col items-center justify-center bg-transparent">
                <Icon
                  className="w-15 h-15"
                  icon={
                    props?.emptyStateProps?.svg || "hugeicons:shopping-cart-02"
                  }
                />
                <h4 className="mb-3 text-center text-[1.75rem] font-medium leading-8.5 text-black">
                  {props?.emptyStateProps?.title || "No Data"}
                </h4>
                <p className="mb-6 text-center text-base font-normal leading-6">
                  {props?.emptyStateProps?.text || "No data available"}
                </p>
              </div>
            )}
          </td>
        </tr>
      ) : (
        restProps?.children
      )}
    </tbody>
  ));

  TableBody.displayName = "TableBody";

  return (
    <section
      className={`flex h-full flex-1 flex-col overflow-hidden ${
        shouldNotHaveBorder ? "" : "rounded-2xl border border-[#E4E7EC]"
      }`}
    >
      {props?.head && (
        <div className="relative mb-3 flex items-center justify-between p-4">
          {props?.search?.show ? (
            <div className="relative h-fit w-fit">
              <input
                onChange={(e) => {
                  const value = e.target.value;
                  handleSearch(value);
                }}
                placeholder={
                  props?.search?.placeholder || "Searching for something?"
                }
                type="text"
                className="w-[20rem] rounded-lg border border-[#D0D5DD] py-2.5 pl-[2.4rem] pr-3.5 text-sm font-normal leading-4 text-[#667085] outline-none shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
              />
              <div className="absolute top-0 ml-3.5 flex h-full items-center justify-center">
                <Icon
                  icon="solar:magnifer-bold"
                  className="w-4 h-4 text-[#667085]"
                />
              </div>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            {props?.filter?.show && (
              <div className="flex items-center gap-2">
                {Object.entries(filter.selectedOptions).map(
                  ([filterId, filterOption], index) => (
                    <div
                      className="relative"
                      key={`filter-option__${filterOption.name}__${index}`}
                    >
                      <button
                        ref={(el) => {
                          if (el) triggerRefs.current.set(+filterId, el);
                          else triggerRefs.current.delete(+filterId);
                        }}
                        className="flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-4 py-2.5 text-sm font-bold leading-[18.9px] text-[#344054]"
                        onClick={() =>
                          setFilter((prev) => ({
                            ...prev,
                            selectedOptions: {
                              ...prev.selectedOptions,
                              [filterId]: {
                                ...prev.selectedOptions[+filterId],
                                isOpen: !prev.selectedOptions[+filterId].isOpen,
                              },
                            },
                          }))
                        }
                      >
                        <Icon
                          icon="solar:alt-arrow-down-bold"
                          className="w-4 h-4 text-[#667185] transition-transform"
                          style={{
                            transform: filterOption.isOpen
                              ? "rotate(180deg)"
                              : "",
                          }}
                        />
                        {filterOption.name}
                      </button>
                      {filterOption.isOpen && (
                        <div
                          ref={(el) => {
                            if (el) popoverRefs.current.set(+filterId, el);
                            else popoverRefs.current.delete(+filterId);
                          }}
                          className="absolute left-0 top-12 z-2! min-w-60 rounded-lg border bg-white px-2 py-3 shadow-sm"
                        >
                          <div className="flex flex-col items-start gap-1">
                            {(() => {
                              const filteredOptions = props?.data
                                ?.map((innerArray) => innerArray[+filterId])
                                ?.filter(
                                  (entry, i, arr) =>
                                    entry !== undefined &&
                                    !Array.isArray(entry) &&
                                    typeof entry !== "object" &&
                                    entry !== null &&
                                    arr.findIndex((el) => el === entry) === i,
                                );

                              if (
                                !filteredOptions ||
                                filteredOptions.length === 0
                              ) {
                                return (
                                  <span className="w-full text-center text-sm text-[#6b7280]">
                                    No data
                                  </span>
                                );
                              }

                              return filteredOptions.map((option, index) => (
                                <button
                                  onClick={() =>
                                    setFilter((prev) => {
                                      const currentFilter =
                                        prev.filters[+filterId] || [];

                                      const isSelected =
                                        currentFilter.includes(option);
                                      const updatedFilters = isSelected
                                        ? {
                                            ...prev.filters,
                                            [+filterId]: currentFilter.filter(
                                              (item) => item !== option,
                                            ),
                                          }
                                        : {
                                            ...prev.filters,
                                            [+filterId]: [
                                              ...currentFilter,
                                              option,
                                            ],
                                          };

                                      return {
                                        ...prev,
                                        filters: updatedFilters,
                                      };
                                    })
                                  }
                                  className="flex w-full items-center justify-between rounded bg-white px-2 py-2.5 text-left text-sm text-[#101828] transition-all duration-[.4s] hover:bg-[#00000015]"
                                  key={`option__${option}__${index}`}
                                >
                                  {!!props?.filter?.mask?.[+filterId]
                                    ? props?.filter?.mask?.[+filterId]?.find(
                                        (maskedItem) =>
                                          maskedItem.value == option,
                                      )?.mask
                                    : option}
                                  {filter.filters[+filterId]?.includes(
                                    option,
                                  ) && (
                                    <Icon
                                      icon="solar:check-circle-bold"
                                      className="w-4 h-4 text-[#6EC93E]"
                                    />
                                  )}
                                </button>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                )}
                {(!!Object.values(filter.selectedOptions).length ||
                  !!Object.values(filter.filters).length) && (
                  <button
                    onClick={() =>
                      setFilter((prev) => ({
                        ...prev,
                        filters: {},
                        selectedOptions: {},
                      }))
                    }
                    className="rounded-lg border border-[#D0D5DD] p-1"
                  >
                    <Icon
                      icon="solar:close-circle-bold"
                      className="w-4 h-4 text-[#667185]"
                    />
                  </button>
                )}
                <button
                  ref={(el) => {
                    if (el) triggerRefs.current.set(1001, el);
                    else triggerRefs.current.delete(1001);
                  }}
                  className="flex items-center gap-2 border-none px-4 py-2.5 text-sm font-bold leading-[18.9px] text-[#344054] transition-all duration-[.4s] hover:text-[#6EC93E]"
                  onClick={() =>
                    setFilter((prev) => ({ ...prev, popover: !prev.popover }))
                  }
                >
                  <Icon icon="solar:filter-bold-duotone" className="w-4 h-4" />
                  Filter
                </button>
              </div>
            )}
          </div>
          {props?.filter?.show && filter.popover && (
            <div
              ref={(el) => {
                if (el) popoverRefs.current.set(1001, el);
                else popoverRefs.current.delete(1001);
              }}
              className="absolute right-4 top-16 z-300 min-w-60 rounded-lg border bg-white px-2 py-3 shadow-sm"
            >
              <h4 className="border-b text-xs text-[#101828]">Filter By</h4>
              <div className="mt-2 flex flex-col items-start gap-1">
                {columns?.map((e, index) => {
                  if (props?.filter?.avoid?.includes(index)) return;
                  let option;
                  if (typeof e !== "string") {
                    option = e?.title;
                  } else {
                    option = e;
                  }

                  return (
                    <button
                      onClick={() =>
                        setFilter((prev) => {
                          const isSelected = !!prev.selectedOptions[index];

                          const updatedOptions = isSelected
                            ? Object.fromEntries(
                                Object.entries(prev.selectedOptions).filter(
                                  ([key]) => +key !== index,
                                ),
                              )
                            : {
                                ...prev.selectedOptions,
                                [index]: { name: option, isOpen: false },
                              };

                          const updatedFilters = isSelected
                            ? Object.fromEntries(
                                Object.entries(prev.filters).filter(
                                  ([key]) => +key !== index,
                                ),
                              )
                            : prev.filters;

                          return {
                            ...prev,
                            selectedOptions: updatedOptions,
                            filters: updatedFilters,
                          };
                        })
                      }
                      className="flex w-full items-center justify-between rounded bg-white px-2 py-2.5 text-left text-sm text-[#101828] transition-all duration-[.4s] hover:bg-[#00000015]"
                      key={`option__${option}__${index}`}
                    >
                      {option}
                      {filter.selectedOptions[index] && (
                        <Icon
                          icon="solar:check-circle-bold"
                          className="w-4 h-4 text-[#6EC93E]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <div
        ref={container}
        className={`relative max-h-full overflow-auto ${
          shouldNotHaveBorder ? "" : "rounded-lg"
        }`}
        style={
          {
            "--tw-border-opacity": 1,
          } as any
        }
      >
        <style jsx>{`
          div :global(table) {
            width: 100%;
            height: fit-content;
          }
          div :global(th:after) {
            bottom: -1px;
            width: 100%;
            left: 0;
            position: absolute;
            content: "";
            border-bottom: 1px solid #f1f1f1 !important;
          }
          div :global(.last-row) {
            border-bottom: none !important;
          }
          div :global(thead) {
            background-color: #fff;
            position: sticky;
            z-index: 200;
            top: 0;
            height: fit-content;
          }
        `}</style>
        <TableVirtuoso
          data={props?.data}
          style={{
            height: props?.loading
              ? "700px"
              : props?.data.length
                ? props?.nonScrollable
                  ? `${(99 * props?.data.length + 45) / 16}rem`
                  : `${
                      (99 *
                        (props?.data.length > 10 ? 10 : props?.data.length) +
                        47) /
                      16
                    }rem`
                : `550px`,
            width: "100%",
          }}
          components={{
            Table: Table as any,
            TableBody: TableBody as any,
            TableRow: TableRow as any,
          }}
          increaseViewportBy={{ bottom: 500, top: 500 }}
          fixedItemHeight={67}
          itemContent={(row_index: number, row_data: any) => (
            <>
              {props?.isCheckable ? (
                <td
                  className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${
                    row_index === props?.data.length - 1 && isBottom
                      ? "last-row"
                      : ""
                  }`}
                >
                  <CheckBox
                    value={selectedCheckBoxes.includes(row_index)}
                    onChange={(checked) => {
                      if (!checked) {
                        setSelectedCheckedBoxes((prev) =>
                          prev.filter((i) => i !== row_index),
                        );
                      } else {
                        setSelectedCheckedBoxes((prev) => [...prev, row_index]);
                      }
                    }}
                  />
                </td>
              ) : (
                <td
                  className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${
                    row_index === props?.data.length - 1 && isBottom
                      ? "last-row"
                      : ""
                  }`}
                >
                  {row_index + 1}
                </td>
              )}
              {columns?.map((e, index) => {
                const data = row_data[index];
                if (typeof e === "string") {
                  return (
                    <td
                      className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${
                        row_index === props?.data.length - 1 && isBottom
                          ? "last-row"
                          : ""
                      }`}
                      key={"__table_column_data" + index + row_index}
                    >
                      {data}
                    </td>
                  );
                } else {
                  const {
                    customTableBody,
                    minWidth,
                    width,
                    maxWidth,
                  }: thOptions = e;
                  if (!!customTableBody) {
                    return (
                      <td
                        className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${
                          row_index === props?.data.length - 1 && isBottom
                            ? "last-row"
                            : ""
                        }`}
                        style={{
                          minWidth,
                          maxWidth,
                          width,
                        }}
                        key={"__table_column_data" + index + row_index}
                      >
                        {customTableBody!(data)}
                      </td>
                    );
                  }
                  return (
                    <td
                      className={`h-24 px-6 py-4 text-sm font-normal leading-[120%] ${
                        row_index === props?.data.length - 1 && isBottom
                          ? "last-row"
                          : ""
                      }`}
                      key={"__table_column_data" + index + row_index}
                    >
                      {data}
                    </td>
                  );
                }
              })}
            </>
          )}
        />
        {props?.pagination && (
          <section
            className="sticky transition-all duration-200"
            style={{
              bottom: isBottom ? "0px" : "12px",
            }}
          >
            <div
              className={`m-auto flex min-w-fit flex-row items-center justify-between border border-[#EAECF0] px-4 py-3 transition-all duration-200 ${
                isBottom
                  ? "w-full rounded-b-lg border-b-0 border-l-0 border-r-0 border-t bg-white"
                  : "w-0 rounded-lg bg-[#FFFFFFEE]"
              }`}
            >
              {props?.loading ? (
                <div className="animate-pulse h-3.75 w-50 rounded-[10px] bg-[#f5f5f9]" />
              ) : (
                <div
                  className={`overflow-hidden text-sm font-semibold leading-[142.857%] text-[#202224] opacity-60 transition-all duration-200 ${
                    isBottom ? "block" : "hidden"
                  }`}
                >
                  Showing {props?.metaData?.currentPage || 1}-
                  {props?.metaData?.endPage || 1} of{" "}
                  {props?.metaData?.totalRecords || 1}
                </div>
              )}
              <div className="flex items-center gap-5.5">
                <button
                  onClick={() =>
                    props?.metaData?.onPageChange?.(
                      Math.max(
                        0,
                        (props?.metaData?.currentPage || 0) - 50 - 1,
                      ) || 0,
                    )
                  }
                  disabled={
                    props?.loading || props?.metaData?.currentPage === 1
                  }
                  className="min-h-0 min-w-0 rounded-lg border border-[#D0D5DD] p-2 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:cursor-not-allowed"
                >
                  <Icon
                    icon="solar:alt-arrow-left-bold"
                    className="w-5 h-5"
                    style={{
                      color:
                        props?.loading || props?.metaData?.currentPage === 1
                          ? "#34405490"
                          : "#344054",
                    }}
                  />
                </button>
                <button
                  onClick={() =>
                    props?.metaData?.onPageChange?.(
                      props?.metaData?.endPage || 1,
                    )
                  }
                  disabled={
                    props.loading ||
                    (props?.metaData?.endPage ?? 0) >= (props?.metaData?.totalRecords ?? 0)
                  }
                  className="disabled:cursor-not-allowed"
                  style={{
                    padding: ".5rem",
                    minHeight: 0,
                    minWidth: 0,
                    border: "1px solid #D0D5DD",
                    boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                    borderRadius: ".5rem",
                  }}
                >
                  <Icon
                    icon="solar:alt-arrow-right-bold"
                    className="w-5 h-5"
                    style={{
                      color:
                        props.loading ||
                        (props?.metaData?.endPage ?? 0) >= (props?.metaData?.totalRecords ?? 0)
                          ? "#34405490"
                          : "#344054",
                    }}
                  />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </section>
  );
};

const Table = memo(DataTable);

export { Table };
