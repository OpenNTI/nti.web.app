import React from 'react';
import PropTypes from 'prop-types';
import { decorate } from '@nti/lib-commons';
import { Table, Loading } from '@nti/web-commons';
import { scoped } from '@nti/lib-locale';
import { searchable, contextual } from '@nti/web-search';

import Pager from '../../../common/Pager';
import SearchInfo from '../../../common/SearchInfo';

import { BookName, CreatedTime } from './columns';
import Store from './BooksStore';
import EmptyState from './EmptyState';

const t = scoped('nti-web-site-admin.content.list.table.BooksTable', {
	title: 'Books',
	emptyMessage: 'There are no books',
});

class BooksTable extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		items: PropTypes.array,
		error: PropTypes.string,
		loading: PropTypes.bool,
		sortOn: PropTypes.string,
		sortDirection: PropTypes.string,
		pageNumber: PropTypes.number,
		numPages: PropTypes.number,
		currentSearchTerm: PropTypes.string,
	};

	items = [];

	columns = [BookName, CreatedTime];

	state = {
		sortDirection: Table.ASCENDING,
		sortOn: 'name',
	};

	onSortChange = (sortKey, sortDirection) => {
		this.props.store.setSort(sortKey, sortDirection);
	};

	renderControls() {
		return (
			<div className="controls">
				{/* <div className="button change-role" onClick={this.showChangeRolesDialog}>{t('changeRole')}</div> */}
			</div>
		);
	}

	renderHeader() {
		return (
			<div className="header">
				<div className="title">{t('title')}</div>
			</div>
		);
	}

	render() {
		const {
			store,
			sortOn,
			sortDirection,
			items,
			error,
			loading,
			numPages,
			pageNumber,
			currentSearchTerm,
		} = this.props;

		return (
			<div className="content-table-container">
				{loading && <Loading.Mask />}
				{!loading && error && <div className="error">{error}</div>}
				{!error && !loading && (
					<SearchInfo searchTerm={currentSearchTerm} />
				)}
				{!error && !loading && (!items || items.length === 0) && (
					<EmptyState message={t('emptyMessage')} />
				)}
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
						<Pager
							store={store}
							numPages={numPages}
							pageNumber={pageNumber}
						/>
					</div>
				)}
			</div>
		);
	}
}

export default decorate(BooksTable, [
	searchable(),
	contextual(t('title')),
	Store.connect({
		loading: 'loading',
		items: 'items',
		error: 'error',
		sortOn: 'sortOn',
		sortDirection: 'sortDirection',
		pageNumber: 'pageNumber',
		numPages: 'numPages',
		currentSearchTerm: 'currentSearchTerm',
	}),
]);
