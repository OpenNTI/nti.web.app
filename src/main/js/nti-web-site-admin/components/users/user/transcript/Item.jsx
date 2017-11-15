import React from 'react';
import PropTypes from 'prop-types';
import {Presentation} from 'nti-web-commons';

import Card from '../../../common/Card';

SiteAdminUserTranscriptItem.propTypes = {
	item: PropTypes.object
};
export default function SiteAdminUserTranscriptItem ({item}) {
	const {label, title} = item.getPresentationProperties();

	return (
		<Card className="site-admin-user-transcript-item">
			<Presentation.AssetBackground className="course-icon" contentPackage={item.CourseInstance.CatalogEntry} type="landing" />
			<div className="meta">
				<div className="label">{label}</div>
				<div className="title">{title}</div>
			</div>
		</Card>
	);
}
