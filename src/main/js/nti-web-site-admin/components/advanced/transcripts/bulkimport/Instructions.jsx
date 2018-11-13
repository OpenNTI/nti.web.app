import React from 'react';
import {scoped} from '@nti/lib-locale';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport', {
	instructions: 'Transcript credits may be imported in bulk by uploading a csv with the following fields:',
	fielddescriptions: {
		username: 'The username to whom the credit applies',
		title: 'The credit’s title',
		description: 'Additional detail for this credit',
		issuer: 'Who issued the credit',
		date: 'The date the credit was awarded',
		value: 'The value of the awarded credit',
		type: 'The type of credit (must already be defined)',
		units: 'The credit units, e.g. ‘hours’ (must already be defined)'
	},
	sampleCsv: `username,title,description,issuer,date,value,type,units
user001,Fire Safety,Completed Continuing Education,NextThought,2018-11-05T00:00:00Z,3,CEU,Hours
user002,English Comp,Continuing Education,NextThought,2018-11-06T00:00:00Z,3,CEU,Hours
`,
});

export default function Instructions () {
	return (
		<div className="transcript-credit-import-instructions">
			<div className="instructions">{t('instructions')}</div>
			<ul className="field-descriptions">
				{Object.keys(t('fielddescriptions')).map(field => (
					<li key={field}>
						<span className="field-name">{field}:</span>
						<span className="field-description">{t(['fielddescriptions', field])}</span>
					</li>
				))}
			</ul>
			<a className="download-sample" href={`data:application/csv,${encodeURIComponent(t('sampleCsv'))}`} download="sample.csv">Download Sample CSV</a>
		</div>
	);
}
