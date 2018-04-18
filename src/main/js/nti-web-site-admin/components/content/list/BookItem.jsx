import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Presentation, DateTime} from '@nti/web-commons';

const DEFAULT_TEXT = {
	created: 'Created:',
	noDescription: 'No Description Available'
};
const t = scoped('nti-web-site-admin.courses.list.BookItem', DEFAULT_TEXT);

SiteAdminBookItem.propTypes = {
	item: PropTypes.object
};
export default function SiteAdminBookItem ({item}) {
	return (
		<div className="site-admin-book-item">
			<Presentation.Asset contentPackage={item} type="landing">
				<img className="book-icon"/>
			</Presentation.Asset>
			<div className="book-info">
				<div className="title">{item.title}</div>
				<div className="created-date"><b>{t('created')}</b><span>{DateTime.format(new Date(item.CreatedTime * 1000), 'LLLL')}</span></div>
			</div>
		</div>
	);
}
