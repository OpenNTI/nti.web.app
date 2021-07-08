import './RecentlyCreatedUsers.scss';
import React from 'react';

import { scoped } from '@nti/lib-locale';
import { DateTime, Loading } from '@nti/web-commons';
import { getService } from '@nti/web-client';

import { EntityList } from './ItemList';

const LABELS = {
	title: 'Recently Created Users',
	name: 'Name',
	value: '',
	noItems: 'No users found',
};

const t = scoped(
	'nti-web-site-admins.components.dashboard.widgets.recentlycreatedusers',
	LABELS
);
const PAGE_SIZE = 4;

export default class RecentlyCreatedUsers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			pageNumber: 0,
		};
	}

	componentDidMount() {
		this.setState({ items: [] }, () => {
			this.loadData();
		});
	}

	async loadData() {
		const service = await getService();

		const userWorkspace = service.Items.filter(x =>
			x.hasLink('SiteUsers')
		)[0];

		if (!userWorkspace) {
			this.setState({
				loading: false,
				items: [],
				error: 'Could not load users',
			});

			return;
		}

		try {
			const users = await service.getBatch(
				userWorkspace.getLink('SiteUsers'),
				{ sortOn: 'createdTime', sortOrder: 'descending', batchSize: 4 }
			);

			this.setState({
				loading: false,
				totalCount: users.Total,
				allItems: users.Items,
				items: users.Items.slice(0, PAGE_SIZE).map(x => {
					return {
						entity: x,
						name: x.alias,
						description:
							'Created ' +
							DateTime.format(
								new Date(x.getCreatedTime()),
								DateTime.WEEKDAY_MONTH_NAME_DAY_YEAR_TIME
							),
					};
				}),
			});
		} catch (e) {
			this.setState({
				loading: false,
				items: [],
				error: e.message || 'There was an error loading users',
			});
		}
	}

	renderHeader() {
		return (
			<div className="header">
				<div className="title">{t('title')}</div>
			</div>
		);
	}

	renderItems() {
		const { items, loading } = this.state;

		if (loading) {
			return <Loading.Mask />;
		} else if (items && items.length === 0) {
			return <div className="no-items">{t('noItems')}</div>;
		}

		return <EntityList items={items} />;
	}

	render() {
		return (
			<div className="dashboard-list-widget recently-created-users">
				{this.renderHeader()}
				{this.renderItems()}
			</div>
		);
	}
}
