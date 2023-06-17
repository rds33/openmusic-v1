/* eslint-disable camelcase */
const mapDBToModel = ({
    Id,
    title,
    year,
    genre,
    performer,
    duration,
    albumsId,
}) => ({
    Id,
    title,
    year,
    genre,
    performer,
    duration,
    albumsId,
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