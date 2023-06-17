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
        title, year, performer, genre, duration, albumsId,
    }) {
        const id = `songs-${nanoid(16)}`;
        
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [
                id, title, year, performer, genre, duration, albumsId,
            ],
        };

        const { rows } = await this._pool.query(query);

        if (!rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return { songsId: rows[0].id };
    }

    async getSongs({ title, performer }) {
        let query = '';
        if (title && performer) {
        query = {
            text: 'SELECT id, title, performer FROM songs where lower(title) like $1 and lower(performer) like $2',
            values: [`%${title.toLowerCase()}%`, `%${performer.toLowerCase()}%`],
        };
        } else if (title) {
        query = {
            text: 'SELECT id, title, performer FROM songs where lower(title) like $1',
            values: [`%${title.toLowerCase()}%`],
        };
        } else if (performer) {
        query = {
            text: 'SELECT id, title, performer FROM songs where lower(performer) like $1',
            values: [`%${performer.toLowerCase()}%`],
        };
        } else {
        query = 'SELECT id, title, performer FROM songs';
        }

        const result = await this._pool.query(query);
        if (!result.rows.length) {
        throw new NotFoundError('Lagu tidak ditemukan');
        }
        return result.rows;
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
}


module.exports = SongsService;