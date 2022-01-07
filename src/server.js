require("dotenv").config();

let SpotifyWebApi = require('spotify-web-api-node');
let betterLyricGet = require("better-lyric-get");

let scopes = ['user-read-playback-state'],
	state = 'spotify_auth_state';
// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
let spotifyApi = new SpotifyWebApi({
	redirectUri: process.env.REDIRECT_URI,
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET
});

// Create and open the authorization URL
let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
let opn = require('opn');
opn(authorizeURL);


let express = require('express');
let cors = require('cors')
let app = express();
let router = express.Router();


app.use(express.json());
app.use(cors());


//now we can set the route path & initialize the API
router.get('/', function (req, res) {
	// Get the currently playing
	spotifyApi.getMyCurrentPlaybackState()
		.then(function (data) {
			let [name, artist] = getSongArtist(data.body);
			betterLyricGet.get(artist, name, function (err, lyrics) {
				res.type('text/html');
				res.write('<head><title>Spotify Lyrics</title></head>');
				res.write('<center>');
				res.write('<h3>' + artist + ' - ' + name + '</h3>');
				if (err) {
					console.log(err + "aspodop");
					res.write('Lyrics not found :(');
				}
				else {
					lyrics = lyrics.replace(/(?:\r\n|\r|\n)/g, '<br />');
					res.write(lyrics);
				}
				res.write('</center>');
				res.end();

			});

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
	let code = req.query['code'];

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
//starts the server and listens for requests
app.listen(process.env.PORT || 3333, () => {
	console.log(`Access localhost:${process.env.PORT} to see the lyrics for the currently played song`);
});



function getSongArtist(body) {
	let name = body.item.name;
	let artist = body.item.artists['0'].name;
	return [name, artist];
}