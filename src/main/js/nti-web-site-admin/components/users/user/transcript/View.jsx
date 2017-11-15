import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

import LoadMore from '../../../common/LoadMore';
import ErrorMessage from '../../../common/ErrorMessage';

import Item from './Item';
import Store from './Store';

const DEFAULT_TEXT = {
	error: 'Unable to load transcript.'
};
const t = scoped('nti-site-admin.users.user.Transcript', DEFAULT_TEXT);

const propMap = {
	items: 'items',
	loading: 'loading',
	error: 'error',
	hasNextPage: 'hasNextPage',
	loadingNextPage: 'loadingNextPage'
};

@Store.connect(propMap)
export default class SiteAdminUserTranscript extends React.Component {
	static propTypes = {
		user: PropTypes.object,
		store: PropTypes.object,

		items: PropTypes.array,
		loading: PropTypes.bool,
		error: PropTypes.any,
		hasNextPage: PropTypes.bool,
		loadingNextPage: PropTypes.bool
	}

	get store () {
		return this.props.store;
	}


	componentDidMount () {
		const {user} = this.props;

		this.store.loadTranscript(user);
	}


	componentWillUnmount () {
		const {user} = this.props;

		this.store.unloadTranscript(user);
	}


	componentWillReceiveProps (nextProps) {
		const {user:newUser} = nextProps;
		const {user: oldUser} = this.props;

		if (newUser !== oldUser) {
			this.store.loadTranscript(newUser);
		}
	}


	onLoadNext = () => {
		const {hasNextPage, loadingNextPage} = this.props;

		if (hasNextPage && !loadingNextPage) {
			this.store.loadNextPage();
		}
	}


	render () {
		const {loading, error} = this.props;

		return (
			<div className="site-admin-user-transcripts">
				{loading && (<Loading.Mask />)}
				{!loading && this.renderItems()}
				{!loading && !error && this.renderLoadNext()}
				{error && (<ErrorMessage>{t('error')}</ErrorMessage>)}
			</div>
		);
	}

	renderItems () {
		const {items} = this.props;

		if (!items || !items.length) { return this.renderEmptyState(); }

		return (
			<ul>
				{items.map((item, index) => {
					return (
						<li key={index}>
							<Item item={item} />
						</li>
					);
				})}
			</ul>
		);
	}


	renderEmptyState () {

	}


	renderLoadNext () {
		const {hasNextPage, loadingNextPage} = this.props;

		return (
			<LoadMore hasMore={hasNextPage} loading={loadingNextPage} onLoadMore={this.onLoadNext} />
		);
	}
}

