/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Input,
  SVGClient,
  Button,
  CheckBox,
  RegistrationSuccessModal,
} from "@/components";
import { registerSchema, type RegisterFormData } from "@/data";
import { FORM_FIELDS, REGISTRATION_EVENTS, type FieldConfig } from "@/data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterStore } from "@/store";

const Register = () => {
  const { submit } = useRegisterStore();
  const [showModal, setShowModal] = useState<boolean>(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      events: [],
      topics_of_interest: [],
      agree_to_terms: false,
    },
  });

  const getError = (name: keyof RegisterFormData): string | undefined => {
    const e = errors[name];
    if (!e) return undefined;
    if ("message" in e && typeof e.message === "string") return e.message;
    return undefined;
  };

  const onInvalid = (errs: FieldErrors<RegisterFormData>) => {
    if (errs.agree_to_terms) {
      toast.error(
        "Please agree to photography/video coverage and event updates to continue.",
      );
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await submit(data);
      setShowModal(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error ?? "Registration failed. Please try again.");
    }
  };

  const renderField = (field: FieldConfig) => {
    if (field.kind !== "text") {
      return (
        <Controller
          key={String(field.name)}
          name={field.name as keyof RegisterFormData}
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              label={field.label}
              type={field.kind}
              name={String(field.name)}
              selectOptions={field.options}
              value={value as string | string[]}
              onChange={(e: {
                target: { name?: string; value: string | string[] };
              }) => onChange(e.target.value)}
              placeholder={field.placeholder}
              error={getError(field.name)}
            />
          )}
        />
      );
    }

    return (
      <Input
        key={String(field.name)}
        label={field.label}
        type={field.type ?? "text"}
        placeholder={field.placeholder}
        error={getError(field.name)}
        className={getError(field.name) ? undefined : "border-[#D0D5DD]"}
        {...register(field.name as keyof RegisterFormData)}
      />
    );
  };

  return (
    <>
      {showModal && (
        <RegistrationSuccessModal
          onClose={() => {
            reset();
            setShowModal(false);
          }}
        />
      )}

      <section className="md:py-34 overflow-x-hidden py-22.25 sm:px-8 px-4">
        <div className="max-w-300 mx-auto relative">
          <div className="relative bg-[#F9F9F9] shadow-[0px_4px_40.1px_0px_rgba(0,0,0,0.1)] lg:overflow-hidden flex flex-col lg:flex-row lg:aspect-[1.43]">
            <figure className="lg:w-[38%] lg:rounded-none rounded-t-sm aspect-[1.404] lg:aspect-auto relative z-1 shadow-[0px_4px_40.1px_0px_rgba(0,0,0,0.1)] bg-center bg-cover bg-linear-to-b from-[#FFFFFF] to-[#56C8F2] bg-blend-overlay bg-[url(/images/reg-cover-sm.png)] lg:bg-[url(/images/reg-cover.png)] flex items-center justify-center">
              <SVGClient
                className="sm:block hidden"
                src="/svg/u-summer-logo-reg.svg"
              />
              <SVGClient
                className="sm:hidden"
                src="/svg/u-summer-logo-reg-sm.svg"
              />
              <SVGClient
                className="-bottom-30 lg:hidden hidden sm:block right-0 translate-x-1/4 absolute"
                src="/svg/axis-reg.svg"
              />
              <SVGClient
                className="-bottom-14.5 sm:hidden right-0 translate-x-1/4 absolute"
                src="/svg/axis-reg-sm.svg"
              />
            </figure>

            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="flex lg:flex-1 lg:min-h-0 flex-col bg-[#F9F9F9]"
            >
              <header className="py-10 bg-[#F9F9F9] shadow-[0px_0px_17px_20px_#FDFDFD] px-5.75 lg:px-12.75">
                <h1 className="font-medium text-[1.5rem] sm:text-[2.25rem] leading-8.25 sm:leading-14.5 text-black">
                  Registration Form
                </h1>
                <p className="font-thin text-[.75rem] sm:text-[1rem] text-black">
                  Complete the form to be a part of the experience
                </p>
              </header>

              <div className="lg:flex-1 lg:min-h-0 px-4 sm:px-7.25 lg:px-14 lg:overflow-y-auto">
                <div className="grid grid-cols-1 py-3.25 gap-5.25 md:max-w-130 lg:max-w-117.5">
                  {FORM_FIELDS.map(renderField)}

                  {/* Events */}
                  <Controller
                    name="events"
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <div>
                        <label className="block text-[.875rem] font-normal text-black mb-2">
                          Choose Event(s) you want to attend *
                        </label>
                        {error && (
                          <p className="text-[.8125rem] font-normal text-[#F04438] mb-2">
                            {error.message}
                          </p>
                        )}
                        <div className="flex gap-2 flex-col">
                          {REGISTRATION_EVENTS.map((item, index) => (
                            <div
                              className="p-3 bg-white rounded-sm flex items-center gap-4 sm:gap-6.5"
                              key={`__evt__${index}__`}
                            >
                              <figure className="sm:w-19.25 w-13.5 rounded-sm overflow-hidden aspect-[1.069]">
                                <img
                                  alt={`Ticket Image ${index + 1}`}
                                  className="h-full w-full object-cover"
                                  src={`/images/${item.image}`}
                                />
                              </figure>
                              <div className="flex-1 flex items-center justify-between">
                                <span className="text-black text-[0.6875rem] sm:text-[0.9375rem] leading-4 sm:leading-6 font-normal">
                                  {item.name}
                                </span>
                                <CheckBox
                                  value={(value ?? []).includes(item.id)}
                                  onChange={() => {
                                    const cur = value ?? [];
                                    onChange(
                                      cur.includes(item.id)
                                        ? cur.filter((e) => e !== item.id)
                                        : [...cur, item.id],
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  />

                  {/* Terms */}
                  <Controller
                    name="agree_to_terms"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <CheckBox
                        value={value}
                        onChange={onChange}
                        customLabel={
                          <span className="ml-2 text-[0.8125rem] font-normal text-[#000000B2] leading-5">
                            By registering, you agree to photography/video
                            coverage during the event and agree to receive event
                            updates from Unchain Summer powered by NFTNG.
                          </span>
                        }
                      />
                    )}
                  />

                  {/* Submit */}
                  <div className="pb-8">
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      Complete Registration
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <SVGClient
            className="-bottom-21 hidden lg:block right-0 translate-x-1/2 absolute"
            src="/svg/axis-reg.svg"
          />
        </div>
      </section>
    </>
  );
};

export default Register;
