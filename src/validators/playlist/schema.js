const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
    name: Joi.string().required(),
    owner: Joi.string(),
  });
  
const addPlaylistSchema = Joi.object({
    playlistId: Joi.string(),
    songId: Joi.string().required(),
  });
  
const deletePlaylistSchema = Joi.object({
    songId: Joi.string().required(),
  });
  

module.exports = { 
    PlaylistPayloadSchema, 
    addPlaylistSchema, 
    deletePlaylistSchema,
};