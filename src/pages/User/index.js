import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

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
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: true,
    perPage: 30,
    page: 1,
    refreshing: false,
  };

  componentDidMount() {
    this.loadData();
  }

  loadData = async (page = 1) => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const { stars, perPage } = this.state;

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        per_page: perPage,
        page,
      },
    });

    this.setState({
      stars: page > 1 ? [...stars, ...response.data] : response.data,
      loading: false,
      page,
      refreshing: false,
    });
  };

  loadMore = () => {
    const { page } = this.state;

    this.loadData(page + 1);
  };

  refreshList = () => {
    this.setState({ refreshing: true });

    this.loadData();
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator color="#333" />
        ) : (
          <Stars
            data={stars}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred
                onPress={() => {
                  navigation.navigate('Repository', { repository: item });
                }}
              >
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
