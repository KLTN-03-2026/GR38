import express from "express";
import { body, validationResult } from "express-validator";
import { saveQuizProgress } from "#controllers/Quiz/quizSessionController.js";
import protect from "#middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post(
	"/save-progress",
	[
		body("quizId").notEmpty().isMongoId(),
		body("timeRemaining").notEmpty().isInt({ min: 0 }),
		body("currentQuestionIndex").optional().isInt({ min: 0 }),
		body("answers").optional().isArray(),
		body("answers.*.questionId").optional().isMongoId(),
		body("answers.*.selectedOption").optional({ nullable: true }).isString(),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Dữ liệu không hợp lệ.",
				errors: errors.array(),
			});
		}
		return next();
	},
	saveQuizProgress,
);

export default router;
