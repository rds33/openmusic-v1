const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN collaborations on collaborations.playlist_id = playlists.id
      LEFT JOIN users on users.id = playlists.owner
      where playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const querySong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const resultSong = await this._pool.query(querySong);

    if (!resultSong.rows.length) {
      throw new NotFoundError('Lagu gagal ditambahkan');
    }

    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
        throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    return result.rows[0].id;
  }

  async addPlaylistActivities({
    playlistId, songId, credentialId, action,
  }) {
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
        text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING user_id, playlist_id',
        values: [id, playlistId, songId, credentialId, action, time],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
        throw new InvariantError('Activity gagal ditambahkan');
    }
    return result.rows[0];
  }

  async getPlaylistActivities(playlistId) {
    const query = {
        text: `SELECT users.username, songs.title, playlist_activities.action, playlist_activities.time
        FROM playlist_activities
        LEFT JOIN users on users.id = playlist_activities.user_id
        LEFT JOIN songs on songs.id = playlist_activities.song_id
        WHERE playlist_activities.playlist_id = $1`,
        values: [playlistId.id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
        throw new NotFoundError('Activity tidak ditemukan');
    }

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
        text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
        values: [id],
      };
    const result = await this._pool.query(query);
  
    if (!result.rows.length) {
        throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async deleteSongPlaylist(songId, playlistId) {
    const query = {
        text: 'DELETE FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING song_id',
        values: [songId, playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
        throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
    return result.rows;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
        text: 'SELECT * FROM playlists WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }
      const playlist = result.rows[0];
      if (playlist.owner !== owner) {
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
        await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        try {
          await this._collaborationService.verifyCollaborator(playlistId, userId);
        } catch {
          throw error;
        }
      }
  }
}
  

module.exports = PlaylistsService;