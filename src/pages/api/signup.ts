import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

const signupController = async (req: any, res: any) => {
  if (req.method === 'POST') {
    const data = req.body;
    const { name, kana, email, password } = data;

    const hashedPassword = await hash(password);

    const user = await prisma.user.create({
      data: {
        name,
        kana,
        email,
        hashedPassword,
      }
    })
    res.json()
  }
}

export default signupController;