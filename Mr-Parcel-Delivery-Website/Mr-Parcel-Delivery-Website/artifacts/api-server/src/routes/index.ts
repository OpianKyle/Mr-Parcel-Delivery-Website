import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import pricingRouter from "./pricing";
import adminUsersRouter from "./admin-users";
import quoteDetailsRouter from "./quote-details";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(pricingRouter);
router.use(adminUsersRouter);
router.use(quoteDetailsRouter);

export default router;
