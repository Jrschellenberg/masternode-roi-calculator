import getFormData from 'get-form-data';

export default class ParsleyFormValidationController {
	constructor(){
		//Initialize instance variables required.
		this.roiArray = [];
		this.dayArray = [];
		this.startMn = this.masternodeCollateral = null;
		this.masternodeIncreaseCount = this.days = this.blockTime = this.BLOCKS_PER_DAY = null;
		
		this.process();
	}
	
	process() {
		let controller = this;
		
		$(document).ready(() => {
			$('#ROIForm').submit((event) => {
				event.preventDefault();
				let $form = $('#ROIForm');
				$form.parsley().validate();
				
				if($form.parsley().isValid()){ //If form is valid do ajax post!
					let form = document.querySelector('#ROIForm'),
						data = getFormData(form); //Bundle all data up into useable pieces.
					console.log(data);
					
					controller.setValues(data).then(() => {
						controller.init().then(() => {
							console.log("finished simulation.");
						});
					});
				}
				else{
					console.log("form is invalid");
				}
			}).bind(this);
		});
	}
	
	init(){
		return new Promise((resolve) => {
			let currentBlock, reward, masternodes, ROI;
			for (let day = 1; day <= this.days; day++) {
				currentBlock = this.recalculateBlock(day);
				reward = this.calculateMasternodeReward(currentBlock);
				masternodes = this.calculateMasterNodesOnNetwork(day);
				ROI = this.calculateROI(reward, masternodes);
				this.dayArray.push(day);
				this.roiArray.push(ROI);
				console.log(`Current Day ${day} \n currentBlock: ${currentBlock} \n reward: ${reward} \n masternodes on Network: ${masternodes} \n ROI: ${ROI}`);
			}
			resolve();
		});
	}
	
	//Here we will initialize the instance variables.
	setValues(data){
		return new Promise((resolve) => {
			this.masternodeCollateral = parseFloat(data.masternodeCollateral);
			this.startMn = parseInt(data.startMasternodeCount);
			this.masternodeIncreaseCount = parseFloat(data.masternodeIncreasePerDay);
			this.days = parseInt(data.days);
			this.blockTime = parseInt(data.blockTime);
			this.BLOCKS_PER_DAY = 86400 / this.blockTime;
			resolve();
		});
	}
	
	recalculateBlock(day) {
		return this.BLOCKS_PER_DAY * day;
	}
	
	calculateROI(reward, masternodesOnNetwork){
		let rewardPerHr = ((masternodesOnNetwork * this.blockTime) / 3600 );
		let coinsPerDay = (24 / rewardPerHr) * (reward);
		let dayUntilROI = this.masternodeCollateral/coinsPerDay;
		return Math.floor((360/dayUntilROI) * 100);
		
	}
	calculateMasterNodesOnNetwork(day){
		console.log(`STartMN: ${this.startMn} \n MasternodeIncreaseCount: ${this.masternodeIncreaseCount}`);
		
		return this.startMn + (day * this.masternodeIncreaseCount);
	}
	
	calculateMasternodeReward(currentBlock) {
		if (currentBlock > 0 && currentBlock <= 24999) {
			return (150 * 400) / 1000; // 80
		}
		else if (currentBlock > 24999 && currentBlock <= 49999) {
			return (150 * 475) / 1000; // 95
		}
		else if (currentBlock > 49999 && currentBlock <= 74999) {
			return (150 * 600) / 1000; // 120
		}
		
		// if (currentBlock > 0 && currentBlock <= 24999) {
		// 	return (200 * 400) / 1000; // 80
		// }
		// else if (currentBlock > 24999 && currentBlock <= 49999) {
		// 	return (200 * 475) / 1000; // 95
		// }
		// else if (currentBlock > 49999 && currentBlock <= 74999) {
		// 	return (200 * 600) / 1000; // 120
		// }
		else if (currentBlock > 74999 && currentBlock <= 199999) {
			return  (150 * 600) / 1000; // 90
		}
		else if (currentBlock > 199999 && currentBlock <= 319999) {
			return  (100 * 600) / 1000; // 60
		}
		else if (currentBlock > 319999 && currentBlock <= 439999) {
			return  (75 * 600) / 1000; // 45
		}
		else if (currentBlock > 439999 && currentBlock <= 559999) {
			return  (50 * 600) / 1000; // 30
		}
		else if (currentBlock > 559999) {
			return  (25 * 600) / 1000; // 15
		}
	}
	
}