import React from 'react';
import PropTypes from 'prop-types';
import {Loading} from 'nti-web-commons';
import {scoped} from 'nti-lib-locale';

const DEFAULT_TEXT = {
	loadMore: 'Load More'
};
const t = scoped('nti-site-admin.common.LoadMore', DEFAULT_TEXT);


export default class SiteAdminLoadMore extends React.Component {
	static propTypes = {
		loading: PropTypes.bool,
		hasMore: PropTypes.bool,
		onLoadMore: PropTypes.bool,
		label: PropTypes.string
	}


	onLoadMore = () => {
		const {onLoadMore} = this.props;

		if (onLoadMore) {
			onLoadMore();
		}
	}

	render () {
		const {loading, hasMore, label} = this.props;

		if (!loading && !hasMore) { return null; }

		return (
			<div className="site-admin-load-more" onClick={this.onLoadMore}>
				{loading && (<Loading.Spinner white />)}
				{!loading && (<span>{label || t('loadMore')}</span>)}
			</div>
		);
	}
}
