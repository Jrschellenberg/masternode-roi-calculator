import ParsleyFormValidationController from '../controllers/parsleyFormValidation';

export default function(ctx, next) {
	new ParsleyFormValidationController();
	next();
}