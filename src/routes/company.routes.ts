import { Router } from "express";
import companyController from "../controller/company.controller";

const companyRouter = Router();

companyRouter.post('/create', companyController.createCompany);

export default companyRouter;