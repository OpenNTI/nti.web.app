import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Errors, Loading, Theme} from '@nti/web-commons';

import Card from '../../common/Card';

import {ERROR, LOADING, MODIFIED, CAN_EDIT_EMAIL_ASSET, CAN_RESET} from './constants';
import Controls from './Controls';
import Preview from './preview';
import Reset from './Reset';
import {Library, Assets, Site} from './sections/';
import style from './View.css';
import Store from './Store';

const cx = classnames.bind(style);

class SiteAdminBranding extends React.Component {

	constructor (props) {
		super(props);
		this.form = React.createRef();
	}

	state = {}

	static deriveBindingFromProps = () => Theme.getGlobalTheme()

	onSave = e => {
		e.preventDefault();
		e.stopPropagation();
		this.setState({showPreview: false});
		this.props.save(this.form.current);
	}

	togglePreview = () => this.setState({showPreview: !this.state.showPreview});

	render () {
		const {
			[ERROR]: error,
			[LOADING]: loading,
			[MODIFIED]: modified,
			[CAN_EDIT_EMAIL_ASSET]: canEditEmail,
			theme,
			assets,
			setAsset,
			setBrandProp,
			cancel
		} = this.props;

		const {showPreview} = this.state;

		return !theme ? null : (
			<Theme.Apply theme={theme}>
				<form className={cx('branding-root')} ref={this.form} onSubmit={this.onSave} encType="multipart/form-data">
					<Card>
						{(modified || error) && (
							<div className={cx('header')}>
								<div className={cx('header-content')}>
									<Controls onPreview={this.togglePreview} onCancel={cancel} />
									{error && <Errors.Bar error={error} className={cx('errorbar')}/>}
								</div>
							</div>
						)}
						<div className={cx('branding-content')}>
							<Site onChange={setBrandProp} />
							<Library onChange={setBrandProp} />
							<Assets assets={assets} onChange={setAsset} onThumbClick={this.togglePreview} canEditEmail={canEditEmail} />
						</div>
					</Card>
					{showPreview && <Preview onSave={modified ? this.onSave : null} onClose={this.togglePreview} />}
					<Loading.Overlay large loading={loading} />
				</form>
			</Theme.Apply>
		);
	}
}

SiteAdminBranding.propTypes = {
	assets: PropTypes.object,
	setAsset: PropTypes.func.isRequired,
	setBrandProp: PropTypes.func.isRequired,
	theme: PropTypes.object,
	[MODIFIED]: PropTypes.bool,
	[ERROR]: PropTypes.object,
	[CAN_EDIT_EMAIL_ASSET]: PropTypes.bool,
	save: PropTypes.func.isRequired,
	cancel: PropTypes.func.isRequired,
	reset: PropTypes.func.isRequired,
};

export default Store.connect([
	ERROR,
	LOADING,
	MODIFIED,
	CAN_EDIT_EMAIL_ASSET,
	CAN_RESET,
	'theme',
	'assets',
	'setAsset',
	'setBrandProp',
	'cancel',
	'save',
	'reset'
])(SiteAdminBranding);
