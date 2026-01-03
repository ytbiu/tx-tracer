package main

import (
	"flag"
	"fmt"
	"log"
	"os"

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
		// Allow specific origins or reflect the origin
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			// Fallback for non-browser requests or when Origin is missing
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Basic Auth Middleware
	user := os.Getenv("BASIC_AUTH_USER")
	pass := os.Getenv("BASIC_AUTH_PASS")

	if user == "" || pass == "" {
		log.Fatal("BASIC_AUTH_USER and BASIC_AUTH_PASS environment variables must be set")
	}

	auth := gin.BasicAuth(gin.Accounts{
		user: pass,
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "tracer-backend",
		})
	})

	// Public routes (no auth required)
	// r.POST("/decode", handler.HandleDecode)
	// r.POST("/encode", handler.HandleEncode)

	// Protect sensitive routes with Basic Auth
	authorized := r.Group("/", auth)
	{
		authorized.POST("/debug", handler.HandleDebug)
		authorized.POST("/decode", handler.HandleDecode)
		authorized.POST("/encode", handler.HandleEncode)
	}

	fmt.Printf("Starting Debug Server on :%s...\n", *port)
	if err := r.Run(":" + *port); err != nil {
		log.Fatal(err)
	}
}
