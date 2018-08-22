import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';
import {CourseItem} from '@nti/web-course';

const t = scoped('nti-web-site-admin.components.content.list.table.columns.CourseName', {
	headerTitle: 'Type',
	title: 'Name'
});

export default class CourseName extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired
	}

	static cssClassName = 'coursename-col';

	static Name = () => t('title')

	// static SortKey = 'Title'

	render () {
		const {item} = this.props;
		return (
			<LinkTo.Object object={item} activeClassName="active" exact context="site-admin.course-list-item">
				<div className="cell">
					<CourseItem className="course-info" catalogEntry={item.CatalogEntry} />
				</div>
			</LinkTo.Object>
		);
	}
}
