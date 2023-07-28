/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addConstraint('songs', 'fk_songs.albumsId_album.id', 'FOREIGN KEY ("albumsId") REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropConstraint('songs', 'fk_songs.albumsId_album.id');
};
