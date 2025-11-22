import { Router } from "express";
import { PublisherController } from "./publisher.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { ValidationMiddleware } from "../../middleware/validation.middleware";
import { CreatePublisherDto, UpdatePublisherDto } from "./publisher.dto";

const router = Router();
const publisherController = new PublisherController();

router.get("/", publisherController.findAll);
router.get("/:id", publisherController.findById);
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(CreatePublisherDto),
  publisherController.create
);
router.patch(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  ValidationMiddleware.validate(UpdatePublisherDto),
  publisherController.update
);
router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize("ADMIN"),
  publisherController.delete
);

export default router;
