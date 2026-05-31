"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { cn } from "@/lib";
import { useAuthStore } from "@/store";
import { Button, Input } from "@/components";
import { acceptInviteSchema, type AcceptInviteData, ACCEPT_INVITE_FIELDS, type AdminFormField } from "@/data";
import { poppins, satoshi } from "@/app/layout";

const BgShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 relative overflow-hidden">
    <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-240 h-120 rounded-full bg-[#6EC93E]/10 blur-[120px] pointer-events-none" />
    <div
      className="absolute inset-0 opacity-[0.06] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(#6EC93E 1px, transparent 1px), linear-gradient(90deg, #6EC93E 1px, transparent 1px)",
        backgroundSize: "4rem 4rem",
      }}
    />
    <div className="relative w-full max-w-md">{children}</div>
  </div>
);

const AcceptInviteContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { acceptInvite } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  const token = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: AcceptInviteData) => {
    setSubmitting(true);
    try {
      await acceptInvite({ token: data.token, password: data.password });
      toast.success("Welcome to NFTNG Admin!");
      router.replace("/admin");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error ?? "Failed to accept invite");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: AdminFormField) => {
    const err = errors[field.name as keyof AcceptInviteData]?.message;
    const show = showPass[field.name] ?? false;
    return (
      <div key={field.name} className="flex flex-col gap-1.5">
        <label className={cn(satoshi.className, "text-[0.875rem] font-medium text-[#374151]")}>
          {field.label}
        </label>
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder={field.placeholder}
            error={err}
            className={cn("pr-11!", err ? undefined : "border-[#D0D5DD]")}
            {...register(field.name as keyof AcceptInviteData)}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => ({ ...v, [field.name]: !v[field.name] }))}
            className="absolute right-3 top-5.5 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors z-10"
          >
            <Icon icon={show ? "solar:eye-closed-bold" : "solar:eye-bold"} className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  if (!token) {
    return (
      <BgShell>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center">
          <Icon icon="solar:danger-triangle-bold-duotone" className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className={cn(poppins.className, "text-[1rem] font-semibold text-[#111827]")}>
            Invalid invite link
          </p>
          <p className={cn(satoshi.className, "text-[0.875rem] text-[#9CA3AF] mt-1")}>
            This link is missing a token. Please check your email.
          </p>
        </div>
      </BgShell>
    );
  }

  return (
    <BgShell>
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-[#6EC93E] flex items-center justify-center">
          <Icon icon="solar:shield-bold-duotone" className="w-5 h-5 text-white" />
        </div>
        <span className={cn(poppins.className, "text-[#111827] font-semibold text-lg tracking-tight")}>
          NFTNG <span className="text-[#6EC93E]">Admin</span>
        </span>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="mb-8">
          <h1 className={cn(poppins.className, "text-[1.75rem] font-semibold text-[#111827] leading-tight")}>
            Set your password
          </h1>
          <p className={cn(satoshi.className, "text-[#6B7280] mt-1.5 text-[0.9375rem]")}>
            You&apos;ve been invited to NFTNG Admin. Set a password to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <input type="hidden" {...register("token")} />
          {ACCEPT_INVITE_FIELDS.map(renderField)}

          <Button
            type="submit"
            loading={submitting}
            className={cn(
              poppins.className,
              "mt-2 w-full h-11 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem] rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2",
            )}
          >
            Activate Account
          </Button>
        </form>
      </div>

      <p className={cn(satoshi.className, "text-center text-[#9CA3AF] text-[0.8125rem] mt-6")}>
        NFTNG Admin · Access restricted
      </p>
    </BgShell>
  );
};

const AcceptInvite = () => (
  <Suspense>
    <AcceptInviteContent />
  </Suspense>
);

export default AcceptInvite;
