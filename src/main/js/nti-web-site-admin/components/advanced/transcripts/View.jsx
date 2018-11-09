import React from 'react';
import PropTypes from 'prop-types';
import {ManageTranscriptCredits} from '@nti/web-course';
import {scoped} from '@nti/lib-locale';

import BulkImport from './bulkimport';

const t = scoped('web-site-admin.components.advanced.transcripts.View', {
	creditTypes: 'Credit Types',
	save: 'Save',
	importCredits: 'Bulk Import Transcript Credits',
});

export default class AdminTranscripts extends React.Component {
	static propTypes = {
		workspace: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);

		this.state = {};
	}

	render () {
		return (
			<div className="site-admin-advanced-transcripts">
				<div>
					<div className="section-header">{t('creditTypes')}</div>
					<ManageTranscriptCredits/>
				</div>
				<div>
					<div className="section-header">{t('importCredits')}</div>
					<BulkImport />
				</div>
			</div>
		);
	}
}
