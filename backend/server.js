const http = require("http");
const app = require("./app");
const port = process.env.PORT || 3001;

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Closing HTTP server.");
  server.close(() => {
    console.log("HTTP server closed.");
    pool.end(() => {
      console.log("MySQL connection pool closed.");
      process.exit(0);
    });
  });
});

const cookieParser = require("cookie-parser");
app.use(cookieParser());
