package auth

import (
	"github.com/gorilla/sessions"
	"github.com/sirupsen/logrus"
	"github.com/volatiletech/authboss"
	"github.com/volatiletech/authboss-clientstate"
	"github.com/volatiletech/authboss/defaults"
	"regexp"

	_ "github.com/volatiletech/authboss/auth"
	_ "github.com/volatiletech/authboss/register"
)

var ab *authboss.Authboss

func CreateAuth(storer UserStorer) {
	ab = authboss.New()
	ab.Config.Core.ViewRenderer = defaults.JSONRenderer{}

	// For some reason defaults needs to be placed here. Not going to question it.
	defaults.SetCore(&ab.Config, true, false)
	ab.Config.Modules.RegisterPreserveFields = []string{"email", "username"}
	ab.Config.Paths.Mount = "/auth"
	ab.Config.Storage.CookieState = abclientstate.NewCookieStorer([]byte("hentai"), nil)
	ab.Config.Storage.Server = storer
	sessionStore := abclientstate.NewSessionStorer("unnamed", []byte("hentai"), nil)
	ab.Config.Storage.SessionState = sessionStore

	cstore := sessionStore.Store.(*sessions.CookieStore)
	cstore.Options.HttpOnly = false
	cstore.Options.Secure = false
	emailRule := defaults.Rules{
		FieldName: "email",
		MatchError: "Must be a valid email address.",
		// https://github.com/volatiletech/authboss-sample/blob/master/blog.go
		MustMatch: regexp.MustCompile(`.*@.*\.[a-z]{1,}`),
		Required: true,
	}
	passwordRule := defaults.Rules{
		FieldName: "password",
		MinLength: 6,
		Required: true,
	}
	usernameRule := defaults.Rules{
		FieldName: "username",
		Required: true,
	}
	ab.Config.Core.BodyReader = defaults.HTTPBodyReader{
		ReadJSON: true,
		Rulesets: map[string][]defaults.Rules{
			"register": {emailRule, passwordRule, usernameRule},
		},
		Whitelist: map[string][]string{
			"register": {"email", "password", "username"},
		},
	}

	if err := ab.Init(); err != nil {
		logrus.Fatal("Error when initializing authboss:\n", err)
	}
}

func GetAuth() *authboss.Authboss {
	return ab
}