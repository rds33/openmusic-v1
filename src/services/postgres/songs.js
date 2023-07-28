const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');


class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({
        title, year, performer, genre, duration, albumId,
    }) {
        const id = `songs-${nanoid(16)}`;
        
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [
                id, title, year, performer, genre, duration, albumId,
            ],
        };

        const { rows } = await this._pool.query(query);

        if (!rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return { songsId: rows[0].id };
    }

    async getSongs({ title = '', performer = '' }) {
        const query = {
            text: 'SELECT id, title, performer FROM songs where title ilike $1 and performer ilike $2',
            values: [`%${title}%`, `%${performer}%`],
        };
        const { rows } = await this._pool.query(query);
        return rows;
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };

        const { rows } = await this._pool.query(query);

        if (!rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return { songs: rows.map(mapDBToModel)[0] };
    }

    async editSongById(id, { 
        title, year, performer, genre, duration, albumsId,
    }) {
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumsId" = $6 WHERE id = $7 RETURNING id',
            values: [title, year, performer, genre, duration, albumsId, id],
        };
        
        const { rows } = await this._pool.query(query);

        if (!rows.length) {
            throw new NotFoundError(
                'Gagal memperbarui lagu. Id tidak ditemukan',
            );
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const { rows } = await this._pool.query(query);

        if (!rows.length) {
            throw new NotFoundError(
                'Gagal menghapus lagu. Id tidak ditemukan',
            );
        }
    }

    async getSongsInPlaylist(playlistId) {
        const query = {
            text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs 
            INNER JOIN songs ON songs.id = playlist_songs.song_id
            WHERE playlist_id = $1
            `,
            values: [playlistId],
            };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Lagu tidak dapat ditemukan. Id playlist tidak ada');
        }
        return result.rows;
    }
    
    async verifySong(id) {
        const query = {
          text: 'SELECT * FROM songs WHERE id = $1',
          values: [id],
        };
    
        const result = await this._pool.query(query);
        if (!result.rowCount) {
          throw new NotFoundError('Lagu tidak ditemukan');
        }
      }
}


module.exports = SongsService;