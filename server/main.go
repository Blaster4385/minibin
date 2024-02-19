package main

import (
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)

var db *sql.DB
var port int
var dbFilePath string

type Bin struct {
	Content  string `json:"content"`
	Language string `json:"language"`
}

const (
	shortIDCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	shortIDLength  = 8
)

func main() {
	flag.IntVar(&port, "port", 8080, "Port number for the server (default is 8080)")
	flag.StringVar(&dbFilePath, "db", "./minibin.db", "Database file path")
	flag.Parse()

	setupServer()
}

func setupServer() {
	mux := http.NewServeMux()
	mux.HandleFunc("/bin", postBin)
	mux.HandleFunc("/bin/", getBin)
	handler := cors.Default().Handler(mux)
	serverAddr := fmt.Sprintf(":%d", port)
	log.Printf("Server listening on port %d...\n", port)
	initDatabase()
	log.Fatal(http.ListenAndServe(serverAddr, handler))
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

func postBin(w http.ResponseWriter, r *http.Request) {
	handleRequestMethod(w, r, "POST", func() {
		body, err := ioutil.ReadAll(r.Body)
		if handleError(w, err, http.StatusInternalServerError) {
			return
		}
		var bin Bin
		err = json.Unmarshal(body, &bin)
		if handleError(w, err, http.StatusBadRequest) {
			return
		}
		id := generateShortID()
		handleError(w, saveBin(id, bin), http.StatusInternalServerError)
		respondWithJSON(w, http.StatusOK, map[string]string{"id": id, "content": bin.Content, "language": bin.Language})
	})
}

func getBin(w http.ResponseWriter, r *http.Request) {
	handleRequestMethod(w, r, "GET", func() {
		id := strings.TrimPrefix(r.URL.Path, "/bin/")
		bin, err := getBinById(id)
		handleError(w, err, http.StatusInternalServerError)
		respondWithJSON(w, http.StatusOK, bin)
	})
}

func handleRequestMethod(w http.ResponseWriter, r *http.Request, expectedMethod string, handler func()) {
	if r.Method != expectedMethod {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	handler()
}

func handleError(w http.ResponseWriter, err error, statusCode int) bool {
	if err != nil {
		http.Error(w, err.Error(), statusCode)
		return true
	}
	return false
}

func respondWithJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

func createTable() error {
	_, err := db.Exec(`
	CREATE TABLE IF NOT EXISTS bins (
		id TEXT PRIMARY KEY,
		content TEXT,
		language TEXT
	)
`)
	return err
}

func getBinById(id string) (Bin, error) {
	var bin Bin
	err := db.QueryRow("SELECT content, language FROM bins WHERE id = ?", id).Scan(&bin.Content, &bin.Language)
	return bin, err
}

func saveBin(id string, bin Bin) error {
	_, err := db.Exec("INSERT INTO bins (id, content, language) VALUES (?, ?, ?)", id, bin.Content, bin.Language)
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
