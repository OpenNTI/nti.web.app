import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';

import PermissionsListItem from './PermissionsListItem';

const DEFAULT_TEXT = {
	editor: 'Editor',
	instructor: 'Instructor'
};

const t = scoped('nti-course-roster.permissions-list', DEFAULT_TEXT);

PermissionsList.propTypes = {
	permissionsList: PropTypes.array,
	course: PropTypes.object,
	updatingUsers: PropTypes.object
};
export default function PermissionsList ({permissionsList = [], course, updatingUsers = {}}) {
	const showInstructors = course.hasLink('Instructors');
	const showEditors = course.hasLink('Editors');

	return (
		<div className="course-instructor-permission-list">
			<div className="header">
				<div className="spacer" />
				{showInstructors && (<div className="instructor-label">{t('instructor')}</div>)}
				{showEditors && (<div className="editor-label">{t('editor')}</div>)}
			</div>
			<ul>
				{permissionsList.map((p) => {
					return (
						<li key={p.id}>
							<PermissionsListItem permissions={p} course={course} updating={updatingUsers[p.id]} showInstructor={showInstructors} showEditor={showEditors}/>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
