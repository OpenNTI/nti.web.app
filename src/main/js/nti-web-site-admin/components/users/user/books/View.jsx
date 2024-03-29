import './View.scss';
import React from 'react';
import PropTypes from 'prop-types';

import { List, Loading } from '@nti/web-commons';
import { decorate } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import { LinkTo } from '@nti/web-routing';

import ErrorMessage from '../../../common/ErrorMessage';
import Card from '../../../common/Card';

import BookListItem from './BookListItem';
import Store from './Store';

const DEFAULT_TEXT = {
	error: 'Unable to load transcript.',
	noBooks: 'This user does not have access to any books',
};
const t = scoped('nti-site-admin.users.user.Transcript', DEFAULT_TEXT);

class SiteAdminUserBooks extends React.Component {
	static propTypes = {
		user: PropTypes.object,
		store: PropTypes.object,

		items: PropTypes.array,
		loading: PropTypes.bool,
		error: PropTypes.any,
	};

	get store() {
		return this.props.store;
	}

	componentDidMount() {
		const { user } = this.props;

		this.store.loadBooks(user);
	}

	componentWillUnmount() {
		const { user } = this.props;

		this.store.unloadBooks(user);
	}

	componentDidUpdate(oldProps) {
		const { user: newUser } = this.props;
		const { user: oldUser } = oldProps;

		if (newUser !== oldUser) {
			this.store.loadBooks(newUser);
		}
	}

	render() {
		const { loading, error } = this.props;

		return (
			<div className="site-admin-user-transcripts">
				{loading && <Loading.Mask />}
				{!loading && this.renderItems()}
				{error && <ErrorMessage>{t('error')}</ErrorMessage>}
			</div>
		);
	}

	renderItems() {
		const { items } = this.props;

		if (!items || !items.length) {
			return this.renderEmptyState();
		}

		return (
			<Card>
				<List.Unadorned>
					{items.map((item, index) => {
						return (
							<li key={index}>
								<LinkTo.Object
									object={item}
									context="site-admin.users.user-books.list"
								>
									<BookListItem book={item.Bundle} />
								</LinkTo.Object>
							</li>
						);
					})}
				</List.Unadorned>
			</Card>
		);
	}

	renderEmptyState() {
		return <div className="empty-state">{t('noBooks')}</div>;
	}
}

export default decorate(SiteAdminUserBooks, [
	Store.connect({ items: 'items', loading: 'loading', error: 'error' }),
]);
