import React from 'react';
import PropTypes from 'prop-types';
import {Flyout} from 'nti-web-commons';

class Option extends React.Component {
	static propTypes = {
		option: PropTypes.string,
		onTypeToggle: PropTypes.func
	}

	toggleType = () => {
		const { onTypeToggle, option } = this.props;

		onTypeToggle && onTypeToggle(option);
	}

	render () {
		return <div className="admin-list-type-option" onClick={this.toggleType}>{this.props.option}</div>;
	}
}

export default class TypeSelect extends React.Component {
	static propTypes = {
		options: PropTypes.arrayOf(PropTypes.string),
		selectedType: PropTypes.string,
		onTypeToggle: PropTypes.func
	}

	attachFlyoutRef = x => this.flyout = x

	constructor (props) {
		super(props);

		this.state = {};
	}

	onSelect = (value) => {
		const { onTypeToggle } = this.props;

		this.flyout && this.flyout.dismiss();

		onTypeToggle && onTypeToggle(value);
	}

	renderOption = (option) => {
		return (<Option key={option} option={option} onTypeToggle={this.onSelect}/>);
	}

	renderSelectedType () {
		return (<div className="admin-list-selected-type"><div className="label">{this.props.selectedType}</div><i className="icon-chevron-down"/></div>);
	}

	render () {
		const { options } = this.props;

		return (
			<Flyout.Triggered
				className="admin-list-type-select"
				trigger={this.renderSelectedType()}
				ref={this.attachFlyoutRef}
				horizontalAlign={Flyout.ALIGNMENTS.LEFT}
			>
				<div>
					{(options || []).map(this.renderOption)}
				</div>
			</Flyout.Triggered>
		);
	}
}
