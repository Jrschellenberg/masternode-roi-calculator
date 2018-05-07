import getFormData from 'get-form-data';

export default class ParsleyFormValidationController {
	constructor(){
		//Initialize instance variables required.
		this.dataArray = [];
		this.startMn = this.masternodeCollateral = null;
		this.masternodeIncreaseCount = this.days = this.blockTime = this.BLOCKS_PER_DAY = null;
		this.chart = null;
		this.colors1 = ['#e2431e', '#f1ca3a', '#6f9654','#e7711b', '#1c91c0', '#43459d'];
		this.colors2 = ['#e7711b', '#1c91c0', '#43459d','#e2431e', '#f1ca3a', '#6f9654'];
		this.index = 0;
		
		this.startBlocks = [];
		this.endBlocks = [];
		this.rewards = [];
		this.masternodePercents = [];
		
		this.formItems = 8;
		
		this.process();
	}
	
	process() {
		let controller = this;
		
		$(document).ready(() => {
			$('#ROIForm').submit((event) => {
				controller.processForm(event);
			});
			$(document).keypress(function(event){
				if(event.which === 13) {
					controller.processForm(event);
				}
			});
		});
	}
	
	
	processForm(event){
		let controller = this;
		event.preventDefault();
		controller.dataArray = [];
		let $form = $('#ROIForm');
		$form.parsley().validate();
		
		if($form.parsley().isValid()){ //If form is valid do ajax post!
			let form = document.querySelector('#ROIForm'),
				data = getFormData(form); //Bundle all data up into useable pieces.
			
			controller.setValues(data).then(() => {
				controller.init().then(() => {
					controller.createChart();
				});
			});
		}
		else{
			console.log("form is invalid");
		}
		
	}
	
	calculateColorIndex(){
		if(this.index >= this.colors1.length){
			this.index = 0;
		}
		else{
			this.index++;
		}
	}
	
	createChart(){
		let controller = this;
		google.charts.load('current', {'packages':['line']});
		google.charts.setOnLoadCallback(drawChart);
		
		function drawChart() {
			
			var data = new google.visualization.DataTable();
			data.addColumn('number', 'Days');
			data.addColumn('number', 'ROI');
			data.addColumn('number', 'Masternodes');

			
			data.addRows(controller.dataArray);
			
			var options = {
				chart: {
					title: 'Masternode ROI',
					subtitle: 'in Days since Launch Date'
				},
				series: {
					0: { color: controller.colors1[controller.index],
								axis: 'ROI'		},
					1: { color: controller.colors2[controller.index],
						axis: 'Masternodes'		}
					},
				axes: {
					// Adds labels to each axis; they don't have to match the axis names.
					y: {
						Masternodes: {label: 'Masternodes on Network'},
						ROI: {label: 'Return on Investment'}
					}
				},
				width: (window.innerWidth *7)/8,
				height: window.innerHeight
			};
			
			controller.calculateColorIndex();
			controller.chart = new google.charts.Line(document.getElementById('graph'));
			controller.chart.draw(data, google.charts.Line.convertOptions(options));
		}
		
		
	}
	
	init(){
		return new Promise((resolve) => {
			console.clear();
			// console.log("WARNING: Programmatically clearing console here! CAREFUL");
			let currentBlock, reward, masternodes, ROI;
			for (let day = 1; day <= this.days; day++) {
				currentBlock = this.recalculateBlock(day);
				reward = this.calculateMasternodeReward(currentBlock);
				masternodes = this.calculateMasterNodesOnNetwork(day);
				ROI = this.calculateROI(reward, masternodes);
				let array = [day, ROI, masternodes];
				this.dataArray.push(array);
				console.log(`Day: ${day} \n\n Block: ${currentBlock} \n Calculated Reward: ${reward} \n Masternodes on Network: ${masternodes} \n ROI: ${ROI}\n`);
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
			
			for(let i=0; i<this.formItems; i++){
				for(let prop in data){
					if(prop === 'endBlock'+i){
						this.endBlocks[i] = parseInt(data[prop]);
					}
					else if(prop === 'startBlock'+i){
						this.startBlocks[i] = parseInt(data[prop]);
					}
					else if(prop === 'rewardsBlock'+i){
						this.rewards[i] = parseInt(data[prop]);
					}
					else if(prop === 'mnPercentBlock'+i){
						this.masternodePercents[i] = Math.floor(parseFloat(data[prop])*10);
					}
				}
			}
			
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
		return this.startMn + (day * this.masternodeIncreaseCount);
	}
	
	calculateMasternodeReward(currentBlock) {
		
		if (currentBlock > this.startBlocks[0] && currentBlock <= this.endBlocks[0]) {
			return (this.rewards[0] * this.masternodePercents[0]) / 1000; 
		}
		else if (currentBlock > this.startBlocks[1] && currentBlock <= this.endBlocks[1]) {
			return (this.rewards[1] * this.masternodePercents[1]) / 1000; 
		}
		else if (currentBlock > this.startBlocks[2] && currentBlock <= this.endBlocks[2]) {
			return (this.rewards[2] * this.masternodePercents[2]) / 1000; 
		}
		else if (currentBlock > this.startBlocks[3] && currentBlock <= this.endBlocks[3]) {
			return (this.rewards[3] * this.masternodePercents[3]) / 1000; 
		}
		else if (currentBlock > this.startBlocks[4] && currentBlock <= this.endBlocks[4]) {
			return (this.rewards[4] * this.masternodePercents[4]) / 1000; 
		}
		else if (currentBlock > this.startBlocks[5] && currentBlock <= this.endBlocks[5]) {
			return (this.rewards[5] * this.masternodePercents[5]) / 1000; 
		}
		else if (currentBlock > this.startBlocks[6] && currentBlock <= this.endBlocks[6]) {
			return (this.rewards[6] * this.masternodePercents[6]) / 1000; 
		}
		else if (currentBlock > this.startBlocks[7]) {
			return (this.rewards[6] * this.masternodePercents[6]) / 1000; 
		}
	}
}