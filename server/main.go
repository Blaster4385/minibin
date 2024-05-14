package main

import (
	"database/sql"
	"embed"
	"flag"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB
var dbFilePath string
var port string

type Bin struct {
	Content  string `json:"content"`
	Language string `json:"language"`
  IV string `json:"iv"`
}

const (
	shortIDCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	shortIDLength  = 8
)

var (
	//go:embed all:dist
	dist embed.FS
)

func RegisterHandlers(e *echo.Echo) {
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Skipper:    nil,
		Root:       "dist",
		Index:      "index.html",
		HTML5:      true,
		Filesystem: http.FS(dist),
	}))
	e.Use(middleware.CORS())
	e.POST("/bin", postBin)
	e.GET("/bin/:id", getBin)
	e.GET("/r/:id", redirectToURL)
}

func main() {
	flag.StringVar(&port, "port", "8080", "HTTP server port")
	flag.StringVar(&dbFilePath, "db", "minibin.db", "Path to SQLite database file")
	flag.Parse()

	initDatabase()
	e := echo.New()
	RegisterHandlers(e)
	e.Logger.Fatal(e.Start(":" + port))
}

func initDatabase() {
	var err error
	db, err = sql.Open("sqlite3", dbFilePath)
	if err != nil {
		log.Fatal(err)
	}

	err = createTable()
	if err != nil {
		log.Fatal(err)
	}
}

func postBin(echoContext echo.Context) error {
	bin := Bin{}
	err := echoContext.Bind(&bin)
	if err != nil {
		return err
	}
	id := generateShortID()
	err = saveBin(id, bin)
	if err != nil {
		return err
	}
	return echoContext.JSON(http.StatusCreated, echo.Map{
		"id": id,
	})
}

func getBin(echoContext echo.Context) error {
	id := echoContext.Param("id")
	bin, err := getBinById(id)
	if err != nil {
		return err
	}
	return echoContext.JSON(http.StatusOK, bin)
}

func redirectToURL(echoContext echo.Context) error {
	id := echoContext.Param("id")
	bin, err := getBinById(id)
	if err != nil {
		echoContext.Logger().Error(err)
		return err
	}

	url := bin.Content
	return echoContext.Redirect(http.StatusFound, url)
}

func createTable() error {
	_, err := db.Exec("CREATE TABLE IF NOT EXISTS bins (id TEXT PRIMARY KEY, content TEXT, language TEXT, iv TEXT)")
	return err
}

func getBinById(id string) (Bin, error) {
	row := db.QueryRow("SELECT content, language, iv FROM bins WHERE id = ?", id)
	bin := Bin{}
	err := row.Scan(&bin.Content, &bin.Language, &bin.IV)
	return bin, err
}

func saveBin(id string, bin Bin) error {
	_, err := db.Exec("INSERT INTO bins (id, content, language, iv) VALUES (?, ?, ?, ?)", id, bin.Content, bin.Language, bin.IV)
	return err
}

func generateShortID() string {
	rand.Seed(time.Now().UnixNano())
	id := make([]byte, shortIDLength)
	for i := range id {
		id[i] = shortIDCharset[rand.Intn(len(shortIDCharset))]
	}
	return string(id)
}
