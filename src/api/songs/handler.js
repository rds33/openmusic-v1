const autoBind = require('auto-bind');

class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postSongHandler(request, h) {
            this._validator.validateSongPayload(request.payload);
        
            const { songsId } = await this._service.addSong(request.payload);
            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan',
                data: {
                    songId: songsId,
                },
            });
            response.code(201);
            return response;
    }

    async getSongsHandler(request, h) {
        const songs = await this._service.getSongs(request.query);
        return h.response({
            status: 'success',
            data: {
                songs,
            },
        }).code(200);
    }

    async getSongByIdHandler(request, h) {
            const { id } = request.params;
            const { songs: song } = await this._service.getSongById(id);
            return h.response({
                status: 'success',
                data: {
                    song,
                },
            }).code(200);
    }

    async putSongByIdHandler(request, h) {
            this._validator.validateSongPayload(request.payload);
            const { id } = request.params;
            
            await this._service.editSongById(id, request.payload);

            return h.response({
                status: 'success',
                message: 'Lagu berhasil diperbarui',
            }).code(200);
    }

    async deleteSongByIdHandler(request, h) {
            const { id } = request.params;
            await this._service.deleteSongById(id);
            return h.response({
                status: 'success',
                message: 'Lagu berhasil dihapus',
            }).code(200);
    }
}

module.exports = SongsHandler;