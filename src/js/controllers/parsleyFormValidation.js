import getFormData from 'get-form-data';

export default class ParsleyFormValidationController {
	constructor(){
		this.process();
	}
	
	process() {
		$(document).ready(() => {
			$('#ROIForm').submit((event) => {
				event.preventDefault();
				let $form = $('#ROIForm');
				$form.parsley().validate();
				
				if($form.parsley().isValid()){ //If form is valid do ajax post!
					let form = document.querySelector('#ROIForm'),
						data = getFormData(form); //Bundle all data up into useable pieces.
					
					console.log(data);
					
					
					console.log("form is valid");
				}
				else{
					console.log("form is invalid");
				}
			}).bind(this);
		});
	}
}