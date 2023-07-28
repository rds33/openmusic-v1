/* eslint-disable max-len */
const autoBind = require('auto-bind');

class PlaylistsHandler {
    constructor(playlistsService, songsService, validator) {
      this._playlistsService = playlistsService;
      this._songsService = songsService;
      this._validator = validator;
  
      autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async postPlaylistSongHandler(request, h) {
        this._validator.validateAddSongToPlaylist(request.payload);

        const { playlistId } = request.params;
        const { songId } = request.payload;

        const { id: credentialId } = request.auth.credentials;

        await this._songsService.verifySong(songId);
        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

        const playlistSongId = await this._playlistsService.addSongToPlaylist({ playlistId, songId });
        const action = 'add';
        await this._playlistsService.addPlaylistActivities({
            playlistId, songId, credentialId, action,
        });

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
            data: {
                playlistSongId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._playlistsService.getPlaylists(credentialId);

        return {
        status: 'success',
        data: {
            playlists,
        },
        };
    }

    async getPlaylistActivitiesHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;
        await this._playlistsService.verifyPlaylistAccess(id, credentialId);
        const activities = await this._playlistsService.getPlaylistActivities({ id });

        return {
        status: 'success',
        data: {
            playlistId: id,
            activities,
        },
        };
    }

    async getSongsInPlaylistHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

        const playlist = await this._playlistsService.getPlaylistById(playlistId);
        const songs = await this._songsService.getSongsInPlaylist(playlistId);

        return {
            status: 'success',
            data: {
                playlist: {
                id: playlist.id,
                name: playlist.name,
                username: playlist.username,
                songs,
                },
            },
        };
    }

    async getPlaylistSongActivitiesHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(id, credentialId);
        const activities = await this._playlistsService.getPlaylistActivities({ id });

        return {
            status: 'success',
            data: {
                playlistId: id,
                activities,
            },
        };
    }

    async deletePlaylistByIdHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(id, credentialId);
        await this._playlistsService.deletePlaylistById(id);
        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
            };
    }

    async deleteSongFromPlaylistHandler(request) {
        this._validator.validateDeleteSongsFromPlaylist(request.payload);
        const { playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistsService.deleteSongPlaylist(songId, playlistId);
        const action = 'delete';

        await this._playlistsService.addPlaylistActivities({
        playlistId, songId, credentialId, action,
        });
        return {
            status: 'success',
            message: 'Lagu di dalam playlist berhasil dihapus',
            };
    }
}


module.exports = PlaylistsHandler;