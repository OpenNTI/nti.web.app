import './PopularCourses.scss';
import React from 'react';
import cx from 'classnames';

import { scoped } from '@nti/lib-locale';
import { Presentation, Loading, Text } from '@nti/web-commons';
import { getService } from '@nti/web-client';
import { getString } from 'internal/legacy/util/Localization';

const LABELS = {
	title: getString(
		'NextThought.view.courseware.assessment.admin.dashboard.widget.PopularCourses'
	),
	name: 'Course Rank',
	value: 'Students',
	noItems: 'No courses found',
};

const t = scoped(
	'nti-web-site-admins.components.dashboard.widgets.popularcourses',
	LABELS
);
const PAGE_SIZE = 4;

const styles = stylesheet`
	.item {
		display: flex;
		position: relative;
		margin-bottom: 10px;
	}

	.rank {
		font-size: 12px;
		color: var(--tertiary-grey);
		padding-top: 10px;
		margin-right: 10px;
		min-width: 20px;
	}

	.image {
		min-width: 40px;
		width: 40px;
		height: 40px;
		margin-right: 15px;
		background-size: cover;
	}

	.info {
		padding-top: 3px;
		font-weight: 400;
	}

	.name {
		font-size: 14px;
		max-width: 220px;
	}

	.description {
		font-size: 12px;
		color: var(--tertiary-grey);
	}

	.value {
		position: absolute;
		right: 0;
		font-size: 20px;
	}
`;

const Item = ({ item }) => (
	<div className={styles.item}>
		<div className={styles.rank}>{item.rank}.</div>
		<Presentation.AssetBackground
			className={styles.image}
			contentPackage={item}
			type="landing"
		/>
		<div className={styles.info}>
			<Text limitLines={1} className={styles.name}>
				{item.name}
			</Text>
			<div className={styles.description}>{item.description}</div>
		</div>
		<div className={styles.value}>{item.value}</div>
	</div>
);

export default class PopularCourses extends React.Component {
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

	loadData(link) {
		const { pageNumber } = this.state;

		const batchStart = pageNumber * PAGE_SIZE;

		this.setState({ loading: true });

		getService().then(service => {
			const collection = service.getCollection('Courses', 'Catalog');
			const popularLink = collection && collection.getLink('Popular');

			if (popularLink) {
				const getBatchLink = link
					? link
					: popularLink +
					  '?batchSize=' +
					  PAGE_SIZE +
					  '&batchStart=' +
					  batchStart;

				service
					.getBatch(getBatchLink)
					.then(results => {
						this.setState({
							loading: false,
							totalPages: Math.ceil(results.Total / PAGE_SIZE),
							prevLink: results.getLink('batch-prev'),
							nextLink: results.getLink('batch-next'),
							items: results.Items.map((x, i) => {
								return {
									...x,
									name: x.Title,
									description: x.ProviderUniqueID,
									rank: batchStart + i + 1,
									value: x.TotalEnrolledCount,
								};
							}),
						});
					})
					.catch(resp => {
						this.setState({
							loading: false,
							items: [],
						});
					});
			} else {
				// no popular link, set items to empty
				this.setState({
					loading: false,
					items: [],
				});
			}
		});
	}

	onPrevious = () => {
		const { pageNumber, prevLink } = this.state;

		if (pageNumber === 0) {
			return;
		}

		this.setState(
			{
				pageNumber: pageNumber - 1,
			},
			() => {
				this.loadData(prevLink);
			}
		);
	};

	onNext = () => {
		const { pageNumber, totalPages, nextLink } = this.state;

		if (pageNumber >= totalPages) {
			return;
		}

		this.setState(
			{
				pageNumber: pageNumber + 1,
			},
			() => {
				this.loadData(nextLink);
			}
		);
	};

	renderHeader() {
		// disabled state for previous includes a check where pageNumber is 0.  This way, if we get to that last "phantom" page where we have no
		// links (prev or next), we can still go back to the previous real page
		const prevClassName = cx('page-control', 'previous', {
			disabled:
				this.state.loading ||
				(!this.state.prevLink && this.state.pageNumber === 0),
		});
		const nextClassName = cx('page-control', 'next', {
			disabled: this.state.loading || !this.state.nextLink,
		});

		return (
			<div className="header">
				<div className="title">{t('title')}</div>
				<div className="pager">
					<div className={prevClassName} onClick={this.onPrevious}>
						<i className="icon-chevron-left" />
					</div>
					<div className={nextClassName} onClick={this.onNext}>
						<i className="icon-chevron-right" />
					</div>
				</div>
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

		return (
			<div className="items-container">
				<div className="items-header">
					<div className="column-header name">{t('name')}</div>
					<div className="column-header value">{t('value')}</div>
				</div>
				<div className="items">
					{(items || []).map((item, index) => (
						<Item key={item.name + index} item={item} />
					))}
				</div>
			</div>
		);
	}

	render() {
		return (
			<div className="dashboard-list-widget popular-courses">
				{this.renderHeader()}
				{this.renderItems()}
			</div>
		);
	}
}
