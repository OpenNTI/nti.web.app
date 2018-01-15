import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {DateTime, Loading, DisplayName, Avatar} from 'nti-web-commons';
import {getService} from 'nti-web-client';
import cx from 'classnames';

const LABELS = {
	title: 'Top Learners',
	name: 'Name',
	value: '',
	noItems: 'No top learners found'
};

const t = scoped('nti-web-site-admins.components.common.activeusers', LABELS);
const BATCH_SIZE = 4;

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
				<DisplayName className="name" entityId={item.name}/>
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

export default class ActiveUsers extends React.Component {
	static propTypes = {
		entity: PropTypes.object
	}

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

	async getLink (service, link) {
		// if given a specific link, default to that
		if(link) {
			return link;
		}

		const {entity} = this.props;

		// if provided an entity with analytics, pull that link
		if(entity) {
			const entityAnalyticsLink = entity.getLink('analytics');
			const entityAnalytics = await service.get(entityAnalyticsLink);

			return entityAnalytics && entityAnalytics.Links
				&& entityAnalytics.Links.filter(x => x.rel === 'active_users')[0].href + '?batchSize=' + BATCH_SIZE + '&batchPage=0';
		}

		// if no other link or entity is provided, use the global workspace
		const analyticsWorkspace = service.getWorkspace('Analytics');
		return analyticsWorkspace && analyticsWorkspace.getLink('active_users') + '?batchSize=' + BATCH_SIZE + '&batchPage=0';
	}

	async loadData (link) {
		const service = await getService();
		const activeUsersLink = await this.getLink(service, link);
		const activeUsers = activeUsersLink ? await service.get(activeUsersLink) : {};

		this.setState({
			loading: false,
			totalCount: activeUsers.ItemCount,
			prevLink: activeUsers && activeUsers.Links && (activeUsers.Links.filter(x => x.rel === 'batch-prev')[0] || {}).href,
			nextLink: activeUsers && activeUsers.Links && (activeUsers.Links.filter(x => x.rel === 'batch-next')[0] || {}).href,
			items: activeUsers.Items.map(x => {
				return {
					...x,
					name: x.Username,
					description: 'Created ' + DateTime.format(new Date(x.CreatedTime  * 1000), 'LLLL')
				};
			})
		});
	}

	onPrevious = () => {
		const { pageNumber, prevLink } = this.state;

		if(pageNumber === 0) {
			return;
		}

		this.setState({
			pageNumber: pageNumber - 1
		}, () => {
			this.loadData(prevLink);
		});
	}


	onNext = () => {
		const { pageNumber, totalPages, nextLink } = this.state;

		if(pageNumber >= totalPages) {
			return;
		}

		this.setState({
			pageNumber: pageNumber + 1
		}, () => {
			this.loadData(nextLink);
		});
	}


	renderTotal () {
		const { totalCount } = this.state;

		if(totalCount) {
			return (
				<div className="total">
					{this.state.totalCount}
				</div>
			);
		}

		return null;
	}

	renderHeader () {
		const prevClassName = cx('page-control', 'previous', { disabled: !this.state.prevLink });
		const nextClassName = cx('page-control', 'next', { disabled: !this.state.nextLink });

		return (
			<div className="header">
				<div className="title">
					{t('title')}
				</div>
				{this.renderTotal()}
				<div className="pager">
					<div className={prevClassName} onClick={this.onPrevious}>
						<i className="icon-chevron-left"/>
					</div>
					<div className={nextClassName} onClick={this.onNext}>
						<i className="icon-chevron-right"/>
					</div>
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
				<div className="items-header">
					<div className="column-header name">
						{t('name')}
					</div>
					<div className="column-header value">
						{''}
					</div>
				</div>
				<div className="items">
					{(items || []).map(this.renderItem)}
				</div>
			</div>
		);
	}

	render () {
		return (<div className="dashboard-list-widget active-users">
			{this.renderHeader()}
			{this.renderItems()}
		</div>);
	}
}
