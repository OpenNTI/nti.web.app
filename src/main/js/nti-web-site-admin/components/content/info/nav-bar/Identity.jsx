import React from 'react';
import PropTypes from 'prop-types';
import {Presentation} from 'nti-web-commons';
import {LinkTo} from 'nti-web-routing';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	course: 'View Course'
};

const t = scoped('nti-site-admin.users.user.Identity', DEFAULT_TEXT);

SiteAdminCourseIdentity.propTypes = {
	course: PropTypes.object
};
export default function SiteAdminCourseIdentity ({course}) {
	const {title, label} = course.getPresentationProperties();

	return (
		<div className="site-admin-course-identity">
			<Presentation.Asset contentPackage={course.CatalogEntry} type="landing">
				<img className="course-icon" />
			</Presentation.Asset>
			<div className="info">
				<div className="label">{label}</div>
				<div className="title">{title}</div>
			</div>
			<div className="actions">
				<LinkTo.Object className="profile" object={course}>
					<i className="icon-goto" />
					<span>{t('course')}</span>
				</LinkTo.Object>
			</div>
		</div>
	);
}
