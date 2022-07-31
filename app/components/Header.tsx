import { Form } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Navigation } from "~/constants/navigation";
import { useOptionalUser } from "~/utils";

export function Header() {
  const user = useOptionalUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(true);
  };

  useEffect(() => {
    isOpen && dropdownRef.current?.focus();
  }, [isOpen]);

  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between border-b py-2 px-4 sm:px-6 md:justify-start md:space-x-10 md:border-none">
      <Link
        to="/"
        className="items-center justify-center text-2xl font-bold lg:flex-1"
      >
        dough.
      </Link>

      <div className="-my-2 -mr-2 md:hidden">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-white p-2 text-black hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-expanded="false"
          onClick={onOpen}
        >
          <span className="sr-only">Open menu</span>
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <nav className="hidden justify-center space-x-10 md:flex md:items-end">
        {Navigation.map(({ name, to }) => (
          <NavLink
            key={name}
            to={to}
            className="font-semibold text-black hover:text-gray-700"
          >
            {name}
          </NavLink>
        ))}
      </nav>

      <div className="hidden items-center justify-end space-x-2 md:flex md:flex-1">
        {!user ? (
          <>
            {" "}
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 text-base font-medium text-black hover:text-gray-700"
            >
              Sign in
            </Link>
            <Link
              to="/join"
              className="inline-flex items-center justify-center rounded border border-black px-4 py-2 text-base font-medium text-black shadow-sm hover:border-gray-700 hover:text-gray-700"
            >
              Sign up
            </Link>
          </>
        ) : (
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded border border-black px-4 py-2 text-base font-medium text-black shadow-sm hover:border-gray-700 hover:text-gray-700"
            >
              Sign out
            </button>
          </Form>
        )}
      </div>

      {isOpen ? (
        <div
          tabIndex={1}
          ref={dropdownRef}
          className="absolute inset-x-0 top-0 origin-top-left p-2 md:hidden"
        >
          <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-5">
              <div className="mt-6">
                <button type="button" onClick={() => setIsOpen(false)}></button>
                <nav className="grid gap-y-8 text-gray-900">
                  {Navigation.map(({ name, to }) => (
                    <NavLink key={name} to={to} className="border-b">
                      {name}
                    </NavLink>
                  ))}
                </nav>
                <div className="border border-t-2 border-slate-100"></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
