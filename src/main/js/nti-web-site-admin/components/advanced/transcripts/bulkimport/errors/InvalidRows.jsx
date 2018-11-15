import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Table as T} from '@nti/web-commons';

import StatusReport from '../StatusReport';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport.error.InvalidRowsError', {
	message: {
		one: 'Your file contained an invalid row. Import aborted.',
		other: 'Your file contained %(count)s invalid rows. Import aborted.'
	},
	rowNumber: 'Row %(number)s',
	more: '…and %(number)s more'
});

const FIELDS = [
	'credit_definition',
	'date',
	'username',
	'value',
	'title',
];
const MAX_ROWS = 5;

function RowNumber ({item: {RowNumber: number} = {}} = {}) {
	return number == null ? null : <div>{t('rowNumber', {number})}</div>;
}

RowNumber.cssClassName = 'row-number';

function RowErrorMessage ({item = {}} = {}) {
	return Object.entries(item)
		.filter(([k, v]) => FIELDS.includes(k))
		.map(([k, v]) => (
			<div key={k}>{v}</div>
		));
}

RowErrorMessage.cssClassName = 'row-error-message';


export default class InvalidRowsError extends React.Component {

	static handles = error => error && error.code && error.code === 'InvalidRowsError'

	static propTypes = {
		error: PropTypes.shape({
			InvalidRows: PropTypes.arrayOf(
				PropTypes.shape({
					RowNumber: PropTypes.number.isRequired,
					...(FIELDS.reduce((r, f) => ({...r, [f]: PropTypes.string}), {}))
				})
			),
			message: PropTypes.string
		}).isRequired
	}

	render () {
		const {error: {InvalidRows: rows = [], message} = {}} = this.props;
		const heading = message || t('message', {count: rows.length});
		const columns = [RowNumber, RowErrorMessage];
		const footer = rows.length > MAX_ROWS
			? <div className="more">{t('more', {number: rows.length - MAX_ROWS})}</div>
			: null;

		return (
			<StatusReport className="transcript-bulk-import-error" heading={heading} footer={footer}>
				<T.Table items={rows.slice(0, MAX_ROWS)} columns={columns} />
			</StatusReport>
		);
	}
}
