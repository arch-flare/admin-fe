"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { get, put } from "@/utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, User as UserIcon, KeyRound } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response: any = await get("/auth/profile");
        if (response.status) {
          setUser(response.user);
          setProfile({ name: response.user.name, email: response.user.email });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response: any = await put("/auth/profile", profile);
      toast.success(response.message || "Profile updated successfully");
      if (response.user) setUser(response.user);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const response: any = await put("/auth/password", passwords);
      toast.success(response.message || "Password updated successfully");
      setPasswords({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass =
    "w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary disabled:opacity-60";
  const labelClass = "mb-2.5 block font-medium text-black dark:text-white";
  const buttonClass =
    "flex items-center justify-center gap-2 rounded bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-60";

  const initials = (user?.name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Profile" />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-9">
            {/* Account summary */}
            <div className="flex items-center gap-4 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
                {initials || <UserIcon className="h-7 w-7" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  {user?.name}
                </h3>
                <p className="text-sm text-body dark:text-bodydark">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Personal information */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center gap-2 border-b border-stroke px-7 py-4 dark:border-strokedark">
                <UserIcon className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-black dark:text-white">
                  Personal Information
                </h3>
              </div>
              <form onSubmit={handleProfileSubmit} className="p-7">
                <div className="mb-5.5">
                  <label className={labelClass} htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={inputClass}
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-5.5">
                  <label className={labelClass} htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={inputClass}
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={buttonClass}
                    disabled={savingProfile}
                  >
                    {savingProfile && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Change password */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center gap-2 border-b border-stroke px-7 py-4 dark:border-strokedark">
                <KeyRound className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-black dark:text-white">
                  Change Password
                </h3>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-7">
                <div className="mb-5.5">
                  <label className={labelClass} htmlFor="current_password">
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    type="password"
                    className={inputClass}
                    value={passwords.current_password}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        current_password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="mb-5.5">
                  <label className={labelClass} htmlFor="password">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={inputClass}
                    value={passwords.password}
                    onChange={(e) =>
                      setPasswords({ ...passwords, password: e.target.value })
                    }
                    minLength={8}
                    required
                  />
                </div>
                <div className="mb-5.5">
                  <label className={labelClass} htmlFor="password_confirmation">
                    Confirm New Password
                  </label>
                  <input
                    id="password_confirmation"
                    type="password"
                    className={inputClass}
                    value={passwords.password_confirmation}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        password_confirmation: e.target.value,
                      })
                    }
                    minLength={8}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={buttonClass}
                    disabled={savingPassword}
                  >
                    {savingPassword && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Profile;
