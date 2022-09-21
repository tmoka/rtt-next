import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";


const prisma = new PrismaClient();

const usersHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const allUsers = await prisma.user.findMany();

    return res.json(allUsers);
  }

  if (req.method === "PUT") {
    const data = req.body;
    const { name, kana, email } = data;

    const updateUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        name,
        kana,
      }
    })
    return res.json(updateUser);
  }
}
export default usersHandler;