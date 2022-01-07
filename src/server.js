require("dotenv").config();

const { getSong } = require("genius-lyrics-api");
const express = require('express');
const cors = require('cors');

const spotifyApi = require("./config/spotifyConfig");

const app = express();
const router = express.Router();

app.use(express.json());
app.use(cors());

router.get('/', (req, res) => {
	spotifyApi.getMyCurrentPlaybackState()
		.then((data) => {
			const [name, artist] = getSongArtist(data.body);

			const options = {
				apiKey: "5Us3yJvy-8vIoKjEQVxd25Ki8IY1zTJmsxDD38d-HA72CEUQWd6VfDvJtBCUiRiE",
				title: name,
				artist: artist
			}

			getSong(options).then(song => {
				const { id, title, url } = song;
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




		}, function (err) {

			// clientId, clientSecret and refreshToken has been set on the api object previous to this call.
			spotifyApi.refreshAccessToken()
				.then(function (data) {
					console.log('The access token has been refreshed!');

					// Save the access token so that it's used in future calls
					spotifyApi.setAccessToken(data.body['access_token']);
					res.redirect(req.originalUrl)
				}, function (err) {
					console.log('Could not refresh access token', err);
				});
		});

});

router.get('/callback', function (req, res) {
	const code = req.query['code'];

	spotifyApi.authorizationCodeGrant(code)
		.then(function (data) {
			// Set the access token on the API object to use it in later calls
			spotifyApi.setAccessToken(data.body['access_token']);
			spotifyApi.setRefreshToken(data.body['refresh_token']);
			res.redirect('/');
		}, function (err) {
			console.log('Something went wrong!', err);
		});
});




app.use('/', router);
app.listen(process.env.PORT || 3333, () => {
	console.log(`Access localhost:${process.env.PORT} to see the lyrics for the currently played song`);
});



function getSongArtist(body) {
	const name = body.item.name;
	const artist = body.item.artists['0'].name;
	return [name, artist];
}