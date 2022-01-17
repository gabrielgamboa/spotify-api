
const { Router } = require("express");
const { songsRoutes } = require("./songs.routes");

const spotifyApi = require("../config/spotifyConfig");

const routes = Router();

routes.use("/songs", songsRoutes);

routes.get('/login', (req, res) => {
	const scopes = ['user-read-playback-state'];
	const state = 'spotify_auth_state';
	const authUrl = spotifyApi.createAuthorizeURL(scopes, state);
	res.redirect(authUrl + "&show_dialog=true");
});

routes.get('/callback', function (req, res) {
	const { code } = req.query;

	spotifyApi.authorizationCodeGrant(code)
		.then(function (data) {
			const { access_token, refresh_token } = data.body;

			spotifyApi.setAccessToken(access_token);
			spotifyApi.setRefreshToken(refresh_token);

            req.spotifyAccount = { access_token, refresh_token };
            
			res.redirect('/songs');
			
		}, function (err) {
			console.log('Something went wrong!', err);
		});
});



module.exports = { routes };