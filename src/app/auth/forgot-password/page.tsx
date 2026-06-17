import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import ForgotPasswordForm from "@/components/Forms/auth/forgot-password-form";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your password',
};

const ForgotPassword: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center">
      <ToastContainer />
      <div className="hidden w-full xl:block xl:w-1/2">
        <div className="px-26 py-17.5 text-center">
          <Link
            className="group mb-5.5 inline-block"
            href="/"
            aria-label="Go to home page"
          >
            <span className="flex items-baseline justify-center uppercase tracking-[0.25em] text-black dark:text-white">
              <span className="text-2xl font-semibold">ARCH</span>
              <span className="text-2xl font-light text-black/70 transition-colors duration-300 group-hover:text-black dark:text-white/80 dark:group-hover:text-white">FLAIRE</span>
            </span>
          </Link>

          <p className="2xl:px-20">
            Your trusted platform for secure access and account management
          </p>
        </div>
      </div>

      <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPassword;