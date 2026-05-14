"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterFormData } from "@/lib";
import { toast } from "sonner";
import { Input } from "../common/Input";
import { Button } from "../common/Button";

const NewsletterForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not subscribe. Try again.");
      }
      toast.success("You're subscribed! Stay tuned for updates.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const onInvalid = () => {
    toast.error("Enter a valid email address.");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="flex relative z-1 md:flex-row flex-col gap-1 md:gap-2.25"
    >
      <Input
        className="lg:w-90! w-full!"
        placeholder="Input Email..."
        type="email"
        {...register("email")}
      />
      <Button
        type="submit"
        loading={isSubmitting}
        className="bg-black font-medium text-[.875rem] rounded-lg min-w-21.75"
      >
        Subscribe
      </Button>
    </form>
  );
};

export { NewsletterForm };
