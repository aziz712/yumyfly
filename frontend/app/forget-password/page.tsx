"use client";

import type React from "react";

import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, CheckCircle, Loader2, KeyRound } from "lucide-react";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, isLoading } = useAuthStore();

  // Reset the form after success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      timer = setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await resetPassword({ email });
      setIsSuccess(true);
      setEmail(""); // Clear the input
    } catch (error) {
      // Error is handled by the store, but we can add additional handling here if needed
    }
  };

  return (
    <Card className="w-full border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mx-auto mb-4">
          <KeyRound className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-center text-2xl font-bold">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center text-blue-100">
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-green-600 mb-2">
              Email Sent Successfully!
            </h3>
            <p className="text-gray-500 text-center">
              Please check your inbox for instructions to reset your password
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t px-6 py-4 bg-gray-50">
        <p className="text-sm text-gray-500">
          Remember your password?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Back to login
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ResetPasswordForm;
