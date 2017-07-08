import React from 'react';
import PropTypes from 'prop-types';

const empty = () => ({});
export const connect = (mapStateToProps = empty, mapDispatchToProps = empty, store = {}) => {
    return (WrappedComponent) => {
        return class extends React.Component{
            static defaultProps = {
                store: store
            }

            static propTypes = {
                store: PropTypes.shape({
                    getState: PropTypes.func.isRequired,
                    dispatch: PropTypes.func.isRequired,
                    subscribe: PropTypes.func.isRequired,
                }).isRequired
            }

            render(){
                const { store: { getState, dispatch } } = this.props;
                const ms2p = mapStateToProps(getState(), this.props);
                const md2p = mapDispatchToProps(dispatch, this.props);

                return (
                    <WrappedComponent
                        {...this.props}
                        {...ms2p(getState(), this.props)}
                        {...md2p(dispatch, this.props)}
                    />
                );
            }

            componentDidMount(){
                const { store: { subscribe } } = this.props;
                this.unsubscribe = subscribe(() => this.forceUpdate());
            }

            componentWillUnmount() {
                this.unsubscribe();
            }
        }
    }
}
