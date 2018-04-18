import React from 'react';
import PropTypes from 'prop-types';
import {Avatar, DisplayName} from '@nti/web-commons';
import {getHistory} from '@nti/web-routing';

import GroupsStateStore from '../../legacy/app/groups/StateStore';

const info = 'Visible because your search contained someone\'s name.';
const groupStore = GroupsStateStore.getInstance();
export default class UserList extends React.Component {
	static propTypes = {
		userList: PropTypes.array,
		currentTab: PropTypes.string,
		updateRoute: PropTypes.func
	}

	constructor (props) {
		super(props);

		this.state = {
			showNext: false,
			showPre: false,
			isFollow: [],
			userClass: 'user-lookup-search all-user clearfix'
		};
	}

	componentDidMount () {
		const {userList, currentTab} = this.props;
		const userClass = currentTab === 'all' ? 'user-lookup-search all-user clearfix' : 'user-lookup-search people clearfix';
		let isFollow = [];
		userList.map((user, index) =>{
			const isContact = groupStore.isContact(user.Username);
			isFollow[index] = isContact;
		});

		this.setState({isFollow: isFollow, userClass: userClass});
		if (userList.length < 4) {
			this.setState({showNext: false, showPre: false});
		}
		else {
			this.setState({showNext: true, showPre: false});
		}
	}

	componentWillReceiveProps (prevProps) {
		if (prevProps.currentTab !== this.props.currentTab) {
			const userClass = prevProps.currentTab === 'all' ? 'user-lookup-search all-user clearfix' : 'user-lookup-search people clearfix';
			this.setState({userClass: userClass});
		}
		if (prevProps.userList !== this.props.userList) {
			let isFollow = [];
			prevProps.userList.map((user, index) =>{
				const isContact = groupStore.isContact(user.Username);
				isFollow[index] = isContact;
			});

			this.setState({isFollow: isFollow});
			if (prevProps.userList.length < 4) {
				this.setState({showNext: false, showPre: false});
			}
			else {
				this.setState({showNext: true, showPre: false});
			}
		}
	}

	attachRef = el => this.el = el

	nextItems = () => {
		if (!this.state.showPre) {
			this.setState({showPre: true});
		}

		const scrollLeftMax = this.el.scrollWidth - this.el.clientWidth;
		if (this.el.scrollLeft >= (scrollLeftMax - (215 * 3))) {
			this.setState({showNext: false});
			this.el.scrollLeft = scrollLeftMax;
			return;
		}
		const currentPos = parseInt((this.el.scrollLeft / 215), 10);
		this.el.scrollLeft = (currentPos * 215) + (215 * 3);
	}

	preItems = () => {
		if (!this.state.showNext) {
			this.setState({showNext: true});
		}

		if (this.el.scrollLeft < (215 * 3)) {
			this.setState({showPre: false});
			this.el.scrollLeft = 0;
			return;
		}

		const currentPos = parseInt((this.el.scrollLeft / 215), 10);
		this.el.scrollLeft = (currentPos * 215) - (215 * 3);
	}

	scrollItems = () => {
		const scrollLeftMax = this.el.scrollWidth - this.el.clientWidth;
		if (this.el.scrollLeft === 0) {
			this.setState({showPre: false});
		}
		else if (this.el.scrollLeft === scrollLeftMax) {
			this.setState({showNext: false});
		}
		else {
			this.setState({showNext: true, showPre: true});
		}
	}

	navigateToUserProfile = (user) =>() => {
		const profileLink = '/app/user/' + user;
		getHistory().replace(profileLink);
	}

	viewAll = () => {
		this.props.updateRoute('people');
	}

	render () {
		const {currentTab, userList} = this.props;
		const {showNext, showPre, userClass} = this.state;
		if (userList.length === 0) {
			return null;
		}
		if (currentTab === 'all' || currentTab === 'people') {
			return (
				<div className="container">
					<section className={userClass}>
						<div className="title-block-lookup">
							<p>People</p>
							<a className="view-all" onClick={this.viewAll}>View All</a>
						</div>
						<div className="result-block">
							<ul ref={this.attachRef} onScroll={this.scrollItems}>
								{userList.map((user, index) =>
									(user.Class === 'User') && (
										<li className="block-info" key={index}>
											<div className="user-info" onClick={this.navigateToUserProfile(user.Username)}>
												<div className="img-user">
													<Avatar className="img-user" entityId={user.Username}/>
												</div>
												<DisplayName entity={user.Username} className="user-name"/>
											</div>
										</li>
									)
								)}

							</ul>
						</div>
						<div className="bottom-info">
							<p>{info}</p>
						</div>
						{showPre && (
							<div>
								<div className="bg-control left"/>
								<a className="left carousel-control" role="button" data-slide="prev" onClick={this.preItems}>
									<i className="icon-chevron-left" aria-hidden="true"/>
								</a>
							</div>
						)}

						{showNext && (
							<div>
								<div className="bg-control right"/>
								<a className="right carousel-control" role="button" data-slide="next" onClick={this.nextItems}>
									<i className="icon-chevron-right" aria-hidden="true"/>
								</a>
							</div>
						)}
					</section>
				</div>
			);
		}

		return null;
	}
}
