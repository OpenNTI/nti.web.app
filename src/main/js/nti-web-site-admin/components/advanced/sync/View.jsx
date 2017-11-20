import React from 'react';
import PropTypes from 'prop-types';
import { getService } from 'nti-web-client';
import { DateTime, Flyout, Prompt } from 'nti-web-commons';

export default class View extends React.Component {
	static propTypes = {
		workspace: PropTypes.object
	}

	attachFlyoutRef = x => this.flyout = x

	constructor (props) {
		super(props);
		this.state = {
			isLocked: false,
			loadingMeta: true
		};

		this.__refreshSyncStatus();
	}

	__refreshSyncStatus () {
		const syncLink = this.__getLink('SyncMetadata');

		if(!syncLink) {
			return;
		}

		return getService().then((service) => {
			return service.get(syncLink).then((resp) => {
				if(!resp.is_locked && this.refreshInterval) {
					clearInterval(this.refreshInterval);
				}
				else if(resp.is_locked && !this.refreshInterval) {
					this.refreshInterval = setInterval(() => { this.__refreshSyncStatus(); }, 5000);
				}

				this.setState({isLocked: resp.is_locked, lockHolder: resp.holding_user,
					lastSyncedDate: new Date(resp.last_synchronized * 1000),
					lastLocked: new Date(resp.last_locked * 1000), loadingMeta: false, errorMsg: null, loadingMsg: null});
			});
		});
	}

	__getLink (name) {
		const { workspace } = this.props;

		if(!workspace || !workspace.Links) {
			return null;
		}

		const matches = workspace.Links.filter((x) => x.rel === name);

		return matches.length > 0 ? matches[0].href : null;
	}

	onError (msg) {
		this.setState({errorMsg : msg});
	}

	renderError () {
		if(this.state.errorMsg) {
			return (<div className="error">{this.state.errorMsg}</div>);
		}

		return null;
	}

	renderLockedStatus () {
		if(this.state.isLocked) {
			return (<span className="sync-locked">Locked</span>);
		}
		else {
			return (<span className="sync-unlocked">Unlocked</span>);
		}
	}

	renderOptionsTrigger () {
		return (<span className="refresh-meta"><i className="icon-settings"/></span>);
	}

	doRefresh = () => {
		this.flyout && this.flyout.dismiss();

		this.setState({ loadingMeta: true }, () => {
			this.__refreshSyncStatus();
		});
	}

	doResync = () => {
		if(this.state.isLocked) {
			return;
		}

		this.flyout && this.flyout.dismiss();

		Prompt.areYouSure('Re-syncing may take a while.').then(() => {
			getService().then((service) => {
				service.get(this.__getLink('SyncAllLibraries'));

				this.setState({ errorMsg: null, loadingMsg: 'Starting sync...', loadingMeta: true }, () => {
					this.refreshInterval = setInterval(() => { this.__refreshSyncStatus(); }, 5000);
				});
			}).catch((resp) => {
				this.onError(resp.message || 'Could not re-sync');
			});
		});
	}

	renderOptions () {
		return (<Flyout.Triggered
			className="sync-options"
			trigger={this.renderOptionsTrigger()}
			horizontalAlign={Flyout.ALIGNMENTS.LEFT}
			sizing={Flyout.SIZES.MATCH_SIDE}
			ref={this.attachFlyoutRef}
		>
			<div>
				<div onClick={this.doRefresh}>Refresh Status</div>
				<div className={this.state.isLocked ? 'disabled' : ''} onClick={this.doResync}>Re-sync</div>
			</div>
		</Flyout.Triggered>);
	}

	renderLockStatus () {
		return (<div>
			<div className="label">Status</div>
			<div className="control">
				{this.renderLockedStatus()}
				{this.renderRemoveSyncLock()}
			</div>
		</div>);
	}

	renderLockHolder () {
		if(this.state.isLocked && this.state.lockHolder) {
			return (<div>
				<div className="label">Lock Holder</div>
				<div>
					{this.state.lockHolder}
				</div>
			</div>);
		}

		return null;
	}

	renderLockTime () {
		if(this.state.isLocked && this.state.lastLocked) {
			const formattedDate = DateTime.format(this.state.lastLocked, 'LLLL');

			return (<div>
				<div className="label">Lock Time</div>
				<div>
					{formattedDate}
				</div>
			</div>);
		}

		return null;
	}

	renderSyncAllLibraries (syncAllLibraries) {
		if(syncAllLibraries) {
			return (<div className="sync-control">Sync All Libraries</div>);
		}

		return null;
	}

	onRemoveSyncLock = () => {
		const removeSyncLock = this.__getLink('RemoveSyncLock');

		getService().then((service) => {
			this.setState({errorMsg: null}, () => {
				service.post(removeSyncLock).then(() => {
					this.__refreshSyncStatus();
				}).catch((resp) => {
					this.onError(resp.message || 'Could not remove lock');
				});
			});
		});
	}

	renderRemoveSyncLock () {
		if(this.state.isLocked && this.__getLink('RemoveSyncLock')) {
			return (<span className="remove-lock" onClick={this.onRemoveSyncLock}>Remove Sync Lock</span>);
		}

		return null;
	}

	renderFooter () {
		const formattedDate = DateTime.format(this.state.lastSyncedDate, 'LLLL');

		return (<div className="footer">
			<div className="last-sync">Last sync on {formattedDate}</div>
		</div>);
	}

	render () {
		if(!this.props.workspace) {
			return null;
		}

		const metaDataLink = this.__getLink('SyncMetadata');
		const syncAllLink = this.__getLink('SyncAllLibraries');
		const removeLink = this.__getLink('RemoveSyncLock');

		if(!metaDataLink || !syncAllLink || !removeLink) {
			return null;
		}

		if(this.state.loadingMeta) {
			return (<div>{this.state.loadingMsg || 'Loading sync data...'}</div>);
		}
		else {
			return (<div className="site-admin-sync">
				<div className="title">
					<span>Sync Status</span>
					{this.renderOptions()}
				</div>
				{this.renderError()}
				{this.renderLockStatus()}
				{this.renderLockHolder()}
				{this.renderLockTime()}
				{this.renderFooter()}
			</div>);
		}
	}
}
