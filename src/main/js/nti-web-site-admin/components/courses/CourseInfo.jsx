import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {Presentation} from 'nti-web-commons';

SiteAdminCourseInfo.propTypes = {
	className: PropTypes.string,
	catalogEntry: PropTypes.object
};
export default function SiteAdminCourseInfo ({className, catalogEntry}) {
	const {Title, ProviderUniqueID} = catalogEntry;

	return (
		<div className={cx('site-admin-course-info', className)}>
			<Presentation.AssetBackground className="course-icon" contentPackage={catalogEntry} type="landing" />
			<div className="meta">
				<div className="label">{ProviderUniqueID}</div>
				<div className="title">{Title}</div>
			</div>
		</div>
	);
}
