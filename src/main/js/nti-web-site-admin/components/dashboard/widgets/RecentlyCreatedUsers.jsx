import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime, Loading, Avatar} from '@nti/web-commons';
import {getService, User} from '@nti/web-client';

const LABELS = {
	title: 'Recently Created Users',
	name: 'Name',
	value: '',
	noItems: 'No users found'
};

const t = scoped('nti-web-site-admins.components.dashboard.widgets.recentlycreatedusers', LABELS);
const PAGE_SIZE = 4;

class Item extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	renderImg () {
		const { item } = this.props;

		return <Avatar className="item-image" entity={item.entity}/>;
	}

	renderInfo () {
		const { item } = this.props;

		return (
			<div className="info">
				<div className="name">
					{item.name}
				</div>
				<div className="description">
					{item.description}
				</div>
			</div>
		);
	}

	renderValue () {
		const { item } = this.props;

		return (
			<div className="value">
				{item.value}
			</div>
		);
	}

	render () {
		return (
			<div className="item">
				{this.renderImg()}
				{this.renderInfo()}
				{this.renderValue()}
			</div>
		);
	}
}

export default class RecentlyCreatedUsers extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			loading: true,
			pageNumber: 0
		};
	}

	componentDidMount () {
		this.setState({ items: [] }, () => {
			this.loadData();
		});
	}

	async loadData () {
		const service = await getService();

		const userWorkspace = service.Items.filter(x => x.hasLink('SiteUsers'))[0];

		if(!userWorkspace) {
			this.setState({
				loading: false,
				items: [],
				error: 'Could not load users'
			});

			return;
		}

		try {
			const users = await service.getBatch(userWorkspace.getLink('SiteUsers'), { sortOn: 'createdTime', sortOrder: 'descending', batchSize: 4});

			this.setState({
				loading: false,
				totalCount: users.Total,
				allItems: users.Items,
				items: users.Items.slice(0, PAGE_SIZE).map(x => {
					return {
						entity: x,
						name: x.alias,
						description: 'Created ' + DateTime.format(new Date(x.getCreatedTime()), 'LLLL')
					};
				})
			});
		}
		catch (e) {
			this.setState({
				loading: false,
				items: [],
				error: e.message || 'There was an error loading users'
			});
		}
	}

	renderHeader () {
		return (
			<div className="header">
				<div className="title">
					{t('title')}
				</div>
			</div>
		);
	}

	renderItem = (item, index) => {
		return <Item key={item.name + index} item={item}/>;
	}

	renderItems () {
		const { items, loading } = this.state;

		if(loading) {
			return <Loading.Mask/>;
		}
		else if(items && items.length === 0) {
			return <div className="no-items">{t('noItems')}</div>;
		}

		return (
			<div className="items-container">
				<div className="items">
					{(items || []).map(this.renderItem)}
				</div>
			</div>
		);
	}

	render () {
		return (
			<div className="dashboard-list-widget recently-created-users">
				{this.renderHeader()}
				{this.renderItems()}
			</div>
		);
	}
}
