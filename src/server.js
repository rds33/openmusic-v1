require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/albums');
const AlbumsValidator = require('./validators/albums');
const songs = require('./api/songs');
const SongsService = require('./services/postgres/songs');
const SongsValidator = require('./validators/songs');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
    const songsService = new SongsService();
    const albumsService = new AlbumsService();

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