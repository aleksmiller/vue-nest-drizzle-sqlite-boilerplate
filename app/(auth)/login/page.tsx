import AuthForm from "@/components/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | MyApp",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
