require('dotenv').config();

const Hapi = require('@hapi/hapi');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/albums');
const AlbumsValidator = require('./validators/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/songs');
const SongsValidator = require('./validators/songs');
const ClientError = require('./exceptions/ClientError');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validators/users');

const init = async () => {
    const songsService = new SongsService();
    const albumsService = new AlbumsService();
    const usersService = new UsersService();

    const server = Hapi.server({
      port: process.env.PORT,
      host: process.env.HOST,
      routes: {
        cors: {
            origin: ['*'],
        },
      },
    });
   
    await server.register([
        {
        plugin: albums,
        options: {
          service: albumsService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
    ]);

    server.ext('onPreResponse', (request, h) => {
      const { response } = request;
      
      if (response instanceof Error) {
        if (response instanceof ClientError) {
          const newResponse = h.response({
            status: 'fail',
            message: response.message,
          });

          newResponse.code(response.statusCode);
          return newResponse;
        }

        if (!response.isServer) {
          return h.continue;
        }

        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code = response.statusCode;
        return newResponse;
      }
      
      return h.continue;
    });
   
    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
  };
   
   
  init();