import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from '@nti/web-commons';
import {scoped} from '@nti/lib-locale';
import {LinkTo} from '@nti/web-routing';
import {EnrollmentListItem} from '@nti/web-course';

import ErrorMessage from '../../../common/ErrorMessage';
import Card from '../../../common/Card';

import Store from './Store';

const DEFAULT_TEXT = {
	error: 'Unable to load transcript.'
};
const t = scoped('nti-site-admin.users.user.Transcript', DEFAULT_TEXT);

const propMap = {
	items: 'items',
	loading: 'loading',
	error: 'error',
};

@Store.connect(propMap)
export default class SiteAdminUserTranscript extends React.Component {
	static propTypes = {
		user: PropTypes.object,
		store: PropTypes.object,

		items: PropTypes.array,
		loading: PropTypes.bool,
		error: PropTypes.any,
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


	componentDidUpdate (prevProps) {
		const {user:newUser} = this.props;
		const {user: oldUser} = prevProps;

		if (newUser !== oldUser) {
			this.store.loadTranscript(newUser);
		}
	}


	render () {
		const {loading, error} = this.props;

		return (
			<div className="site-admin-user-transcripts">
				{loading && (<Loading.Mask />)}
				{!loading && this.renderItems()}
				{error && (<ErrorMessage>{t('error')}</ErrorMessage>)}
			</div>
		);
	}

	renderItems () {
		const {items} = this.props;

		if (!items || !items.length) { return this.renderEmptyState(); }

		return (
			<Card>
				<ul>
					{items.map((item, index) => {
						return (
							<li key={index}>
								<LinkTo.Object object={item} context="site-admin.users.user-transcript.list">
									<EnrollmentListItem enrollment={item} />
								</LinkTo.Object>
							</li>
						);
					})}
				</ul>
			</Card>
		);
	}


	renderEmptyState () {

	}
}
