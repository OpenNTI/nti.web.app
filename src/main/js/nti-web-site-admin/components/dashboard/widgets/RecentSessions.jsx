import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DateTime, Loading, Avatar} from '@nti/web-commons';
import {getService, User} from '@nti/web-client';
import {getLink} from '@nti/lib-interfaces';

const ANALYTICS = 'Analytics';
const SESSIONS_LINK = 'sessions';
const LIMIT = 10;
const PAGE_SIZE = 6;

const LABELS = {
	title: 'Recent Sessions',
	name: 'Name',
	value: '',
	noItems: 'No sessions found'
};

const t = scoped('nti-web-site-admins.components.dashboard.widgets.recentsessions', LABELS);

class Item extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	renderImg () {
		const { item } = this.props;

		return <Avatar className="item-image" entity={item.user}/>;
	}

	getDurationString (duration) {
		const hours = Math.floor(duration / (60 * 60));
		const minutes = Math.floor((duration - hours * 60 * 60) / 60);
		const seconds = (duration - hours * 60 * 60 - minutes * 60);

		return (hours > 0 ? hours + 'h ' : '') + (minutes > 0 || hours > 0 ? minutes + 'm ' : '') + (seconds + 's');
	}

	renderInfo () {
		const { item } = this.props;

		const duration = item.SessionEndTime ? this.getDurationString(item.SessionEndTime - item.SessionStartTime) : 'Ongoing';

		return (
			<div className="info">
				<div className="main-info">
					<div className="name">
						{item.user.alias}
					</div>
					<div className="duration">
						{duration}
					</div>
				</div>
				<div className="start-time">
					{DateTime.fromNow(item.SessionStartTime * 1000)}
				</div>
			</div>
		);
	}

	renderMobileIcon () {
		return (
			<div className="mobile-icon">
				<div className="top"/>
				<div className="screen"/>
				<div className="base"/>
			</div>
		);
	}

	renderAppIcon () {
		return (
			<div className="app-icon">
				<div className="screen"/>
				<div className="base"/>
			</div>
		);
	}

	renderValue () {
		const { item } = this.props;

		return (
			<div className="value">
				{item.appType === 'mobile' ? this.renderMobileIcon() : this.renderAppIcon()}
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

export default class RecentSessions extends React.Component {
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

	resolveUser (userName) {
		return User.resolve({entity: userName})
			.then(user => user)
			.catch(() => {
				return {
					alias: userName
				};
			});
	}

	getDataWithUsers (items) {
		let requests = [];

		items.forEach(u => {
			requests.push(this.resolveUser(u.Username));
		});

		return Promise.all(requests).then(results => {
			let newItems = [];

			for(let i = 0; i < results.length; i++) {
				newItems.push({...items[i], user: results[i]});
			}

			return newItems;
		});
	}

	getAppType (session) {
		if (/android|blackberry|iphone|ipod|mobile|webos/i.test(session.userAgent) ) {
			return 'mobile';
		}

		return 'app';
	}

	async loadData () {
		try{
			const service = await getService();
			const sessionsCollection = service.getWorkspace(ANALYTICS);
			const link = getLink(sessionsCollection, SESSIONS_LINK);
			const sessions = await service.get(link + '?limit=' + LIMIT);

			const resolvedItems = await this.getDataWithUsers(sessions.Items.slice(0, PAGE_SIZE));

			this.setState({
				loading: false,
				allItems: sessions.Items,
				items: resolvedItems.map(x => {
					return {
						...x,
						appType: this.getAppType(x)
					};
				})
			});
		}
		catch (e) {
			this.setState({loading: false, items: [], error: e});
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
		return <Item key={item.SessionStartTime} item={item}/>;
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
			<div className="dashboard-list-widget recent-sessions">
				{this.renderHeader()}
				{this.renderItems()}
			</div>
		);
	}
}
