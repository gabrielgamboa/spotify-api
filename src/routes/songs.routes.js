const { Router } = require("express");
const { getSong } = require("genius-lyrics-api");

const spotifyApi = require("../config/spotifyConfig");

const songsRoutes = Router();

songsRoutes.get("/", (req, res) => {
	spotifyApi.getMyCurrentPlaybackState()
		.then((data) => {
			const [name, artist] = getSongArtist(data.body);

			const options = {
				apiKey: process.env.GENIUS_CLIENT_ID,
				title: name,
				artist: artist
			}

			getSong(options).then(song => {
				const { title } = song;
				let { lyrics } = song;

				res.type('text/html');
				res.write('<head><title>Spotify Lyrics</title></head>');
				res.write('<center>');
				res.write('<h1>' + title + '</h1>');
				lyrics = lyrics.replace(/(?:\r\n|\r|\n)/g, '<br />');
				res.write(lyrics);
				res.write('</center>');
				res.end();

			}).catch(err => console.log(err));
		});

});


function getSongArtist(body) {
	console.log(body);
	const name = body.item.name;
	const artist = body.item.artists['0'].name;
	return [name, artist];
}

module.exports = { songsRoutes };
