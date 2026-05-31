"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Button, Input } from "@/components";
import { poppins, satoshi } from "@/app/layout";
import { cn } from "@/lib";
import { adminLoginSchema, type AdminLoginFormData } from "@/data";
import { useAuthStore } from "@/store";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({ resolver: zodResolver(adminLoginSchema) });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      await login(data);
      router.replace("/admin");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr?.response?.data?.error ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle green glow */}
      <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-240 h-120 rounded-full bg-[#6EC93E]/10 blur-[120px] pointer-events-none" />

      {/* Checker grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#6EC93E 1px, transparent 1px), linear-gradient(90deg, #6EC93E 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#6EC93E] flex items-center justify-center">
            <Icon
              icon="solar:shield-bold-duotone"
              className="w-5 h-5 text-white"
            />
          </div>
          <span
            className={cn(
              poppins.className,
              "text-[#111827] font-semibold text-lg tracking-tight",
            )}
          >
            NFTNG <span className="text-[#6EC93E]">Admin</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="mb-8">
            <h1
              className={cn(
                poppins.className,
                "text-[1.75rem] font-semibold text-[#111827] leading-tight",
              )}
            >
              Welcome back
            </h1>
            <p
              className={cn(
                satoshi.className,
                "text-[#6B7280] mt-1.5 text-[0.9375rem]",
              )}
            >
              Sign in to your admin account
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] font-medium text-[#374151]",
                )}
              >
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@nftng.io"
                autoComplete="email"
                error={errors.email?.message}
                className={errors.email?.message ? undefined : "border-[#D0D5DD]"}
                {...register("email")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className={cn(
                  satoshi.className,
                  "text-[0.875rem] font-medium text-[#374151]",
                )}
              >
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  className={cn("pr-11!", errors.password?.message ? undefined : "border-[#D0D5DD]")}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-5.5 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors z-10"
                >
                  <Icon
                    icon={
                      showPassword ? "solar:eye-closed-bold" : "solar:eye-bold"
                    }
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              className={cn(
                "mt-2 h-11 bg-[#6EC93E] hover:bg-[#5cb535] text-white font-semibold text-[0.9375rem] rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2",
                poppins.className,
              )}
            >
              Sign In
            </Button>
          </form>
        </div>

        <p
          className={cn(
            satoshi.className,
            "text-center text-[#9CA3AF] text-[0.8125rem] mt-6",
          )}
        >
          NFTNG Admin · Access restricted
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
