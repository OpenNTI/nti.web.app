import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';

const t = scoped('nti-web-site-admin.components.content.list.table.columns.CreatedTime', {
	title: 'Created'
});

export default class CreatedTime extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	static cssClassName = 'createdtime-col';

	static Name = () => t('title')

	// static SortKey = 'createdTime';

	render () {
		const {item} = this.props;
		return (
			<div className="cell">
				<DateTime className="value" date={item.getCreatedTime()} format="ll" />
			</div>
		);
	}
}
