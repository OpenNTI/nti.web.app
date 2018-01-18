import React from 'react';
import PropTypes from 'prop-types';
import {searchable, contextual} from 'nti-web-search';
import {scoped} from 'nti-lib-locale';
import {LinkTo} from 'nti-web-routing';

import SearchablePagedView from '../../common/SearchablePagedView';

import Store from './BookStore';
import BookItem from './BookItem';

const store = new Store();//FIXME: I would prefer if the store could be constructed on first use/mount... instead of statically.
const propMap = {
	items: 'items',
	searchTerm: 'searchTerm',
	loading: 'loading',
	hasNextPage: 'hasNextPage',
	loadingNextPage: 'loadingNextPage',
	loadNextPage: 'loadNextPage',
	error: 'error'
};

const DEFAULT_TEXT = {
	books: 'Books',
	empty: 'No Books',
	emptySearch: 'No books found. Please refine your search.',
	backLabel: 'View all books',
	error: 'Unable to load books.'
};
const t = scoped('siteadmin.components.course.list.booklist', DEFAULT_TEXT);

@contextual(t('books'))
@searchable(store, propMap)
export default class BookListView extends React.Component {
	static propTypes = {
		searchTerm: PropTypes.string,
		hasNextPage: PropTypes.bool,
		loadNextPage: PropTypes.func,
		loadingNextPage: PropTypes.bool,
		store: PropTypes.object
	}

	componentDidMount () {
		store.load();
	}

	onLoadNextPage = () => {
		this.props.loadNextPage();
	}

	render () {
		return (
			<div className="site-admin-course">
				<div className="course-list">
					<SearchablePagedView
						{...this.props}
						className="site-admin-course-list"
						renderItem={this.renderItem}
						loadNextPage={this.onLoadNextPage}
						getString={t}
					/>
				</div>
			</div>
		);
	}


	renderItem = (item) => {
		return (
			<LinkTo.Object object={item} context="site-admin.book-list-item">
				<BookItem item={item} />
			</LinkTo.Object>
		);
	}
}
