'use strict';

const Hapi = require('@hapi/hapi');
const { books } = require('./books.js'); // Assuming you have a data file containing initial book data

const init = async () => {
	const server = Hapi.server({
		port: process.env.PORT || 9000,
		host: 'localhost'
	});
	const { nanoid } = await import('nanoid');
	server.route([
		{
			method: 'POST',
			path: '/books',
			handler: (request, h) => {
				const {
					name,
					year,
					author,
					summary,
					publisher,
					pageCount,
					readPage,
					reading
				} = request.payload;

				if (!name) {
					return h.response({
						status: 'fail',
						message: 'Gagal menambahkan buku. Mohon isi nama buku'
					}).code(400);
				}

				if (readPage > pageCount) {
					return h.response({
						status: 'fail',
						message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
					}).code(400);
				}

				const id = nanoid(16);
				const finished = pageCount === readPage;
				const insertedAt = new Date().toISOString();
				const updatedAt = insertedAt;

				const newBook = {
					id,
					name,
					year,
					author,
					summary,
					publisher,
					pageCount,
					readPage,
					finished,
					reading,
					insertedAt,
					updatedAt
				};

				books.push(newBook); // Assuming you have an array called "books" to store book data
				return h.response({
					status: 'success',
					message: 'Buku berhasil ditambahkan',
					data: {
						bookId: id
					}
				}).code(201);
			}
		},
		{
			method: 'GET',
			path: '/books',
			handler: (request, h) => {
				if (books.length === 0) {
					return h.response ({
						status: 'success',
						data: {
							books: []
						}
					}).code(201);
				}

				return h.response ({
					status: 'success',
					data: {
						books: books.map(book => ({
							id: book.id,
							name: book.name,
							publisher: book.publisher
						}))
					}
				}).code(201);
			}
		},
		{
			method: 'GET',
			path: '/books/{bookId}',
			handler: (request, h) => {
				const { bookId } = request.params;
				const book = books.find(book => book.id === bookId);

				if (!book) {
					return h.response({
						status: 'fail',
						message: 'Buku tidak ditemukan'
					}).code(404);
				}

				return {
					status: 'success',
					data: {
						book
					}
				};
			}
		},
		{
			method: 'PUT',
			path: '/books/{bookId}',
			handler: (request, h) => {
				const { bookId } = request.params;
				const {
					name,
					year,
					author,
					summary,
					publisher,
					pageCount,
					readPage,
					reading
				} = request.payload;

				const bookIndex = books.findIndex(book => book.id === bookId);

				if (bookIndex === -1) {
					return h.response({
						status: 'fail',
						message: 'Gagal memperbarui buku. Id tidak ditemukan'
					}).code(404);
				}

				if (!name) {
					return h.response({
						status: 'fail',
						message: 'Gagal memperbarui buku. Mohon isi nama buku'
					}).code(400);
				}

				if (readPage > pageCount) {
					return h.response({
						status: 'fail',
						message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
					}).code(400);
				}

				books[bookIndex] = {
					...books[bookIndex],
					name,
					year,
					author,
					summary,
					publisher,
					pageCount,
					readPage,
					finished: pageCount === readPage,
					reading,
					updatedAt: new Date().toISOString()
				};

				return h.response({
					status: 'success',
					message: 'Buku berhasil diperbarui'
				});
			}
		},
		{
			method: 'DELETE',
			path: '/books/{bookId}',
			handler: (request, h) => {
				const { bookId } = request.params;
				const bookIndex = books.findIndex(book => book.id === bookId);

				if (bookIndex === -1) {
					return h.response({
						status: 'fail',
						message: 'Buku gagal dihapus. Id tidak ditemukan'
					}).code(404);
				}

				books.splice(bookIndex, 1);

				return h.response({
					status: 'success',
					message: 'Buku berhasil dihapus'
				});
			}
		}
	]);

	await server.start();
	console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
	console.log(err);
	process.exit(1);
});

init();
