import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {LinkTo} from '@nti/web-routing';
import {User, EmptyState, List} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';

import Styles from './ActiveUsers.css';

const cx = classnames.bind(Styles);
const t = scoped('NTIWebAppLessonItems.overrides.topic.ActiveUsers', {
	heading: 'Active People',
	empty: 'There are no active people.'
});

export default class ActiveUsers extends React.Component {
	static propTypes = {
		activeUsers: PropTypes.array
	}

	render () {
		const {activeUsers} = this.props;

		if (!activeUsers) { return null; }

		const empty = activeUsers.length === 0;

		return (
			<div className={cx('active-users')}>
				{empty && (<EmptyState subHeader={t('empty')} />)}
				{!empty && (<div className={cx('heading')}>{t('heading')}</div>)}
				{!empty && (
					<List.Unadorned className={cx('user-list')}>
						{activeUsers.map((user, index) => {
							return (
								<li key={index}>
									<LinkTo.Object className={cx('user-list-item')} object={user}>
										<User.Avatar className={cx('avatar')} user={user} />
										<User.DisplayName className={cx('display-name')} user={user} />
									</LinkTo.Object>
								</li>
							);
						})}
					</List.Unadorned>
				)}
			</div>
		);
	}
}
