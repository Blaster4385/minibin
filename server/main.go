package main

import (
	"database/sql"
	"embed"
	"flag"
	"log"
	"math/rand"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/mattn/go-sqlite3"
)

var (
	db             *sql.DB
	dbFilePath     string
	port           string
	shortIDCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	shortIDLength  = 8
)

type Bin struct {
	Content  string `json:"content"`
	Language string `json:"language"`
	IV       string `json:"iv"`
}

const (
	insertQuery = "INSERT INTO bins (id, content, language, iv) VALUES (?, ?, ?, ?)"
	selectQuery = "SELECT content, language, iv FROM bins WHERE id = ?"
)

//go:embed all:dist
var dist embed.FS

func RegisterHandlers(e *echo.Echo) {
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
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

	if err := createTable(); err != nil {
		log.Fatal(err)
	}
}

func postBin(c echo.Context) error {
	var bin Bin
	if err := c.Bind(&bin); err != nil {
		return err
	}

	id := generateShortID()
	if err := saveBin(id, bin); err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, echo.Map{"id": id})
}

func getBin(c echo.Context) error {
	id := c.Param("id")
	bin, err := getBinByID(id)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, bin)
}

func redirectToURL(c echo.Context) error {
	id := c.Param("id")
	bin, err := getBinByID(id)
	if err != nil {
		c.Logger().Error(err)
		return err
	}

	return c.Redirect(http.StatusFound, bin.Content)
}

func createTable() error {
	_, err := db.Exec("CREATE TABLE IF NOT EXISTS bins (id TEXT PRIMARY KEY, content TEXT, language TEXT, iv TEXT)")
	return err
}

func getBinByID(id string) (Bin, error) {
	var bin Bin
	row := db.QueryRow(selectQuery, id)
	err := row.Scan(&bin.Content, &bin.Language, &bin.IV)
	return bin, err
}

func saveBin(id string, bin Bin) error {
	_, err := db.Exec(insertQuery, id, bin.Content, bin.Language, bin.IV)
	return err
}

func generateShortID() string {
	id := make([]byte, shortIDLength)
	for i := range id {
		id[i] = shortIDCharset[rand.Intn(len(shortIDCharset))]
	}
	return string(id)
}
