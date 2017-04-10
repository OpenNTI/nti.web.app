import React from 'react';
import {scoped} from 'nti-lib-locale';
import {Table, EmptyState} from 'nti-web-commons';
import PropTypes from 'prop-types';

import ListItem from './ListItem';

const DEFAULT_TEXT = {
	name: 'Name',
	publish: 'Publish Status',
	lastModified: 'Last Modified'
};

const t = scoped('COURSE_RESOURCES_READINGS', DEFAULT_TEXT);

function sortOnTitle (a, b) {
	return (a.title || '').localeCompare(b.title);
}

const tableClasses = {
	className: 'course-resources-readings ascending',
	headerClassName: 'course-resources-header',
	bodyClassName: 'course-resources-body'
};

const columnClasses = {
	asc: 'sort-asc',
	desc: 'sort-desc',
	inactive: 'sort-inactive',
	active: 'sort-active',
	default: 'sort-default'
};

function getReadings (course) {
	const {ContentPackageBundle} = course || {};
	const {ContentPackages} = ContentPackageBundle || {};

	return (ContentPackages || []).filter(x => x.isRenderable);
}


Readings.propTypes = {
	course: PropTypes.object,
	filter: PropTypes.func,
	gotoResource: PropTypes.func
};

export default function Readings ({course, filter, gotoResource}) {
	const readings = getReadings(course).filter((x) => filter(x.title));

	const renderRow = (row, cols) => {
		return (
			<ListItem reading={row} gotoResource={gotoResource} columns={cols} />
		);
	};

	const columns = [
		{
			name: 'name',
			classes: Object.assign({
				name: 'name'
			}, columnClasses),
			display: t('name'),
			sortFn: sortOnTitle
		},
		{
			name: 'publish',
			classes: Object.assign({
				name: 'publish'
			}, columnClasses),
			display: t('publish'),
			sortFn: (a, b) => {
				const {isPublished:aPublished} = a;
				const {isPublished:bPublished} = b;

				return aPublished && !bPublished ? 1 : aPublished === bPublished ? sortOnTitle(a, b) : -1;
			}
		},
		{
			name: 'modified',
			classes: Object.assign({
				name: 'last-modified'
			}, columnClasses),
			display: t('lastModified'),
			sortFn: (a, b) => {
				const aModified = a.getLastModified();
				const bModified = b.getLastModified();

				return aModified < bModified ? -1 : aModified === bModified ? 0 : 1;
			}
		}
	];

	return readings.length !== 0 ? (
		<Table.ListTable
			classes={tableClasses}
			rows={readings}
			columns={columns}
			renderRow={renderRow}
		/>
	) : <EmptyState
			header="This folder is empty."
			subHeader="Click the button above to create a new reading."
		/>;
}
