import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import ResetPasswordForm from "@/components/Forms/auth/reset-password-form";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your account password',
};

const ResetPassword: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center">
      <ToastContainer />
      <div className="hidden w-full xl:block xl:w-1/2">
        <div className="px-26 py-17.5 text-center">
          <Link
            className="mb-5.5 inline-block"
            href="/"
            aria-label="Go to home page"
          >
            <Image
              className="hidden dark:block"
              src={"/logos/logo.png"}
              alt="Site logo"
              width={176}
              height={32}
            />
            <Image
              className="dark:hidden"
              src={"/logos/logo.png"}
              alt="Site logo"
              width={176}
              height={32}
            />
          </Link>

          <p className="2xl:px-20">
            Reset your password securely and regain access to your account
          </p>
        </div>
      </div>

      <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPassword;