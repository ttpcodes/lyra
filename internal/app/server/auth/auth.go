package auth

import (
	"github.com/sirupsen/logrus"
	"github.com/volatiletech/authboss"
	"github.com/volatiletech/authboss/defaults"

	_ "github.com/volatiletech/authboss/auth"
	_ "github.com/volatiletech/authboss/register"

	"github.com/volatiletech/authboss-clientstate"
)

var ab *authboss.Authboss

func CreateAuth(storer UserStorer) {
	ab = authboss.New()
	ab.Config.Core.ViewRenderer = defaults.JSONRenderer{}
	ab.Config.Modules.RegisterPreserveFields = []string{"email", "username"}
	ab.Config.Paths.Mount = "/auth"
	ab.Config.Storage.CookieState = abclientstate.NewCookieStorer([]byte("hentai"), nil)
	ab.Config.Storage.Server = storer
	ab.Config.Storage.SessionState = abclientstate.NewSessionStorer("unnamed", []byte("hentai"), nil)

	// For some reason defaults needs to be placed here. Not going to question it.
	defaults.SetCore(&ab.Config, true, false)
	emailRule := defaults.Rules{
		FieldName: "email",
		MatchError: "Must be a valid email address.",
		Required: true,
	}
	passwordRule := defaults.Rules{
		FieldName: "password",
		MatchError: "Must be a valid password.",
		Required: true,
	}
	usernameRule := defaults.Rules{
		FieldName: "username",
		MatchError: "Must be a valid username.",
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