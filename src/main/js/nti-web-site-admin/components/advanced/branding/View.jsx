import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Errors, Theme} from '@nti/web-commons';

import Card from '../../common/Card';

import {ERROR, MODIFIED} from './constants';
import Apply from './Apply';
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
		this.props.save(this.form.current)
			.then(() => this.setState({showPreview: false}));
	}

	togglePreview = () => this.setState({showPreview: !this.state.showPreview});

	render () {
		const {
			[ERROR]: error,
			[MODIFIED]: modified,
			theme,
			assets,
			setAsset,
			setBrandProp,
			cancel,
			reset
		} = this.props;

		const {showPreview} = this.state;

		return !theme ? null : (
			<Theme.Apply theme={theme}>
				<form ref={this.form} onSubmit={this.onSave} encType="multipart/form-data">
					<Card className={cx('branding-root')}>
						{(modified || error) && (
							<div className={cx('header')}>
								<div className={cx('header-content')}>
									<Apply disabled={!modified} onSave={this.onSave} onCancel={cancel} />
									{error && <Errors.Bar error={error} className={cx('errorbar')}/>}
								</div>
							</div>
						)}
						<div className={cx('branding-content')}>
							<Library onChange={setBrandProp} />
							<Site onChange={setBrandProp} />
							<Assets assets={assets} onChange={setAsset} onThumbClick={this.togglePreview} />
							<Reset onReset={reset} />
						</div>
					</Card>
					{showPreview && <Preview onSave={modified ? this.onSave : null} onClose={this.togglePreview} />}
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
	save: PropTypes.func.isRequired,
	cancel: PropTypes.func.isRequired,
	reset: PropTypes.func.isRequired,
};

export default Store.connect([
	ERROR,
	MODIFIED,
	'theme',
	'assets',
	'setAsset',
	'setBrandProp',
	'cancel',
	'save',
	'reset'
])(SiteAdminBranding);
