const routes = (handler) => [
    {
      method: 'POST',
      path: '/albums/{albumId}/likes',
      handler: handler.postLikeHandler,
      options: {
        auth: 'openmusic_jwt',
      },
    },
    {
      method: 'GET',
      path: '/albums/{albumId}/likes',
      handler: handler.getLikeHandler,
    },
    {
      method: 'DELETE',
      path: '/albums/{albumId}/likes',
      handler: handler.deleteLikeHandler,
      options: {
        auth: 'openmusic_jwt',
      },
    },
];
  

module.exports = routes;