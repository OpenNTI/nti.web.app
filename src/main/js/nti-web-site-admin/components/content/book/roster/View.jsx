import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';
import {searchable} from '@nti/web-search';

import ErrorMessage from '../../../common/ErrorMessage';
import Pager from '../../../common/Pager';
import Card from '../../../common/Card';

import Item from './Item';
import BookRosterStore from './BookRosterStore';

const DEFAULT_TEXT = {
	empty: 'No users have access to this book.',
	loadMore: 'Load More'
};
const t = scoped('nti-site-admin.courses.course.info.Roster', DEFAULT_TEXT);

export default
@searchable()
@BookRosterStore.connect({
	loading: 'loading',
	items: 'items',
	error: 'error',
	numPages: 'numPages',
	pageNumber: 'pageNumber'
})
class SiteAdminBookRoster extends React.Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		course: PropTypes.object,
		items: PropTypes.array,
		loading: PropTypes.bool,
		error: PropTypes.string,
		numPages: PropTypes.number,
		pageNumber: PropTypes.number
	}

	componentDidMount () {
		this.props.store.loadBook(this.props.course);
	}

	render () {
		const {loading, error, items, store, numPages, pageNumber} = this.props;

		return (
			<div className="site-admin-course-roster">
				{loading && (<div className="loading-mask"><Loading.Mask /></div>)}
				{error && (<ErrorMessage>{t('error')}</ErrorMessage>)}
				{!loading && items && this.renderItems(items)}
				{!loading && !error && <Pager store={store} numPages={numPages} pageNumber={pageNumber}/>}
			</div>
		);
	}

	renderItems (items) {
		return (
			<Card>
				<ul>
					{items.map((item, index) => {
						return (
							<li key={index}>
								<LinkTo.Object object={item} context="site-admin.courses.book-roster.list">
									<Item item={item} />
								</LinkTo.Object>
							</li>
						);
					})}
				</ul>
			</Card>
		);
	}

}
