import React from 'react';
import PropTypes from 'prop-types';
import {Roster} from 'nti-web-course';
import {Loading} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

import ErrorMessage from '../../../common/ErrorMessage';

const DEFAULT_TEXT = {
	error: 'Unable to load roster.'
};
const t = scoped('nti-site-admin.courses.course.info.Roster', DEFAULT_TEXT);

export default class SiteAdminCourseRoster extends React.Component {
	static propTypes = {
		course: PropTypes.object
	}


	render () {
		const {course} = this.props;

		return (
			<Roster course={course} renderRoster={this.renderRoster} />
		);
	}


	renderRoster = ({loading, error, items, loadNextPage, loadPrevPage}) => {
		return (
			<div className="site-admin-course-roster">
				{loading && (<div className="loading-mask"><Loading.Mask /></div>)}
				{error && (<ErrorMessage>{t('error')}</ErrorMessage>)}
				{!loading && this.renderItems(items)}
				{!loading && this.renderControls(loadPrevPage, loadNextPage)}
			</div>
		);
	}


	renderItems (items) {
		return (
			<ul>
				{items.map((item, index) => {
					return (
						<li key={index}>
							{item.Username}
						</li>
					);
				})}
			</ul>
		);
	}


	renderControls (loadPrevPage, loadNextPage) {
		return (
			<div className="controls">
				{loadPrevPage && (<span onClick={loadPrevPage}>Prev</span>)}
				{loadNextPage && (<span onClick={loadNextPage}>Next</span>)}
			</div>
		);
	}
}
