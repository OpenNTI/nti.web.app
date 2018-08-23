import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

const t = scoped('nti-web-site-admin.components.content.list.table.columns.TotalEnrolled', {
	title: 'Enrolled'
});

export default class TotalEnrolled extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	static cssClassName = 'totalenrolled-col';

	static Name = () => t('title')

	// static SortKey = 'totalEnrolled';

	render () {
		const {item} = this.props;
		return (
			<div className="cell">
				{(item.CatalogEntry && item.CatalogEntry.TotalEnrolledCount) || 0}
			</div>
		);
	}
}
