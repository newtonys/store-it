"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OTPModal from "./OTPModal";
import { avatar1, avatar2 } from "@/constants";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(),
    fullName:
      formType === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
    avatar: formType === "sign-up" ? z.string().min(1) : z.string().optional(),
  });
};

function AuthForm({ type }: { type: FormType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      avatar: avatar1,
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const user =
        type === "sign-up"
          ? await createAccount({
              fullName: values.fullName || "",
              email: values.email,
              avatar: values.avatar || avatar1,
            })
          : await signInUser({ email: values.email });

      setAccountId(user.accountId);
    } catch {
      setErrorMessage("Failed to create an account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="shad-input"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full email"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <div>
                    <FormLabel className="shad-form-label">
                      Choose your avatar
                    </FormLabel>
                    <FormControl>
                      <div className=" flex flex-row">
                        <label htmlFor="avatarbtn">
                          <input
                            type="radio"
                            id="avatarbtn"
                            value={avatar1}
                            checked={field.value === avatar1}
                            onChange={field.onChange}
                            name="avatarOption"
                            className="peer hidden"
                          />
                          <div
                            className={`border-4 rounded-full overflow-hidden cursor-pointer transition-all duration-200 m-3 
              ${field.value === avatar1 ? "border-red" : "border-transparent"}`}
                          >
                            <img
                              src={avatar1}
                              alt="avatar 1"
                              width={100}
                              height={100}
                              className="rounded-full cursor-pointer "
                            />
                          </div>
                        </label>

                        <label htmlFor="avatarbtn2">
                          <input
                            type="radio"
                            id="avatarbtn2"
                            value={avatar2}
                            checked={field.value === avatar2}
                            onChange={field.onChange}
                            name="avatarOption"
                            className="peer hidden"
                          />
                          <div
                            className={`border-4 rounded-full overflow-hidden cursor-pointer transition-all duration-200 m-3 
              ${field.value === avatar2 ? "border-red" : "border-transparent"}`}
                          >
                            <img
                              src={avatar2}
                              alt="avatar 2"
                              width={100}
                              height={100}
                              className="rounded-full cursor-pointer w-[100px] h-[100px]"
                            />
                          </div>
                        </label>
                      </div>
                    </FormControl>
                  </div>

                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}
          <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {type === "sign-in" ? "Sign In" : "Sign Up"}

            {isLoading && (
              <img
                src="assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="animate-spin ml-2"
              />
            )}
          </Button>
          {errorMessage && <p className="error-message">*{errorMessage}</p>}

          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "sign-in"
                ? "Don't have an account"
                : "Already have an account"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="ml-1 font-medium text-brand"
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </div>
        </form>
      </Form>
      {accountId && (
        <OTPModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
}

export default AuthForm;
