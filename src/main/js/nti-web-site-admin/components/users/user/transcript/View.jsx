import React from 'react';
import PropTypes from 'prop-types';
import {User} from '@nti/web-profiles';

const {Transcripts} = User;

export default class SiteAdminUserTranscript extends React.Component {
	static propTypes = {
		user: PropTypes.object,
	}

	render () {
		return (
			<div className="site-admin-card">
				<Transcripts entity={this.props.user}/>
			</div>
		);
	}
}
