const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { env } = require('../config/env');
const { ensureUser, getUserById } = require('../repositories/storeRepository');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

if (env.github.clientID && env.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.github.clientID,
        clientSecret: env.github.clientSecret,
        callbackURL: env.github.callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await ensureUser({
            provider: 'github',
            oauthId: profile.id,
            username: profile.username || profile.displayName || profile.id,
          });
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

module.exports = { passport };
