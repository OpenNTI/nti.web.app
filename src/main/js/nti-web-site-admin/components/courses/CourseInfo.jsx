import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {scoped} from 'nti-lib-locale';
import {Presentation, DateTime} from 'nti-web-commons';

const DEFAULT_TEXT = {
	start: 'Starts:',
	end: 'Ends:'
};
const t = scoped('nti-web-site-admin.courses.CourseInfo', DEFAULT_TEXT);

SiteAdminCourseInfo.propTypes = {
	className: PropTypes.string,
	catalogEntry: PropTypes.object
};
export default function SiteAdminCourseInfo ({className, catalogEntry}) {
	const {Title, ProviderUniqueID} = catalogEntry;
	const startDate = catalogEntry.getStartDate();
	const endDate = catalogEntry.getEndDate();

	return (
		<div className={cx('site-admin-course-info', className)}>
			<Presentation.AssetBackground className="course-icon" contentPackage={catalogEntry} type="landing" />
			<div className="info">
				<div className="label">{ProviderUniqueID}</div>
				<div className="title">{Title}</div>

				<div className="meta">
					{startDate && (
						<div className="start date">
							<span className="label">{t('start')}</span>
							<DateTime className="value" date={startDate} format="ll"/>
						</div>
					)}
					{endDate && (
						<div className="end date">
							<span className="label">{t('end')}</span>
							<DateTime className="value" date={endDate} format="ll" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
