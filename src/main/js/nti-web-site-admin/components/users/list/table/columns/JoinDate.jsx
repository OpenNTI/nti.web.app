import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime} from '@nti/web-commons';
import cx from 'classnames';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.JoinDate', {
	title: 'Join Date'
});

export default class JoinDate extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired
	}

	static cssClassName = 'joindate-col';

	static Name = () => t('title')

	static SortKey = 'createdTime';

	render () {
		const {item, store} = this.props;
		return (
			<div className={cx('cell', {'row-selected': store.isSelected(item)})}>
				<DateTime className="value" date={item.getCreatedTime()} format="ll" />
			</div>
		);
	}
}
