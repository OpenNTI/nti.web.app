import './View.scss';
import React from 'react';
import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';
import { Table, EmptyState, Loading } from '@nti/web-commons';

import ListItem from './Item';

const DEFAULT_TEXT = {
	name: 'Name',
	publish: 'Publish Status',
	lastModified: 'Last Modified',
	loading: 'Loading',
	emptyHeader: 'This folder is empty.',
	emptyMessage: 'Click the button above to create a new reading.',
	emptyMessageSurvey: 'Click the button above to create a new survey.',
};

const t = scoped('nti-course-resources.readings.View', DEFAULT_TEXT);

function sortOnTitle(a, b) {
	return (a.title || '').localeCompare(b.title);
}

const tableClasses = {
	className: 'course-resources-readings ascending',
	headerClassName: 'course-resources-header',
	bodyClassName: 'course-resources-body',
};

const columnClasses = {
	asc: 'sort-asc',
	desc: 'sort-desc',
	inactive: 'sort-inactive',
	active: 'sort-active',
	default: 'sort-default',
};

export default class Readings extends React.Component {
	static propTypes = {
		course: PropTypes.object,
		items: PropTypes.array,
		gotoResource: PropTypes.func,
		searchTerm: PropTypes.string,
		surveys: PropTypes.bool,
	};

	renderItem = (item, cols) => {
		return (
			<ListItem
				reading={item}
				gotoResource={this.props.gotoResource}
				columns={cols}
			/>
		);
	};

	filter = title => {
		const { searchTerm } = this.props;

		return searchTerm ? new RegExp(searchTerm, 'i').test(title) : true;
	};

	render() {
		const { course, items: itemsProp, surveys } = this.props;

		const loading = !course;
		const items = itemsProp.filter(x => this.filter(x.title));

		const columns = [
			{
				name: 'name',
				classes: { name: 'name', ...columnClasses },
				display: t('name'),
				sortFn: sortOnTitle,
			},
			{
				name: 'publish',
				classes: { name: 'publish', ...columnClasses },
				display: t('publish'),
				sortFn: (a, b) => {
					const { isPublished: aPublished } = a;
					const { isPublished: bPublished } = b;

					return aPublished && !bPublished
						? 1
						: aPublished === bPublished
						? sortOnTitle(a, b)
						: -1;
				},
			},
			{
				name: 'modified',
				classes: { name: 'last-modified', ...columnClasses },
				display: t('lastModified'),
				sortFn: (a, b) => {
					const aModified = a.getLastModified();
					const bModified = b.getLastModified();

					return aModified < bModified
						? -1
						: aModified === bModified
						? 0
						: 1;
				},
			},
		];

		return (
			<div className="nti-web-course-resources">
				{items.length !== 0 ? (
					<Table.ListTable
						classes={tableClasses}
						items={items}
						columns={columns}
						renderItem={this.renderItem}
					/>
				) : loading ? (
					<Loading.Mask message={t('loading')} />
				) : (
					<EmptyState
						header={t('emptyHeader')}
						subHeader={
							surveys
								? t('emptyMessageSurvey')
								: t('emptyMessage')
						}
					/>
				)}
			</div>
		);
	}
}
