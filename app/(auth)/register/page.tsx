import AuthForm from "@/components/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | MyApp",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
