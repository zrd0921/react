import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UserActions from '../../actions/user';
import User from './Modules/User';
import UserAddr from './Modules/UserAddr';
class App extends Component {
    constructor(props, context) {
        super(props, context);
    }
    render() {//做路由判断，返回不同组件
        const { actions,user,routeParams } = this.props;
        const { pages } = routeParams;
        switch(pages){
            case 'addr':
                return (
                    <UserAddr 
                        actions={actions}
                        addr = {user.addr}
                    />
                );
            default:
                return (
                    <User
                        actions={actions}
                        main = {user.main}
                    />
                );
        }
    }
}

function mapStateToProps(state) {
    return {
        user: state.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UserActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);