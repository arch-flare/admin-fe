import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import SignInForm from "@/components/Forms/auth/signin-form";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Archflaire-Login",
    description: "Archflaire login",
  };
}

const SignIn: React.FC = () => {

  return (
    <div className="flex flex-wrap items-center">
      <ToastContainer />
      <div className="hidden w-full xl:block xl:w-1/2">
        <div className="px-26 py-17.5 text-center">
          <Link
            className="mb-5.5 inline-block"
            href="/"
            aria-label="Dashboard"
          >
            {/* <Image
              className="hidden dark:block"
              src={"/logos/logo.png"}
              alt="Logo"
              width={176}
              height={32}
            />
            <Image
              className="dark:hidden"
              src={"/logos/logo.png"}
              alt="Logo"
              width={176}
              height={32}
            /> */}
          </Link>

          <p className="2xl:px-20">
            Archflaire admin dashboard
          </p>
        </div>
      </div>

      <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
        <SignInForm />
      </div>
    </div>
  );
};

export default SignIn;