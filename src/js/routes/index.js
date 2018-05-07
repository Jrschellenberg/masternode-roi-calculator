import route from 'page';
import Middleware from '../middlewares';

import ParsleyFormValidation from './parsleyFormValidation';


export default class Router extends Middleware {
	constructor() {
		super(route);
		this._bindRoutes();
		route.start({click: false});
	}
	
	
	_bindRoutes() {
		// route('/', KenBurnsEffect);
		route('/', ParsleyFormValidation);
		
	}
	
	refresh() {
		route(window.location.pathname);
	}
	
}