/* eslint-disable camelcase */
const mapDBToModel = ({
    Id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
}) => ({
    Id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
});

const mapDBToModelSongs = ({
    id,
    title,
    performer,
  }) => ({
    id,
    title,
    performer,
  });
  
  const mapDBToModelAlbums = ({
    id,
    name,
    year,
  }) => ({
    id,
    name,
    year,
  });

module.exports = { mapDBToModel, mapDBToModelSongs, mapDBToModelAlbums };