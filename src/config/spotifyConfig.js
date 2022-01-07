const SpotifyWebApi = require('spotify-web-api-node');
const opn = require("opn");

const scopes = ['user-read-playback-state'];
const state = 'spotify_auth_state';

const spotifyApi = new SpotifyWebApi({
	redirectUri: process.env.REDIRECT_URI,
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET
});

const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
opn(authorizeURL);

module.exports = spotifyApi;