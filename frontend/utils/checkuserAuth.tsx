// utils/useCheckUserAuth.ts
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";

export const useCheckUserAuth = (requiredRole: string) => {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log({ user, token, isAuthenticated });

  useEffect(() => {
    // Add a small delay to let the auth store initialize properly
    const authCheckTimer = setTimeout(() => {
      // Skip auth check during server-side rendering
      if (typeof window === "undefined") {
        return;
      }

      // Check if the user is authenticated
      if (isAuthenticated === false) {
        router.push("/login");
        return;
      }

      // Check if the user has the required role
      if (!user || user.role !== requiredRole) {
        router.push("/unauthorized");
        return;
      }

      // User is authorized
      setIsAuthorized(true);
      setIsLoading(false);
    }, 500); // Small delay to ensure store is hydrated

    return () => clearTimeout(authCheckTimer);
  }, [isAuthenticated, router, token, user, requiredRole]);

  return { isAuthorized, isLoading };
};
