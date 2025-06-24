"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useState, useEffect } from "react";

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    router.push(pathname + "?" + createQueryString("q", searchValue));
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2 transition-all focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200">
        <Search size={20} className="text-emerald-400 transition-colors duration-200 group-focus-within:text-emerald-600 mr-2" />
        <input
          className="bg-transparent outline-none px-2 text-base font-medium text-gray-700 placeholder:text-gray-400 w-40 focus:w-56 transition-all duration-200"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
    </form>
  );
};

export default SearchInput;