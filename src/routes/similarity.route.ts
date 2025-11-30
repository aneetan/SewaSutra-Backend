import { Router } from "express";
import requirementController from "../controller/requirement.controller";

const similarityRouter = Router();

similarityRouter.get('/:requirementId/similar-companies', requirementController.findMatchingCompanies);

export default similarityRouter;