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
    this.setState({ loading: true });

    const response = await this.fetchStars();

    this.setState({
      stars: response.data,
      loading: false,
    });
  }

  fetchStars = (page = 1) => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const response = api.get(`users/${user.login}/starred?page=${page}`);

    return response;
  };

  loadMore = async () => {
    const { page, stars, finish } = this.state;
    const newPage = page + 1;

    if (finish || stars.length < 30) return;

    await this.setState({
      page: newPage,
      loading: true,
    });

    const response = await this.fetchStars(newPage);

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

  refreshList = async () => {
    const page = 1;

    this.setState({ loading: true });

    const response = await this.fetchStars(page);

    this.setState({
      page,
      stars: response.data,
      loading: false,
    });
  };

  handleNavigate(repository) {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  }

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
            onRefresh={this.refreshList}
            refreshing={loading}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
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
    navigate: PropTypes.func,
    getParam: PropTypes.func,
  }).isRequired,
};

export default User;
