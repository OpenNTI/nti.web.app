import React from 'react';
import {scoped} from '@nti/lib-locale';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport', {
	instructions: 'To import transcript credits upload a csv (comma or tab delimited) with the format below.'
});

export default function Instructions () {
	return (
		<div className="transcript-credit-import-instructions">
			<div className="instructions">{t('instructions')}</div>

			<table>
				<thead>
					<tr>
						<td>username*</td>
						<td>title*</td>
						<td>description</td>
						<td>issuer</td>
						<td>date*</td>
						<td>value*</td>
						<td>type*</td>
						<td>units*</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>username*</td>
						<td>title*</td>
						<td>description</td>
						<td>issuer</td>
						<td>date*</td>
						<td>value*</td>
						<td>type*</td>
						<td>units*</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
