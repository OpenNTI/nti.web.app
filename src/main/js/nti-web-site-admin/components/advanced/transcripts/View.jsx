import React from 'react';
import PropTypes from 'prop-types';
import {ManageTranscriptCredits} from '@nti/web-course';
import {scoped} from '@nti/lib-locale';

const t = scoped('web-site-admin.components.advanced.transcripts.View', {
	creditTypes: 'Credit Types',
	save: 'Save',
});

export default class AdminTranscripts extends React.Component {
	static propTypes = {
		workspace: PropTypes.object.isRequired
	}

	constructor (props) {
		super(props);

		this.state = {};
	}

	onValuesUpdated = (newValues) => {
		this.setState({values: newValues});
	}

	onSave = () => {
		//TODO: Save data
	}

	render () {
		return (
			<div className="site-admin-advanced-transcripts">
				<div className="section-header">{t('creditTypes')}</div>
				<ManageTranscriptCredits onValuesUpdated={this.onValuesUpdated}/>
				<div className="controls">
					<div className="save" onClick={this.onSave}>{t('save')}</div>
				</div>
			</div>
		);
	}
}
