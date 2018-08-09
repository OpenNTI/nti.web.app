import React from 'react';
import PropTypes from 'prop-types';
import {DisplayName, Avatar, DateTime, Checkbox} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import cx from 'classnames';

const DEFAULT_TEXT = {
	joined: 'Joined:',
	lastSeen: 'Last Seen:',
	never: 'Never'
};

const t = scoped('nti-web-site-admin.users.list.item', DEFAULT_TEXT);


UserItem.propTypes = {
	item: PropTypes.object,
	isSelected: PropTypes.bool,
	onSelect: PropTypes.func,
	addCmp: PropTypes.func,
	removeCmp: PropTypes.func
};
export default function UserItem ({item, isSelected, onSelect, removeCmp: RemoveCmp, addCmp: AddCmp}) {
	const {email} = item;

	const createdTime = item.getCreatedTime();
	const lastLoginTime = item.getLastLoginTime && item.getLastLoginTime();
	let lastSeen = lastLoginTime;

	// if none of the 'last seen' times resolved to anything greater than 0, just set it null so that we show 'Never'
	if(lastSeen && lastSeen.getTime() === 0) {
		lastSeen = null;
	}

	function onChange (e) {
		e.stopPropagation();
		e.preventDefault();

		onSelect && onSelect(item, !isSelected);
	}

	const className = cx('site-admin-user-item', { selected: isSelected });

	return (
		<div className={className}>
			{onSelect && (
				<div onClick={onChange}>
					<Checkbox checked={isSelected}/>
				</div>
			)}
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
				{AddCmp && (<AddCmp item={item}/>)}
				{RemoveCmp && (<RemoveCmp item={item}/>)}
			</div>
			<div className="last-seen">
				<span className="label">{t('lastSeen')}</span>
				{lastSeen ? (<DateTime className="value" date={lastSeen} format="lll" />) : null}
				{!lastSeen && (<span className="value">{t('never')}</span>)}
			</div>
		</div>
	);
}
