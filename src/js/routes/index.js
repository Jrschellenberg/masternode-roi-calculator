import route from 'page';
import Middleware from '../middlewares';




export default class Router extends Middleware {
	constructor() {
		super(route);
		this._bindRoutes();
		route.start({click: false});
	}
	
	
	_bindRoutes() {
		// route('/', KenBurnsEffect);
		// route('/gallery/', PhotoGallery);
		
	}
	
	refresh() {
		route(window.location.pathname);
	}
	
}