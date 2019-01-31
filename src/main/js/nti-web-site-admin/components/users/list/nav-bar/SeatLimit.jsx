import React from 'react';
import {scoped} from '@nti/lib-locale';
import {getService} from '@nti/web-client';
import {Loading} from '@nti/web-commons';

const t = scoped('nti-site-admin.users.list.navbar.SeatLimit', {
	used: {
		one: '%(count)s Active User',
		other: '%(count)s Active Users'
	},
	max: {
		one: 'Limited to %(count)s user',
		other: 'Limited to %(count)s users'
	}
});

const REL = 'SeatLimit';

export default class SiteSeatLimit extends React.Component {
	state = {}

	async componentDidMount () {
		this.setState({
			loading: true
		});

		try {
			const service = await getService();
			const workspace = service.getWorkspace('Global');

			if (!workspace || !workspace.hasLink(REL)) { throw new Error('No Seat Limit'); }

			const resp = await workspace.fetchLink(REL);

			this.setState({
				loading: false,
				maxSeats: resp['max_seats'],
				usedSeats: resp['used_seats']
			});
		} catch (e) {
			this.setState({
				loading: false,
				hide: true
			});
		}
	}


	render () {
		const {hide, loading} = this.state;

		if (hide) { return null; }

		return (
			<div className="site-seat-limit">
				{loading && (<Loading.Spinner />)}
				{!loading && this.renderSeats()}
			</div>
		);
	}


	renderSeats () {
		const {maxSeats, usedSeats} = this.state;

		return (
			<div className="seats">
				{usedSeats != null && (
					<div className="active">
						{t('used', {count: usedSeats})}
					</div>
				)}
				{maxSeats != null && (
					<div className="limit">
						{t('max', {count: maxSeats})}
					</div>
				)}
			</div>
		);
	}
}
