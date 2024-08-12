import React from 'react';
import PropTypes from 'prop-types';
import { Link, Route, Redirect } from 'react-router-dom';
import LoginForm from '../components/LoginForm.js';
import RegisterForm from '../components/RegisterForm.js';
import { connect } from 'react-redux';
import { isAuthenticated, isLoading } from '../../state/ducks/session/selectors.js';
import styles from './LoginScreen.css';
import ChangePasswordForm from '../components/ChangePasswordForm.js';

export class LoginScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			from: (props.location.state && props.location.state.from) || { pathname: '/' }
		};
	}

    render() {
        if (this.props.isLoggedIn) {
            return <Redirect to={this.state.from} />;
        }

        return (
            <div className={styles.screen}>
                <div className={styles.container}>
                    <div className="branding">
                        {this.props.logoPath
                            ? <img src={this.props.logoPath} />
                            : <h1>{this.props.appName}</h1>}
                    </div>
                    {this.props.error &&
                        <p className={styles.errorMessage}>{this.props.error}</p>}
                    <Route path="/login" component={LoginForm} />
                    <Route path="/register" component={RegisterForm} />
                    <Route path="/change-password" component={ChangePasswordForm} /> {/* New route for change password */}
                    {this.props.isLoading &&
                        <div className={styles.loading}>Loading</div>}
                </div>
                <div className={styles.footer}>
                    <Route path="/login" render={() => <>
                        <Link to="/register">Create Account</Link>
                        &nbsp;|&nbsp;
                        <Link to="/change-password">Change Password</Link>
                    </>} />
                    <Route path="/register" render={() => <Link to="/login">Login</Link>} />
                </div>
            </div>
        );
    }
}

LoginScreen.propTypes = {
	isLoggedIn: PropTypes.bool,
	isLoading: PropTypes.bool,
	appName: PropTypes.string,
	logoPath: PropTypes.string,
	location: PropTypes.object,
	error: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.bool
	])
};

LoginScreen.defaultProps = {
	location: {
		state: { pathname: '/' }
	}
};

const mapStateToProps = (state) => ({
	isLoggedIn: isAuthenticated(state.session),
	isLoading: isLoading(state.session),
	appName: state.config.app_name,
	logoPath: state.config.logo_path,
	error: state.session.error
});

export default connect(mapStateToProps, null, null, { pure: false })(LoginScreen);
