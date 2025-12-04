import { Router } from "express";
import companyController from "../controller/company.controller";
import projectController from "../controller/project.controller";
import paymentController from "../controller/payment.controller";

const companyRouter = Router();


companyRouter.post('/create', companyController.createCompany);

//Projects
companyRouter.post('/add-project', projectController.createProject)
companyRouter.get('/projects', projectController.getProjects)


//payment
companyRouter.post('/add-payment', paymentController.createPaymentMethod)
companyRouter.get('/payments', paymentController.getPaymentMethods)


export default companyRouter;