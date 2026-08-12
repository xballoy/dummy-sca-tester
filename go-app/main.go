package main

import (
	"fmt"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/gogo/protobuf/proto"
	yaml "gopkg.in/yaml.v3"
)

func parseConfig(raw []byte) (map[string]interface{}, error) {
	out := map[string]interface{}{}
	err := yaml.Unmarshal(raw, &out)
	return out, err
}

func newToken(secret []byte) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	return token.SignedString(secret)
}

func label(name string) *string {
	return proto.String(name)
}

func main() {
	router := gin.Default()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": *label("ok")})
	})

	cfg, err := parseConfig([]byte("addr: :8080\n"))
	if err != nil {
		panic(err)
	}
	fmt.Println(cfg)

	token, err := newToken([]byte("insecure-fixture-secret"))
	if err != nil {
		panic(err)
	}
	fmt.Println(token)
}
