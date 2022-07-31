import { User } from "@prisma/client";
import {
  Configuration,
  CountryCode,
  LinkTokenCreateRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";
import invariant from "tiny-invariant";
import {
  createToken,
  getPlaidAccessToken,
} from "./models/plaidaccesstoken.server";

const CLIENT_NAME = "dough";

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV ?? "sandbox"],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET":
        process.env.PLAID_ENV === "sandbox"
          ? process.env.PLAID_SANDBOX_SECRET
          : process.env.PLAID_DEV_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

export const createLinkToken = async (user: User) => {
  const tokenRequest: LinkTokenCreateRequest = {
    user: {
      client_user_id: user.id,
    },
    client_name: CLIENT_NAME,
    products: [Products.Auth],
    language: "en",
    redirect_uri: process.env.PLAID_REDIRECT_URI,
    country_codes: [CountryCode.Us],
  };

  try {
    const createTokenResponse = await client.linkTokenCreate(tokenRequest);
    return createTokenResponse.data;
  } catch (error: any) {
    console.log(error.response);
    return undefined;
  }
};

export const exchangePublicToken = async (user: User, publicToken: string) => {
  const exchangeResponse = await client.itemPublicTokenExchange({
    public_token: publicToken,
  });

  createToken({ token: exchangeResponse.data.access_token, userId: user.id });
};

export const getAccounts = async (user: User) => {
  const accessToken = await getPlaidAccessToken(user.id);
  invariant(accessToken, "No access token found for user");

  try {
    const accountsResponse = await client.accountsGet({
      access_token: accessToken.token,
    });
    return accountsResponse.data;
  } catch (error: any) {
    return error.response;
  }
};
