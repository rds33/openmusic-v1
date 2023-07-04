const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistPayloadSchema, addPlaylistSchema, deletePlaylistSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAddSongToPlaylist: (payload) => {
    const validationResult = addPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteSongsFromPlaylist: (payload) => {
    const validationResult = deletePlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;