import './View.scss';
import React from 'react';
import {ManageTranscriptCredits} from '@nti/web-course';
import {scoped} from '@nti/lib-locale';

import BulkImport from './bulkimport';
import CertificateStyling from './certificate-styling';

const t = scoped('web-site-admin.components.advanced.transcripts.View', {
	creditTypes: 'Credit Types',
});

export default class AdminTranscripts extends React.Component {

	constructor (props) {
		super(props);

		this.state = {};
	}

	render () {
		return (
			<div className="site-admin-advanced-transcripts">
				<CertificateStyling />
				<div>
					<div className="section-header">{t('creditTypes')}</div>
					<ManageTranscriptCredits />
				</div>
				<BulkImport />
			</div>
		);
	}
}
