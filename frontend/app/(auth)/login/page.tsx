"use client";

import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/public/logo.png";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useAuthStore from "@/store/useAuthStore";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  motDePasse: z.string().min(1, {
    message: "Password is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, user } = useAuthStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      motDePasse: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const onsucess = await login(values);
      /*  onsucess && router.push("/dashboard"); */
    } catch (error) {
      // Error is handled in the store
      console.error(error);
    }
  }

  // Redirect if user is already authenticated
  if (isAuthenticated) {
    if (user?.role === "admin") {
      window.location.href = "/admin";
      return null;
    } else if (user?.role === "livreur") {
      window.location.href = "/livreur";
      return null;
    } else if (user?.role === "restaurant") {
      window.location.href = "/restaurant";
      return null;
    } else if (user?.role === "client") {
      window.location.href = "/client";
      return null;
    }
  }

  return (
    <>
      {/* Background with blur and waves */}
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Blurred Background */}
        <div className="absolute inset-0 bg-cover bg-center bg-[url('/login.jpg')] filter blur-sm" />

        {/* Fixed Waves at the Bottom */}
        <div className="absolute bottom-0 left-0 w-full h-48 overflow-hidden">
          {/* First Wave */}
          <div className="wave wave-1"></div>
          {/* Second Wave */}
          <div className="wave wave-2"></div>
          {/* Third Wave */}
          <div className="wave wave-3"></div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg relative z-10">
          <div className="flex justify-center mb-6">
            <Image
              src={logo || "/placeholder.svg"}
              alt="logo"
              width={150}
              height={100}
              className="object-contain"
            />
          </div>

          <h1 className="text-xl font-bold text-[#3d4152] text-center mb-6">
            Connectez-vous à votre compte
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#777777] font-bold">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="hello@example.com"
                        className="h-12 rounded-md border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motDePasse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#777777] font-bold">
                      Mot de passe
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        showPasswordToggle={true}
                        className="h-12 rounded-md border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-start mt-4">
                <Link
                  href="/forget-password"
                  className="text-[#FF8A2B] hover:underline"
                >
                  réinitialiser le mot de passe
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#FF8A2B] hover:bg-[#E67A1B] text-white rounded-md font-medium cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>

              <div className="text-center mt-4">
                <p className="text-gray-500 text-sm">
                  Vous n'avez pas de compte ?{" "}
                  <Link
                    href="/register"
                    className="text-[#FF8A2B] hover:underline"
                  >
                    S'inscrire
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
