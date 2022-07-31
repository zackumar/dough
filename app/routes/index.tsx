import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { useEffect, useState } from "react";
import { PlaidLinkOptions, usePlaidLink } from "react-plaid-link";
import invariant from "tiny-invariant";
import { getPlaidAccessToken } from "~/models/plaidaccesstoken.server";
import { createLinkToken, exchangePublicToken } from "~/plaid.server";
import { getUser } from "~/session.server";

import { useOptionalUser } from "~/utils";

export const links: LinksFunction = () => {
  return [
    {
      rel: "preload",
      href: "/assets/svgs/apartment.svg",
      as: "image/svg+xml",
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "plaidExchange") {
    const user = await getUser(request);
    invariant(user, "User is not logged in");
    return json({
      token: await exchangePublicToken(
        user,
        formData.get("public_token") as string
      ),
    });
  }

  if (intent === "plaidLinkToken") {
    const user = await getUser(request);
    invariant(user, "User is not logged in");

    return json({
      linkToken: await createLinkToken(user),
    });
  }

  return json({});
};

interface LoaderData {
  hasAccessToken?: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) return json({});

  const accessToken = await getPlaidAccessToken(user.id);

  return json<LoaderData>({
    hasAccessToken: !!accessToken,
  });
};

export default function Index() {
  const user = useOptionalUser();
  const fetcher = useFetcher();
  const { hasAccessToken } = useLoaderData<LoaderData>();
  const [storedLinkToken, setStoredLinkToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const storedLinkToken = localStorage.getItem("plaid_link_token");
      if (!storedLinkToken) {
        fetcher.submit(
          {
            intent: "plaidLinkToken",
          },
          {
            method: "post",
          }
        );
      } else {
        setStoredLinkToken(storedLinkToken);
      }
    }
  }, []);

  useEffect(() => {
    if (fetcher.data && fetcher.data["linkToken"]) {
      localStorage.setItem(
        "plaid_link_token",
        fetcher.data["linkToken"]["link_token"]
      );
      setStoredLinkToken(fetcher.data["linkToken"]["link_token"]);
    }
  }, [fetcher.data]);

  const hasOauthStateId =
    typeof window !== "undefined" &&
    new URL(window.location.href).searchParams.has("oauth_state_id");
  const config: PlaidLinkOptions = {
    onSuccess: async (public_token, metadata) => {
      fetcher.submit(
        {
          intent: "plaidExchange",
          public_token: public_token,
        },
        {
          method: "post",
        }
      );
    },
    receivedRedirectUri: hasOauthStateId ? window.location.href : undefined,
    onExit: (err, metadata) => {
      console.log(err, metadata);
    },
    onEvent: (eventName, metadata) => {},
    token: storedLinkToken || storedLinkToken || "",
  };

  const { open, exit, ready } = usePlaidLink(config);

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto mt-10 p-10 sm:flex sm:max-w-7xl sm:flex-row sm:items-start sm:justify-center">
        <div className="flex flex-col justify-center">
          <h1 className="max-w-md pt-2 text-5xl text-black">
            Rent-splitting made easy.
          </h1>

          <div className="pt-10">
            {user && storedLinkToken && !hasAccessToken ? (
              <button
                onClick={() => {
                  open();
                }}
                className="inline-flex items-center justify-center rounded border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-700 hover:text-white"
              >
                {!hasOauthStateId
                  ? "Connect to Plaid"
                  : "Finish connecting to Plaid"}
              </button>
            ) : null}
            {user && hasAccessToken ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center rounded border border-green-500 px-4 py-2 text-base font-medium text-green-500 shadow-sm"
              >
                Connected to Plaid!
              </button>
            ) : null}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded border border-black px-4 py-2 text-base font-medium text-black shadow-sm hover:border-gray-700 hover:text-black"
                >
                  Sign In
                </Link>
                <Link
                  to="/join"
                  className="ml-2 inline-flex items-center justify-center rounded border border-transparent bg-black px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-700 hover:text-white"
                >
                  Sign Up
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <img
          src="/assets/svgs/apartment.svg"
          className="hidden w-80 md:flex"
        ></img>
      </div>

      <div className="bg-slate-50">
        <div className="mx-auto mt-5 flex max-w-7xl flex-col items-center justify-between space-x-4 p-5 sm:flex-row">
          <img
            src="/assets/svgs/coffee_with_friends.svg"
            className="jutify-center flex w-80 flex-grow flex-col items-center py-5"
          ></img>
          <div className="flex flex-grow flex-col">
            <h1 className="text-2xl font-semibold">
              Lorem ipsum dolor sit amet.
            </h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Reiciendis dignissimos consequatur necessitatibus quod aperiam ex
              minima ab veritatis laborum est obcaecati tenetur temporibus,
              corrupti quo sapiente ipsam libero facere. Nam, sunt quod
              assumenda nobis magnam facilis tempora numquam libero vitae
              reiciendis repellat! Rerum doloribus unde laudantium? Ad nostrum
              rerum facere.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
