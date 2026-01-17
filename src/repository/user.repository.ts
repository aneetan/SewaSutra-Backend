import { User } from "@prisma/client";
import { UserAttributes } from "../types/auth.types";
import prisma from "../config/dbconfig";
import bcrypt from 'bcryptjs';

const User = prisma.user;

class UserRepository {
   async findByEmail(email: string): Promise <User | null> {
      return await User.findUnique({where: {email}});
   }

   async findById(id: number): Promise <User | null> {
      return await User.findUnique({where: {id}});
   }

   // register user to database
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

   //verify email 
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

   //login user
   async findEmailAndPassword(email: string, password: string): Promise<User | null> {
      const user = await this.findByEmail(email);

      if(!user) return null;

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if(!isPasswordValid) return null;

      else return user;
   }

   async getUserById(id: number): Promise<User | null> {
      return await User.findUnique({ where: { id } });
   }

   async getUserByCompanyId(companyId: number) {
      const company = await prisma.company.findUnique({
         where: { id: companyId },
         select: {
            user: true, // fetch the related user
         },
      });

      if (!company) {
         throw new Error("Company not found");
      }

      return company.user;
   }

   async getAllClients() {
      return await prisma.user.findMany({
         where: {
         role: "CLIENT",
         },
         select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            profile: true
         },
         orderBy: {
         id: "desc",
         },
      });
   }


    
}

export default new UserRepository();