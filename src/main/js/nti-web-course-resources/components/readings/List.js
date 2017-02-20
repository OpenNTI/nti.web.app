import React from 'react';

import ListItem from './ListItem';

function getReadings (course) {
	const {ContentPackageBundle} = course || {};
	const {ContentPackages} = ContentPackageBundle || {};

	return (ContentPackages || []).filter(x => x.isRenderable);
}

export default class List extends React.Component {
	static propTypes = {
		course: React.PropTypes.object,
		gotoResource: React.PropTypes.func
	}


	gotoResource = (id) => {
		const {gotoResource} = this.props;

		if (gotoResource) {
			gotoResource(id);
		}
	}

	render () {
		const {course} = this.props;
		const readings = getReadings(course);

		return (
			<div>
				<ul>
					{readings.map(this.renderReading)}
				</ul>
			</div>
		);
	}


	renderReading = (reading, index) => {
		return (
			<li key={index}>
				<ListItem reading={reading} gotoResource={this.gotoResource} />
			</li>
		);
	}
}
