import React from 'react';
import {scoped} from '@nti/lib-locale';
import {rawContent} from '@nti/lib-commons';
import cx from 'classnames';

import Collapsible from './Collapsible';

const t = scoped('web-site-admin.components.advanced.transcripts.bulkimport', {
	instructions: 'Import transcript credits for multiple learners with a comma or tab separated csv file.',
	showdetails: 'View Details',
	hidedetails: 'Hide Details',
	fieldsheading: 'Columns',
	fielddescriptions: {
		username: 'a learner’s unique nextthought username',
		title: 'name of the credit ',
		description: 'description of the credit',
		issuer: 'entity issuing the credit',
		date: 'the awarded date in ISO-8601 format, e.g. <span style="white-space:nowrap">2018-11-09T18:38:00.000-0500</span>',
		value: 'amount of credit (i.e. 4)',
		type: 'domain specific kind of credit (i.e. CRE)',
		units: 'unit of measurement (i.e. Hours)'
	},
	required: '',
	optional: 'optional',
	downloadsample: 'Download Sample CSV',
	sampleCsv: `username,title,description,issuer,date,value,type,units
"858180955","Control Your Own Level of Motivation",,,2018-11-09T18:38:13.889Z,3,CEU,Hours
"586022714","Winner S Gold",,,2018-11-09T18:38:13.889Z,3,CEU,Hours
"710014911","Yes You Can",,,2018-11-09T18:38:13.889Z,3,CEU,Hours
"652805478","Living in the Now",,,2018-11-09T18:38:13.889Z,3,ARG,Points
"153810455","Sometimes Typhoons Come",,,2018-11-09T18:38:13.889Z,3,CEU,Hours
"532119498","All Faith Needs Feet",,,2018-11-09T18:38:13.889Z,3,CEU,Hours
`
});

const REQUIRED = [
	'username',
	'title',
	'date',
	'value',
	'type',
	'units',
];

export default function Instructions () {
	return (
		<div className="transcript-credit-import-instructions">
			<div className="instructions">{t('instructions')}</div>
			<a className="download-sample" href={`data:application/csv,${encodeURIComponent(t('sampleCsv'))}`} download="sample.csv">{t('downloadsample')}</a>
			<Collapsible label={t('showdetails')} labelOpened={t('hidedetails')}>
				<div className="field-descriptions-heading">{t('fieldsheading')}</div>
				<ul className="field-descriptions">
					{Object.keys(t('fielddescriptions')).map(field => {
						const required = REQUIRED.includes(field);

						return (
							<li key={field}>
								<span className={cx('field-name', {required})}>{field} <span className="field-requiredness">{t(required ? 'required' : 'optional')}</span></span>
								<span className="field-description" {...rawContent(t(['fielddescriptions', field]))} />
							</li>
						);
					})}
				</ul>
			</Collapsible>
		</div>
	);
}
