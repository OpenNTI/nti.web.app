import React from 'react';
import PropTypes from 'prop-types';
import {Layouts} from '@nti/web-commons';
import {Editor} from '@nti/web-video';

const noop = () => null;

export default class NTIWebLessonItemsVideoEditor extends React.Component {
	static propTypes = {
		location: PropTypes.shape({
			item: PropTypes.object
		})
	}

	render () {
		const {location} = this.props;
		const {item} = location || {};

		return (
			<>
				<Layouts.Aside component={noop} />
				<Editor video={item} />
			</>
		);
	}
}
