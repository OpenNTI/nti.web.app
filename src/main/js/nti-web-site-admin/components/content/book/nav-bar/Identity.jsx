import React from 'react';
import PropTypes from 'prop-types';
import {Presentation} from '@nti/web-commons';

SiteAdminBookIdentity.propTypes = {
	book: PropTypes.object
};
export default function SiteAdminBookIdentity ({book}) {
	const {title, label} = book;

	return (
		<div className="site-admin-course-identity">
			<Presentation.Asset contentPackage={book} type="landing">
				<img className="course-icon" />
			</Presentation.Asset>
			<div className="info">
				<div className="label">{label}</div>
				<div className="title">{title}</div>
			</div>
		</div>
	);
}
