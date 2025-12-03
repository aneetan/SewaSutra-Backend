import { Router } from "express";
import companyController from "../controller/company.controller";
import projectController from "../controller/project.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const companyRouter = Router();

companyRouter.use(authMiddleware);

companyRouter.post('/create', companyController.createCompany);

//Projects
companyRouter.post('/add-project', projectController.createProject)
companyRouter.get('/projects', projectController.getProjects)


export default companyRouter;