import express from "express";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import multer from "multer";
import dotenv from "dotenv";
import { engine } from "express-handlebars";
import session from 'express-session';
import { fileURLToPath } from "url";
import { sql, setupDB } from "./db.js";
import bcrypt from "bcrypt";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const VIEWS_DIR = path.join(__dirname, "views");
const PARTIALS_DIR = path.join(VIEWS_DIR, "partials");
const PUBLIC_DIR = path.join(__dirname, "public");
const upload = multer();
const PORT = process.env.PORT || 3003;

// Template engine
app.engine("html", engine({ extname: ".html", defaultLayout: false, partialsDir: PARTIALS_DIR }));
app.set("view engine", "html");
app.set("views", VIEWS_DIR);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(PUBLIC_DIR));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "thing-secret",
        resave: false,
        saveUninitialized: true,
    })
);
// DB Function

setupDB();
// Routes
app.get("/", (req, res) => {
    res.render("index", { title: "Thing Token" });
});

app.get("/cameras", async (req, res) => {
    const cameras = await sql`SELECT * FROM cameras`;
    res.render("cameras", { title: "Cameras", cameras });
});
app.get("/photos", async (req, res) => {
    const photos = await sql`SELECT * FROM photos`;
    res.render("photos", { title: "Photos", photos });
});
app.get("/api/photos/:id", async (req, res) => {
    const assetId = req.params.id;
    const response = await fetch(`https://immich.mattwiner.org/api/assets/${assetId}/thumbnail?size=preview`, {
        headers: {
            "x-api-key": process.env.IMMICH_API_KEY
        }
    });
    if (!response.ok) {
        return res.status(response.status).send("Immich image not available");
    }
    res.setHeader("Content-Type", response.headers.get("content-type"));
    response.body.pipe(res);
});
if (!process.env.VERCEL && !process.env.NOW_REGION) {
    const PORT = process.env.PORT || 8088;
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
    });
}
export default app;