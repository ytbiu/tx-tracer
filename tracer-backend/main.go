package main

import (
	"flag"
	"fmt"
	"log"

	"tracer-backend/handler"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	port := flag.String("port", "8080", "HTTP server port")
	flag.Parse()

	// Initialize Gin router
	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.POST("/debug", handler.HandleDebug)
	r.POST("/decode", handler.HandleDecode)
	r.POST("/encode", handler.HandleEncode)

	fmt.Printf("Starting Debug Server on :%s...\n", *port)
	if err := r.Run(":" + *port); err != nil {
		log.Fatal(err)
	}
}
