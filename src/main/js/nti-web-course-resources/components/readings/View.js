import React from 'react';
import {scoped} from 'nti-lib-locale';
import {Table} from 'nti-web-commons';

import ListItem from './ListItem';

const DEFAULT_TEXT = {
	name: 'Name',
	publish: 'Publish Status',
	lastModified: 'Last Modified'
};

const t = scoped('COURSE_RESOURCES_READINGS', DEFAULT_TEXT);

function sortOnTitle (a, b) {
	return a.title.localeCompare(b.title);
}

const CELLS = [
	{
		name: 'name',
		className: 'name',
		display: t('name'),
		sortFn: sortOnTitle
	},
	{
		name: 'publish',
		className: 'publish',
		display: t('publish'),
		sortFn: (a, b) => {
			const {isPublished:aPublished} = a;
			const {isPublished:bPublished} = b;

			return aPublished && !bPublished ? -1 : aPublished === bPublished ? sortOnTitle(a, b) : -1;
		}
	},
	{
		name: 'modified',
		className: 'last-modified',
		display: t('lastModified'),
		sortFn: (a, b) => {
			const aModified = a.getLastModified();
			const bModified = b.getLastModified();

			return aModified < bModified ? -1 : aModified === bModified ? 0 : -1;
		}
	}
];

function getReadings (course) {
	const {ContentPackageBundle} = course || {};
	const {ContentPackages} = ContentPackageBundle || {};

	return (ContentPackages || []).filter(x => x.isRenderable);
}


Readings.propTypes = {
	course: React.PropTypes.object,
	gotoResource: React.PropTypes.func
};
export default function Readings ({course, gotoResource}) {
	const readings = getReadings(course);

	const renderItem = (item) => {
		return (
			<ListItem reading={item} gotoResource={gotoResource} />
		);
	};

	debugger;

	return (
		<Table.ListTable
			className="course-resources-readings"
			headerClassName="course-resources-header"
			bodyClassName="course-resources-body"
			items={readings}
			renderItem={renderItem}
			cells={CELLS}
		/>
	);
}
