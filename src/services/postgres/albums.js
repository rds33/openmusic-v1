const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelAlbums } = require('../../utils');


class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id = `albums-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [
                id, name, year,
            ],
        };

        const { rows } = await this._pool.query(query);

        if (!rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return { album_id: rows[0].id };
    }

    async getAlbums() {
        const result = await this._pool.query('SELECT * FROM albums');
        return result.rows;
    }

    async getAlbumById(id) {
        const queryAlbums = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };
        const { rows: albums } = await this._pool.query(queryAlbums);

        if (!albums.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        const querySongs = {
            text: 'SELECT id,title,performer FROM songs WHERE "albumsId"=$1',
            values: [id],
          };
        
        const songResult = await this._pool.query('SELECT * FROM songs');
        const { rows: songs } = songResult.rows.length
            ? await this._pool.query(querySongs) : songResult;

        return {
            album: {
                ...albums.map(mapDBToModelAlbums)[0],
                songs: [...songs],
            },
            };
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };

        const { rows } = await this._pool.query(query);

        if (!rows.length) {
            throw new NotFoundError(
                'Gagal memperbarui album. Id tidak ditemukan',
            );
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const { rows } = await this._pool.query(query);

        if (!rows.length) {
            throw new NotFoundError(
                'Gagal menghapus Album. Id tidak ditemukan',
            );
        }
    }
}

module.exports = AlbumsService;