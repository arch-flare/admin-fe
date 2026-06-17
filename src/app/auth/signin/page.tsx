import React from "react";
import Link from "next/link";
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
            className="group mb-5.5 inline-block"
            href="/"
            aria-label="Dashboard"
          >
            <span className="flex items-baseline justify-center uppercase tracking-[0.25em] text-black dark:text-white">
              <span className="text-2xl font-semibold">ARCH</span>
              <span className="text-2xl font-light text-black/70 transition-colors duration-300 group-hover:text-black dark:text-white/80 dark:group-hover:text-white">FLAIRE</span>
            </span>
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