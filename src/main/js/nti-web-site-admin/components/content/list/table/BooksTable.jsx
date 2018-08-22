import React from 'react';
import PropTypes from 'prop-types';
import {Table, Loading} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {searchable, contextual} from '@nti/web-search';

import {BookName, CreatedTime} from './columns';
import Store from './BooksStore';
import Pager from './Pager';
import EmptyState from './EmptyState';

const t = scoped('nti-web-site-admin.content.list.table.BooksTable', {
	title: 'Books',
	emptyMessage: 'There are no books'
});

export default
@searchable()
@contextual(t('title'))
@Store.connect({
	loading: 'loading',
	items: 'items',
	error: 'error',
	sortOn: 'sortOn',
	sortDirection: 'sortDirection',
	pageNumber: 'pageNumber',
	numPages: 'numPages'
})
class BooksTable extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		items: PropTypes.array,
		error: PropTypes.string,
		loading: PropTypes.bool,
		sortOn: PropTypes.string,
		sortDirection: PropTypes.string,
		pageNumber: PropTypes.number,
		numPages: PropTypes.number
	}

	items = []

	columns = [
		BookName,
		CreatedTime
	]

	state = {
		sortDirection: Table.ASCENDING,
		sortOn: 'name'
	}

	onSortChange = (sortKey, sortDirection) => {
		this.props.store.setSort(sortKey, sortDirection);
	}

	renderControls () {
		return (
			<div className="controls">
				{/* <div className="button change-role" onClick={this.showChangeRolesDialog}>{t('changeRole')}</div> */}
			</div>
		);
	}

	renderHeader () {
		return (
			<div className="header">
				<div className="title">{t('title')}</div>
			</div>
		);
	}

	render () {
		const {store, sortOn, sortDirection, items, error, loading, numPages, pageNumber} = this.props;

		return (
			<div className="content-table-container">
				{loading && <Loading.Mask/>}
				{!loading && error && <div className="error">{error}</div>}
				{!error && !loading && (!items || items.length === 0) && <EmptyState message={t('emptyMessage')}/>}
				{!loading && items && items.length > 0 && (
					<div>
						{this.renderHeader()}
						<Table.Table
							store={store}
							items={items || []}
							sortDirection={sortDirection}
							sortOn={sortOn}
							columns={this.columns}
							onSortChange={this.onSortChange}
						/>
						<Pager store={store} numPages={numPages} pageNumber={pageNumber}/>
					</div>
				)}
			</div>
		);
	}
}
