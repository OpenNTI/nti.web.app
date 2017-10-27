import React from 'react';

const testData = [
	{
		blocks: [5,2,6,0,2,5,9],
		time: '12 AM'
	},
	{
		blocks: [1,2,3,7,1,2,2],
		time: '2 AM'
	},
	{
		blocks: [0,5,0,0,6,2,3],
		time: '4 AM'
	},
	{
		blocks: [1,2,6,0,2,5,9],
		time: '6 AM'
	},
	{
		blocks: [1,2,3,7,1,5,2],
		time: '8 AM'
	},
	{
		blocks: [0,5,0,0,6,2,3],
		time: '10 AM'
	},
	{
		blocks: [1,2,3,7,1,0,0],
		time: '12 PM'
	},
	{
		blocks: [5,2,7,8,7,1,6],
		time: '2 PM'
	},
	{
		blocks: [0,7,8,9,8,7,1],
		time: '4 PM'
	},
	{
		blocks: [5,2,7,8,7,3,3],
		time: '6 PM'
	},
	{
		blocks: [1,2,3,7,1,4,0],
		time: '8 PM'
	},
	{
		blocks: [5,2,6,0,2,5,2],
		time: '10 PM'
	}
];

const HEX_MAP = {
	10: 'A',
	11: 'B',
	12: 'C',
	13: 'D',
	14: 'E',
	15: 'F'
};

function convertToHex (rgb) {
	let result = '#';

	rgb.forEach(comp => {
		result += (comp > 9 ? HEX_MAP[comp] : comp.toString());
	});

	return result;
}

function determineBlockColor (value) {
	let maxValue = 0;

	testData.forEach(data => {
		data.blocks.forEach(block => {
			if(block > maxValue) {
				maxValue = block;
			}
		});
	});

	const lightestColor = [10,12,15];
	const darkestColor = [2,4,10];

	if(value === 0) {
		return convertToHex([14,14,14]);
	}

	if(value === maxValue) {
		return convertToHex(darkestColor);
	}

	let calculatedColor = [];

	const pctOfMax = (value / maxValue);

	for(let i = 0; i < 3; i++) {
		const diff = lightestColor[i] - darkestColor[i];

		calculatedColor[i] = lightestColor[i] - Math.floor(pctOfMax * diff);
	}

	return convertToHex(calculatedColor);
}

export default class ActiveTimes extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
	}

	renderHeader () {
		return (<div className="active-times-header">Active Times</div>);
	}

	renderBlock = (block) => {
		return (
			<div className="active-block" style={{
				backgroundColor: determineBlockColor(block)
			}}/>
		);
	}

	renderRow = (row) => {
		return (
			<div className="active-blocks">
				{row.blocks.map(this.renderBlock)}
				<div className="time-label">{row.time}</div>
			</div>
		);
	}

	renderDays () {
		return (
			<div className="days-of-week">
				<div className="day">SUN</div>
				<div className="day">MON</div>
				<div className="day">TUE</div>
				<div className="day">WED</div>
				<div className="day">THU</div>
				<div className="day">FRI</div>
				<div className="day">SAT</div>
			</div>
		);
	}

	renderChart () {
		return (
			<div className="active-times-chart">
				{testData.map(this.renderRow)}
				{this.renderDays()}
			</div>
		);
	}

	renderPopular () {
		return (
			<div className="active-times-popular">
				<div className="active-times-popular-header">Most Popular Time</div>
				<div className="active-times-popular-content">Sunday, 6-10 PM PST</div>
			</div>
		);
	}

	render () {
		return (<div className="active-times-widget">
			{this.renderHeader()}
			{this.renderChart()}
			{this.renderPopular()}
		</div>);
	}
}
