import Bootstrap from './dependencies/bootstrap';

export default class Middleware {
	constructor(page) {
		page('*', Bootstrap);
	}
}