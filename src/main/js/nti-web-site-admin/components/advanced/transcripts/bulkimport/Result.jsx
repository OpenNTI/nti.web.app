import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';

import DisplayNameColumn from './DisplayNameColumn';
import column from './PropertyColumn';
import ResultTabs from './ResultTabs';
import StatusReport from './StatusReport';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport.result', {
	heading: 'Successfully imported credits',
	columnHeader: {
		titleByUser: 'Credit Title',
		typeByUser: 'Types',
		username: 'Username'
	},
	units: {
		credits: {
			one: 'Credit',
			other: 'Credits',
		},
		users: {
			one: 'Learner',
			other: 'Learners',
		},
		types: {
			one: 'Type',
			other: 'Types',
		}
	}

});

function Tab ({count, unit} = {}) {
	return (
		<div className="results-tab">
			<span className="count">{count}</span>
			<span className="unit">{unit}</span>
		</div>
	);
}

Tab.propTypes = {
	count: PropTypes.number.isRequired,
	unit: PropTypes.string.isRequired
};

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

	get numGroups () {
		return Object.keys(this.results).length;
	}

	get total () {
		return Object.values(this.results).reduce((s, v) => s + v.size, 0);
	}
}

export default class Result extends React.PureComponent {

	static propTypes = {
		result: PropTypes.array
	}

	tabs = () => {
		const {result: items = []} = this.props;
		const titleByUser = new Counter('title', 'user.ID');
		const typeByUser = new Counter('creditDefinition.type', 'user.ID');
		const users = {};

		items.forEach(item => {
			titleByUser.count(item);
			typeByUser.count(item);
			const userid = getProp(item, 'user.ID');
			if (userid) {
				users[userid] = item.user;
			}
		});

		return [
			{
				label: <Tab count={titleByUser.numGroups} unit={t(['units', 'credits'], {count: titleByUser.numGroups})} />,
				data: Object.entries(titleByUser.results).map(([name, learners]) => ({name, learners: learners.size})),
				columns: [column('name', t(['columnHeader', 'titleByUser'])), column('learners')]
			},
			{
				label: <Tab count={typeByUser.numGroups} unit={t(['units', 'types'], {count: typeByUser.numGroups})} />,
				data: Object.entries(typeByUser.results).map(([name, learners]) => ({name, learners: learners.size})),
				columns: [column('name', t(['columnHeader', 'typeByUser'])), column('learners')]
			},
			{
				label: <Tab count={Object.values(users).length} unit={t(['units', 'users'], {count: Object.values(users).length})} />,
				data: Object.values(users),
				columns: [DisplayNameColumn, column('Username', t(['columnHeader', 'username']))]
			}
		];
	}

	render () {
		const {result} = this.props;

		if (!result || result.length === 0) {
			return null;
		}

		const tabs = this.tabs();

		return (
			<StatusReport className="transcript-credit-import-result" heading={t('heading')}>
				<ResultTabs tabs={tabs} />
			</StatusReport>
		);
	}
}
