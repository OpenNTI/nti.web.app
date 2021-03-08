import './View.scss';
import React from 'react';
import PropTypes from 'prop-types';

import { List, Loading, Button } from '@nti/web-commons';
import { decorate } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import { LinkTo } from '@nti/web-routing';
import { EnrollmentListItem, Enrollment } from '@nti/web-course';

import ErrorMessage from '../../../common/ErrorMessage';
import Card from '../../../common/Card';

import Store from './Store';

const DEFAULT_TEXT = {
	error: 'Unable to load courses.',
	noCourses: 'This user is not enrolled in any courses',
	manage: 'Manage Courses',
};
const t = scoped('nti-site-admin.users.user.courses.View', DEFAULT_TEXT);

const propMap = {
	items: 'items',
	loading: 'loading',
	error: 'error',
};

class SiteAdminUserCourses extends React.Component {
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

		this.store.loadTranscript(user);
	}

	componentWillUnmount() {
		const { user } = this.props;

		this.store.unloadTranscript(user);
	}

	componentDidUpdate(prevProps) {
		const { user: newUser } = this.props;
		const { user: oldUser } = prevProps;

		if (newUser !== oldUser) {
			this.store.loadTranscript(newUser);
		}
	}

	onEnrollmentChange = () => {
		const { user } = this.props;

		this.store.loadTranscript(user);
	};

	render() {
		const { loading, error } = this.props;

		return (
			<div className="site-admin-user-transcripts">
				{loading && <Loading.Mask />}
				{!loading && this.renderControls()}
				{!loading && this.renderItems()}
				{error && <ErrorMessage>{t('error')}</ErrorMessage>}
			</div>
		);
	}

	renderControls() {
		const { user } = this.props;

		if (!user.hasLink('EnrollUser')) {
			return null;
		}

		return (
			<div className="user-transcript-controls">
				<Enrollment.Admin.Prompt.Trigger
					user={user}
					onChange={this.onEnrollmentChange}
				>
					<Button rounded>{t('manage')}</Button>
				</Enrollment.Admin.Prompt.Trigger>
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
									context="site-admin.users.user-transcript.list"
								>
									<EnrollmentListItem
										enrollment={item}
										onChange={this.onEnrollmentChange}
									/>
								</LinkTo.Object>
							</li>
						);
					})}
				</List.Unadorned>
			</Card>
		);
	}

	renderEmptyState() {
		return <div className="empty-state">{t('noCourses')}</div>;
	}
}

export default decorate(SiteAdminUserCourses, [Store.connect(propMap)]);
