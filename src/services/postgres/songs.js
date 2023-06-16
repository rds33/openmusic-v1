const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');
const { mapDBToModelSongs } = require('../../utils');


class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong(songs) {
        const {
            title, year, genre, performer, duration, albumId,
        } = songs;

        const id = `songs-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [
                id, title, year, performer, genre, duration, albumId,
            ],
        };

        const rows = await this._pool.query(query);

        if (!rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }
        return { songsId: rows[0].id };
    }

    async getSongs({ title, performer }) {
        const getQuery = 'SELECT * FROM songs';

        let query = getQuery;

        if (title) {
            query = {
                text: `${getQuery} WHERE LOWER(title) LIKE LOWER($1)`,
                values: [`%${title}%`],
            };
        }

        if (performer) {
            query = {
                text: `${getQuery} WHERE LOWER(performer) LIKE LOWER($1)`,
                values: [`%${performer}%`],
            };
          }

          if (title && performer) {
            query = {
                text: `${getQuery} WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE LOWER($2)`,
                values: [`%${title}%`, `%${performer}%`],
            };
          }

        const rows = await this._pool.query(query);
        return { songs: rows?.length ? rows.map(mapDBToModelSongs) : [] };
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };

        const rows = await this._pool.query(query);

        if (!rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return { songs: { ...rows.map(mapDBToModel)[0] } };
    }

    async editSongById(id, songs) {
        const { 
            title, year, performer, genre, duration, albumId,
        } = songs;

        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, WHERE id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, id],
        };

        const rows = await this._pool.query(query);

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

        const rows = await this._pool.query(query);

        if (!rows.length) {
            throw new NotFoundError(
                'Gagal menghapus lagu. Id tidak ditemukan',
            );
        }
    }
}


module.exports = SongsService;