import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

import api from '../../services/api';

class User extends Component {
  state = {
    stars: [],
    loading: false,
    page: 1,
    finish: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    this.setState({ loading: true });

    const response = await api.get(`users/${user.login}/starred`);

    this.setState({
      stars: response.data,
      loading: false,
    });
  }

  loadMore = async () => {
    const { page, stars, finish } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const newPage = page + 1;

    if (finish || stars.length < 30) return;

    await this.setState({
      page: newPage,
      loading: true,
    });

    const response = await api.get(
      `users/${user.login}/starred?page=${newPage}`
    );

    if (!response.data.length) {
      this.setState({
        finish: true,
        loading: false,
      });
    } else {
      this.setState({
        stars: [...stars, ...response.data],
        loading: false,
      });
    }
  };

  render() {
    const { stars, loading } = this.state;
    const { navigation } = this.props;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {!!stars.length && (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}

        {loading && (
          <Loading>
            <ActivityIndicator />
          </Loading>
        )}
      </Container>
    );
  }
}

User.navigationOptions = ({ navigation }) => ({
  title: navigation.getParam('user').name,
});

User.propTypes = {
  navigation: PropTypes.shape({
    getParam: PropTypes.func,
  }).isRequired,
};

export default User;
