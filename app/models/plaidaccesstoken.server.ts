import { PlaidAccessToken, User } from "@prisma/client";

import { prisma } from "~/db.server";

export async function createToken({
  token,
  userId,
}: Pick<PlaidAccessToken, "token"> & {
  userId: User["id"];
}) {
  const tokenExists = await prisma.plaidAccessToken.findUnique({
    where: { userId },
  });

  if (tokenExists) {
    return prisma.plaidAccessToken.update({
      where: { userId },
      data: { token },
    });
  }

  return prisma.plaidAccessToken.create({
    data: {
      token: token,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function getPlaidAccessToken(id: User["id"]) {
  const userWithToken = await prisma.user.findUnique({
    where: { id },
    include: { plaidAccessToken: true },
  });

  return userWithToken?.plaidAccessToken;
}
