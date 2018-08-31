import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';

const t = scoped('nti-web-site-admin.components.content.list.table.columns.StartDate', {
	title: 'Start Date'
});

export default class StartDate extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	static cssClassName = 'startdate-col';

	static Name = () => t('title')

	static SortKey = 'startDate';

	render () {
		const {item} = this.props;
		return (
			<div className="cell">
				<DateTime className="value" date={item.getStartDate()} format="ll" />
			</div>
		);
	}
}
