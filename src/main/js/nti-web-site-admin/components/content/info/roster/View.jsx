import './View.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {Roster, Enrollment} from '@nti/web-course';
import {List, Loading, Button} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';

import ErrorMessage from '../../../common/ErrorMessage';
import Card from '../../../common/Card';

import Item from './Item';

const DEFAULT_TEXT = {
	error: 'Unable to load roster.',
	manage: 'Manage Roster'
};
const t = scoped('nti-site-admin.courses.course.info.Roster', DEFAULT_TEXT);

export default class SiteAdminCourseRoster extends React.Component {
	static propTypes = {
		course: PropTypes.object
	}


	attachRoster = x => this.roster = x;

	onChange = () => {
		if (this.roster) {
			this.roster.reload();
		}
	}


	render () {
		const {course} = this.props;

		return (
			<div className="nti-site-admin-course-roster">
				{this.renderHeader(course)}
				<Roster ref={this.attachRoster} course={course} renderRoster={this.renderRoster} />
			</div>
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


	renderHeader (course) {
		const {CatalogEntry} = course;

		return (
			<div className="site-admin-course-roster-header">
				<Enrollment.Admin.Prompt.Trigger course={CatalogEntry} onChange={this.onChange}>
					<Button rounded>
						{t('manage')}
					</Button>
				</Enrollment.Admin.Prompt.Trigger>
			</div>
		);
	}


	renderItems (items) {
		return (
			<Card>
				<List.Unadorned>
					{items.map((item, index) => {
						return (
							<li key={index}>
								<LinkTo.Object object={item} context="site-admin.courses.course-roster.list">
									<Item item={item} onChange={this.onChange} />
								</LinkTo.Object>
							</li>
						);
					})}
				</List.Unadorned>
			</Card>
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
