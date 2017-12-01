import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {DateTime, Loading, Avatar} from 'nti-web-commons';
import {getService, User} from 'nti-web-client';

const LABELS = {
	title: 'Recently Created Users',
	name: 'Name',
	value: ''
};

const t = scoped('nti-web-site-admins.components.dashboard.widgets.recentlycreatedusers', LABELS);
const PAGE_SIZE = 4;

class Item extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	renderImg () {
		const { item } = this.props;

		return <Avatar className="item-image" entityId={item.Username}/>;
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

	loadData () {
		// TODO: Get server to handle sorting, then we can just take the first X items rather than
		// retrieving all, sorting and splicing
		getService().then(service => {
			User.resolve({entity: service.SiteCommunity}).then(community => {
				const membersLink = community.getLink('members');

				return service.getBatch(membersLink);
			}).then((users) => {
				const sorted = [...users.Items];
				sorted.sort(function (a, b) {
					// sort by CreatedTime in descending order
					if(a.getCreatedTime() < b.getCreatedTime()) {
						return 1;
					}

					if(a.getCreatedTime() > b.getCreatedTime()) {
						return -1;
					}

					return 0;
				});

				this.setState({
					loading: false,
					totalCount: users.Total,
					allItems: sorted,
					items: sorted.slice(0, PAGE_SIZE).map(x => {
						return {
							...x,
							name: x.alias,
							description: 'Created ' + DateTime.format(new Date(x.getCreatedTime()), 'LLLL')
						};
					})
				});
			});
		});
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

		return (
			<div className="items-container">
				<div className="items">
					{(items || []).map(this.renderItem)}
				</div>
			</div>
		);
	}

	render () {
		return (<div className="dashboard-list-widget recently-created-users">
			{this.renderHeader()}
			{this.renderItems()}
		</div>);
	}
}
