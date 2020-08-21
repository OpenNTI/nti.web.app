import './Name.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DisplayName, Avatar} from  '@nti/web-commons';
import {LinkTo} from '@nti/web-routing';
import cx from 'classnames';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.Name', {
	headerTitle: 'Type',
	title: 'Name'
});

export default class Name extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired
	}

	static cssClassName = 'name-col';

	static Name = () => t('title')

	static SortKey = 'alias'

	render () {
		const {item, store} = this.props;

		const type = store.filter === 'learners' ? 'users' : 'admins';
		const context = `site-admin.${type}-list-item`;

		return (
			<LinkTo.Object object={item} context={context} exact>
				<div className={cx('cell')}>
					<Avatar entity={item}/>
					<div className="user-info">
						<DisplayName entity={item}/>
						<div className="email">{item.email}</div>
					</div>
				</div>
			</LinkTo.Object>
		);
	}
}
