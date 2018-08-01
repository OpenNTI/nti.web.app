import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Presentation, Loading} from '@nti/web-commons';
import {getService} from '@nti/web-client';
import cx from 'classnames';

const LABELS = {
	title: 'Popular Courses',
	name: 'Course Rank',
	value: 'Students',
	noItems: 'No courses found'
};

const t = scoped('nti-web-site-admins.components.dashboard.widgets.popularcourses', LABELS);
const PAGE_SIZE = 4;

class Item extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired
	}

	renderRank () {
		const { item } = this.props;

		return <div className="rank">{item.rank}.</div>;
	}

	renderImg () {
		const { item } = this.props;

		return <Presentation.AssetBackground className="item-image" contentPackage={item} type="landing" />;
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
				{this.renderRank()}
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
		const { pageNumber } = this.state;

		const batchStart = pageNumber * PAGE_SIZE;

		this.setState({loading: true});

		getService().then(service => {
			const collection = service.getCollection('Courses', 'Catalog');
			const popularLink = collection && collection.Links && collection.Links.filter(x => x.rel === 'Popular')[0];

			if(popularLink) {
				const getBatchLink = link ? link : popularLink.href + '?batchSize=' + PAGE_SIZE + '&batchStart=' + batchStart;

				service.get(getBatchLink).then((results) => {
					this.setState({
						loading: false,
						totalPages: Math.ceil(results.Total / PAGE_SIZE),
						prevLink: ((results.Links || []).filter(x => x.rel === 'batch-prev')[0] || {}).href,
						nextLink: ((results.Links || []).filter(x => x.rel === 'batch-next')[0] || {}).href,
						items: results.Items.map((x, i) => {
							return {
								...x,
								name: x.Title,
								description: x.ProviderUniqueID,
								rank: batchStart + i + 1,
								value: x.TotalEnrolledCount
							};
						})
					});
				}).catch(resp => {
					this.setState({
						loading: false,
						items: []
					});
				});
			}
			else {
				// no popular link, set items to empty
				this.setState({
					loading: false,
					items: []
				});
			}
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

	renderHeader () {
		// disabled state for previous includes a check where pageNumber is 0.  This way, if we get to that last "phantom" page where we have no
		// links (prev or next), we can still go back to the previous real page
		const prevClassName = cx('page-control', 'previous', { disabled: this.state.loading || (!this.state.prevLink && this.state.pageNumber === 0) });
		const nextClassName = cx('page-control', 'next', { disabled: this.state.loading || !this.state.nextLink });

		return (
			<div className="header">
				<div className="title">
					{t('title')}
				</div>
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
						{t('value')}
					</div>
				</div>
				<div className="items">
					{(items || []).map(this.renderItem)}
				</div>
			</div>
		);
	}

	render () {
		return (
			<div className="dashboard-list-widget popular-courses">
				{this.renderHeader()}
				{this.renderItems()}
			</div>
		);
	}
}
