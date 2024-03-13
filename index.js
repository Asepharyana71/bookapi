'use strict';

const Hapi = require('@hapi/hapi');

const init = async () => {
	const server = Hapi.server({
		port: 9000,
		host: 'localhost'
	});
	const { nanoid } = await import('nanoid');

	server.route([
		{
			method: 'POST',
			path: '/books',
			handler: (request, h) => {
				// Handle storing book data
				return h.response({
					status: 'success',
					message: 'Buku berhasil ditambahkan',
					data: {
						bookId: nanoid(16)
					}
				}).code(201);
			}
		},
		{
			method: 'GET',
			path: '/books',
			handler: (request) => {
				const { name, reading, finished } = request.query;
				const books = [
					{
						id: nanoid(16),
						name: 'Book A',
						publisher: 'Publisher A',
						reading: true,
						finished: false
					},
					{
						id: nanoid(16),
						name: 'Book B',
						publisher: 'Publisher B',
						reading: false,
						finished: true
					}
				];

				let filteredBooks = books;

				if (name) {
					filteredBooks = filteredBooks.filter(book =>
						book.name.toLowerCase().includes(name.toLowerCase())
					);
				}

				if (reading !== undefined) {
					const isReading = reading === '1';
					filteredBooks = filteredBooks.filter(book =>
						book.reading === isReading
					);
				}

				if (finished !== undefined) {
					const isFinished = finished === '1';
					filteredBooks = filteredBooks.filter(book =>
						book.finished === isFinished
					);
				}

				return {
					status: 'success',
					data: {
						books: filteredBooks
					}
				};
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
