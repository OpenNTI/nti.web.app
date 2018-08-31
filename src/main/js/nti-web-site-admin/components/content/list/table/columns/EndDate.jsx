import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';

const t = scoped('nti-web-site-admin.components.content.list.table.columns.EndDate', {
	title: 'End Date'
});

export default class EndDate extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	static cssClassName = 'enddate-col';

	static Name = () => t('title')

	static SortKey = 'endDate';

	render () {
		const {item} = this.props;
		return (
			<div className="cell">
				<DateTime className="value" date={item.getEndDate()} format="ll" />
			</div>
		);
	}
}
