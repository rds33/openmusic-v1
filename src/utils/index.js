/* eslint-disable camelcase */
const mapDBToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumsId,
}) => ({
    id,
    title,
    year,
    performer,
    genre,
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