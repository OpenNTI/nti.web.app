import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport.result', {
	message: {
		one: 'Success. Imported one item.',
		other: 'Success. Imported %(count)s items.'
	}
});

export default class Result extends React.PureComponent {

	static propTypes = {
		result: PropTypes.object
	}

	render () {
		const {result: {ItemCount: count} = {}} = this.props;

		return count == null ? null : (
			<div className="result">
				{t('message', {count})}
			</div>
		);
	}
}
