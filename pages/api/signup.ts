import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";


const prisma = new PrismaClient();

const signupHandler = async (req: any, res: any) => {
    const data = req.body;
    const { name, email, password } = data;

    const hashedPassword = await hash(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    })

    console.log(user)
}

export default signupHandler;