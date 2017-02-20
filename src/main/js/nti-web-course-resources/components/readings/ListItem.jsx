import React from 'react';

export default class ReadingListItem extends React.Component {
	static propTypes = {
		reading: React.PropTypes.object,
		gotoResource: React.PropTypes.func
	}

	gotoResource = () => {
		const {reading, gotoResource} = this.props;

		if (gotoResource) {
			gotoResource(reading.NTIID);
		}
	}

	render () {
		const {reading} = this.props;
		const {title} = reading;

		return (
			<div onClick={this.gotoResource}>
				<span>{title}</span>
			</div>
		);
	}
}
