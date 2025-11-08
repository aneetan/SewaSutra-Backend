import { User } from "@prisma/client";
import { UserAttributes } from "../types/auth.types";
import prisma from "../config/dbconfig";

const User = prisma.user;

class UserRepository {
   async findByEmail(email: string): Promise <User | null> {
      return await User.findUnique({where: {email}})
   }

   async createUser(userData: Omit<UserAttributes, "id">): Promise<User> {
      const {name, email, phone, address, role, password, status} = userData;

      return await User.create({
         data: {
            name,
            email,
            phone,
            address,
            role,
            password,
            status,
            emailVerified: false
         }
      })
   }

   async updateVerificationStatus(email: string) : Promise<User> {
      const user = await prisma.user.findUnique({where: {email}});

      if(!user) throw new Error("User not found");

      const updated = await User.update({
         where: { email },
         data: {
            emailVerified: true
         }
      });

      return updated;
   }
}

export default new UserRepository();