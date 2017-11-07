import React from 'react';
import PropTypes from 'prop-types';
import {DisplayName, Avatar, DateTime} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	joined: 'Joined:',
	lastSeen: 'Last Seen:',
	never: 'Never'
};

const t = scoped('nti-web-site-admin.users.list.item', DEFAULT_TEXT);


UserItem.propTypes = {
	item: PropTypes.object
};
export default function UserItem ({item}) {
	const {email} = item;

	const createdTime = item.getCreatedTime();
	const lastLoginTime = item.getLastLoginTime();
	const mostRecentSession = item.getMostRecentSession && item.getMostRecentSession();
	const lastSeen = mostRecentSession || lastLoginTime;

	return (
		<div className="site-admin-user-item">
			<Avatar className="avatar" entity={item} />
			<div className="info">
				<DisplayName className="display-name" entity={item} />
				<div className="meta">
					<div className="joined">
						<span className="label">{t('joined')}</span>
						<DateTime className="value" date={createdTime} format="ll" />
					</div>
					{email && (<a className="email" href={`mailto:${email}`}>{email}</a>)}
				</div>
			</div>
			<div className="last-seen">
				<span className="label">{t('lastSeen')}</span>
				{lastSeen ? (<DateTime className="value" date={lastSeen} format="lll" />) : null}
				{!lastSeen && (<span className="value">{t('never')}</span>)}
			</div>
		</div>
	);
}
