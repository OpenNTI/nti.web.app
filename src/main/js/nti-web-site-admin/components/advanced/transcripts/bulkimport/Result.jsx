import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import column from './PropertyColumn';
import ResultTabs from './ResultTabs';
import StatusReport from './StatusReport';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport.result', {
	heading: 'Successfully imported credits'
});

const getProp = (item, prop) => prop.split('.').reduce((node, property) => (node || {})[property], item);

class Counter {
	constructor (prop, groupBy) {
		this.prop = prop;
		this.groupBy = groupBy;
		this.results = {};
	}

	count = item => {
		item = item || {};
		const v = getProp(item, this.prop);
		const g = getProp(item, this.groupBy);

		if (!v) {
			return;
		}

		this.results[v] = this.results[v] || new Set();
		this.results[v].add(g);
	}
}

export default class Result extends React.PureComponent {

	static propTypes = {
		result: PropTypes.object
	}

	bins = () => {
		const {result: {Items: items} = {}} = this.props;
		const titleByUser = new Counter('title', 'user.ID');
		const typeByUser = new Counter('credit_definition.credit_type', 'user.ID');
		const users = {};

		items.forEach(item => {
			titleByUser.count(item);
			typeByUser.count(item);
			const userid = getProp(item, 'user.ID');
			if (userid) {
				users[userid] = item.user;
			}
		});

		return {
			titleByUser: titleByUser.results,
			typeByUser: typeByUser.results,
			users: Object.values(users)
		};
	}

	render () {
		const {result: {ItemCount: count} = {}} = this.props;

		if (count == null) {
			return null;
		}

		const bins = this.bins();
		const tabs = Object.entries(bins).map(([key, data]) => ({
			label: 'test',
			data,
			columns: column('title')
		}));

		console.log(tabs);

		return count == null ? null : (
			<StatusReport heading={t('heading')}>
				<ResultTabs tab={tabs} />
			</StatusReport>
		);
	}
}
