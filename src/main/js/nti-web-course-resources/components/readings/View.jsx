import './View.scss';
import React from 'react';
import PropTypes from 'prop-types';

import { scoped } from '@nti/lib-locale';
import { WithSearch } from '@nti/web-search';
import { Table, EmptyState, Loading, Hooks, Errors } from '@nti/web-commons';

import ListItem from './ListItem';

const {useResolver} = Hooks;
const {isPending, isErrored, isResolved} = useResolver;

const DEFAULT_TEXT = {
	name: 'Name',
	publish: 'Publish Status',
	lastModified: 'Last Modified',
	loading: 'Loading',
	emptyHeader: 'This folder is empty.',
	emptyMessage: 'Click the button above to create a new reading.',
	readings: 'Readings',
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

function getFilter (term) {
	if (!term) { return () => true; }

	const regex = new RegExp(term, 'i');

	return (c) => regex.test(c.title);
}

Readings.propTypes = {
	course: PropTypes.object,
	gotoResource: PropTypes.func,
	searchTerm: PropTypes.string
};
function Readings ({course, gotoResource, searchTerm}) {
	const resolver = useResolver(async () => {
		const items = await course.ContentPackageBundle.getContentPackages();

		return items.filter(i => i.isRenderable);
	}, [course]);

	const loading = isPending(resolver) || !course;
	const error = isErrored(resolver) ? resolver : null;
	const readings = isResolved(resolver) ? resolver : null;

	const filter = getFilter(searchTerm);
	const items = (readings ?? []).filter(filter);

	const empty = !error && items.length === 0;

	const renderItem = (item, cols) => {
		return (
			<ListItem
				reading={item}
				gotoResource={gotoResource}
				columns={cols}
			/>
		);
	};

	return (
		<div className="nti-web-course-resources">
			<Loading.Placeholder loading={loading} fallback={<Loading.Spinner.Large />}>
				{error && (<Errors.Message error={error} />)}
				{empty && (
					<EmptyState
						header={t('emptyHeader')}
						subHeader={t('emptyMessage')}
					/>
				)}
				{!empty && (
					<Table.ListTable
						classes={tableClasses}
						items={items}
						columns={columns}
						renderItem={renderItem}
					/>
				)}
			</Loading.Placeholder>
		</div>
	)
}

export default WithSearch(Readings, {label: t('readings')});

