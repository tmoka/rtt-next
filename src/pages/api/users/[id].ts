import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";
import usersController from "."

const prisma = new PrismaClient;

const userHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  //const router = useRouter();
  const { query } = req;
  let { id } = query;

  if (req.method === "GET") {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(id),
      }
    });

    return res.json(user);
  }
  return res.json({})
}

export default userHandler;