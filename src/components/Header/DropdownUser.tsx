import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import ClickOutside from "@/components/ClickOutside";
import { post } from "@/utils/api"; // Import the API utility

interface UserDetails {
  id: number;
  name: string;
  role: string;
  profile_photo_path: string;
}

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = Cookies.get('auth_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Try to get user from localStorage first
        const cachedUser = localStorage.getItem('user_data');
        if (cachedUser) {
          setUserDetails(JSON.parse(cachedUser));
          setLoading(false);
          return;
        }

        // If no cached user, fetch from API
        const response = await post('/auth/profile');
        if (response.status) {
          const userData = response.data;
          localStorage.setItem('user_data', JSON.stringify(userData));
          setUserDetails(userData);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clean up regardless of API call success
      Cookies.remove('auth_token');
      localStorage.removeItem('user_data');
      setUserDetails(null);
      router.push('/auth/signin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden text-right lg:block">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="hidden h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:block" />
      </div>
    );
  }

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        aria-expanded={dropdownOpen}
        aria-label="Toggle user menu"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {userDetails?.name || 'Guest User'}
          </span>
          <span className="block text-xs">
            Admin
          </span>
        </span>
        <span className="h-12 w-12 rounded-full">
          <img
            width={48}
            height={48}
            src={userDetails?.profile_photo_path || "/images/user/user-placeholder.png"}
            alt="User avatar"
            className="rounded-full"
          />
        </span>
        <span className="hidden sm:block" aria-hidden="true">▼</span>
      </button>

      {dropdownOpen && (
        <div
          className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
          role="menu"
          aria-orientation="vertical"
        >
          <ul
            className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark"
            role="none"
          >
            <li role="none">
              <Link
                href={`/profile/${userDetails?.id}/edit`}
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                role="menuitem"
              >
                My Profile
              </Link>
            </li>
          </ul>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 py-4 px-6 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
            role="menuitem"
          >
            Log Out
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;