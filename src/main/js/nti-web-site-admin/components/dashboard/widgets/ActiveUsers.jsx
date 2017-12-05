import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {DateTime, Loading, Avatar} from 'nti-web-commons';
import {getService, User} from 'nti-web-client';
import cx from 'classnames';

const LABELS = {
	title: 'Top Learners',
	name: 'Name',
	value: '',
	noItems: 'No users found'
};

const t = scoped('nti-web-site-admins.components.dashboard.widgets.activeusers', LABELS);
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

export default class PopularCourses extends React.Component {
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

	loadData (link) {
		// TODO: This is only a temporary call to load user data.  When there is an actual active users
		// api to hit, switch over to that.  This is just for prototyping
		// Also, maybe move to store?
		getService().then(service => {
			User.resolve({entity: service.SiteCommunity}).then(community => {
				const membersLink = community.getLink('members');

				const getBatchLink = link ? link : membersLink + '?batchSize=' + PAGE_SIZE + '&batchStart=0';

				return service.getBatch(getBatchLink);
			}).then((users) => {
				this.setState({
					loading: false,
					totalCount: users.Total,
					prevLink: (users.Links.filter(x => x.rel === 'batch-prev')[0] || {}).href,
					nextLink: (users.Links.filter(x => x.rel === 'batch-next')[0] || {}).href,
					items: users.Items.map(x => {
						return {
							...x,
							name: x.alias,
							description: 'Created ' + DateTime.format(new Date(x.CreatedTime  * 1000), 'LLLL')
						};
					})
				});
			}).catch((resp) => {
				// can't get active users data, set items to empty
				this.setState({
					loading: false,
					items: []
				});
			});
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
