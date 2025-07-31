const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
  // Local Strategy for username/email and password login
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      async (req, email, password, done) => {
        try {
          // Find user by email
          const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password +loginAttempts +lockUntil');

          if (!user) {
            return done(null, false, { 
              message: 'Λάθος email ή κωδικός πρόσβασης' 
            });
          }

          // Check if account is locked
          if (user.isLocked) {
            // Check if lock has expired
            if (user.lockUntil && user.lockUntil > Date.now()) {
              const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
              return done(null, false, { 
                message: `Ο λογαριασμός είναι κλειδωμένος. Δοκιμάστε ξανά σε ${remainingTime} λεπτά.` 
              });
            } else {
              // Unlock the account
              await user.resetLoginAttempts();
            }
          }

          // Check if user is active
          if (!user.isActive) {
            return done(null, false, { 
              message: 'Ο λογαριασμός σας είναι ανενεργός. Επικοινωνήστε με τον διαχειριστή.' 
            });
          }

          // Check password
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (!isMatch) {
            await user.incLoginAttempts();
            
            const attemptsLeft = process.env.MAX_LOGIN_ATTEMPTS - user.loginAttempts;
            if (attemptsLeft > 0) {
              return done(null, false, { 
                message: `Λάθος email ή κωδικός πρόσβασης. ${attemptsLeft} προσπάθειες απομένουν.` 
              });
            } else {
              return done(null, false, { 
                message: 'Ο λογαριασμός κλειδώθηκε λόγω πολλών αποτυχημένων προσπαθειών.' 
              });
            }
          }

          // Reset login attempts on successful login
          if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
          }

          // Update last login
          user.lastLogin = Date.now();
          await user.save();

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy for token authentication
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-jwt-secret',
    passReqToCallback: true
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (req, jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id)
          .select('-password');

        if (!user) {
          return done(null, false);
        }

        // Check if user is still active
        if (!user.isActive) {
          return done(null, false, { 
            message: 'Ο λογαριασμός σας έχει απενεργοποιηθεί' 
          });
        }

        // Check if token was issued before password change
        if (user.passwordChangedAt) {
          const passwordChangedTimestamp = parseInt(
            user.passwordChangedAt.getTime() / 1000,
            10
          );
          if (jwt_payload.iat < passwordChangedTimestamp) {
            return done(null, false, { 
              message: 'Ο κωδικός πρόσβασης άλλαξε. Παρακαλώ συνδεθείτε ξανά.' 
            });
          }
        }

        // Attach user to request
        req.user = user;
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
