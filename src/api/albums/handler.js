/* eslint-disable camelcase */
// const ClientError = require('../../exceptions/ClientError');
const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postAlbumHandler(request, h) {
            this._validator.validateAlbumPayload(request.payload);

            const { album_id } = await this._service.addAlbum(request.payload);

            const response = h.response({
                status: 'success',
                message: 'Album berhasil ditambahkan',
                data: { albumId: album_id },
            });
            response.code(201);
            return response;
    }

    async getAlbumsHandler() {
        const albums = await this._service.getAlbums();
        return {
            status: 'Success',
            data: {
                albums,
            },
        };
    }

    async getAlbumByIdHandler(request, h) {
            const { id } = request.params;
            const { album } = await this._service.getAlbumById(id);
            return h.response({
                status: 'success',
                data: {
                    album,
                },
            }).code(200);
    }

    async putAlbumByIdHandler(request, h) {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;

            await this._service.editAlbumById(id, request.payload);
            return h.response({
                status: 'success',
                message: 'Album berhasil diperbarui',
            }).code(200);
    }

    async deleteAlbumByIdHandler(request, h) {
            const { id } = request.params;
            await this._service.deleteAlbumById(id);
            
            return h.response({
                status: 'success',
                message: 'Album berhasil dihapus',
            }).code(200);
    }
}

module.exports = AlbumsHandler;