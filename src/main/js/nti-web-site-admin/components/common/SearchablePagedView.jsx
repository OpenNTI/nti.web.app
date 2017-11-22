import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {ContextIndicator} from 'nti-web-search';
import {Loading, EmptyState} from 'nti-web-commons';

import LoadMore from './LoadMore';
import ErrorMessage from './ErrorMessage';


export default class SearchablePagedView extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		items: PropTypes.array,
		searchTerm: PropTypes.string,
		loading: PropTypes.bool,
		hasNextPage: PropTypes.bool,
		loadingNextPage: PropTypes.bool,
		error: PropTypes.any,

		loadNextPage: PropTypes.func,
		renderItem: PropTypes.func.isRequired,
		renderEmptyState: PropTypes.func,
		getString: PropTypes.func.isRequired
	}


	get getString () {
		return this.props.getString;
	}


	onLoadMore = () => {
		const {loadNextPage, hasNextPage, loadingNextPage} = this.props;

		if (hasNextPage && !loadingNextPage && loadNextPage) {
			loadNextPage();
		}
	}


	render () {
		const {loading, error, className} = this.props;

		return (
			<div className={cx('site-admin-searchable-page-view', className)}>
				<ContextIndicator className="context-indicator" backLabel={this.getString('backLabel')} />
				{loading && (<div className="loading-mask"><Loading.Mask /></div>)}
				{!loading && this.renderItems()}
				{!loading && !error && this.renderLoadNext()}
				{error && this.renderError()}
			</div>
		);
	}

	renderItems () {
		const {items, renderItem} = this.props;

		if (!items || !items.length) {
			return this.renderEmptyState();
		}

		return (
			<ul>
				{items.map((item, index) => {
					return (
						<li key={index}>
							{renderItem(item)}
						</li>
					);
				})}
			</ul>
		);
	}


	renderEmptyState () {
		const {getString} = this;
		const {renderEmptyState, searchTerm} = this.props;

		if (renderEmptyState) { return renderEmptyState(); }

		const header = searchTerm ? getString('emptySearch') : getString('empty');

		return (
			<EmptyState header={header} />
		);
	}


	renderLoadNext () {
		const {hasNextPage, loadingNextPage} = this.props;

		return (
			<LoadMore hasMore={hasNextPage} loading={loadingNextPage} onLoadMore={this.onLoadMore} />
		);
	}

	renderError () {
		return (
			<ErrorMessage>
				{this.getString('error')}
			</ErrorMessage>
		);
	}
}
