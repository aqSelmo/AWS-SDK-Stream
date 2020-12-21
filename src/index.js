const AWS = require('aws-sdk');
const express = require("express");

const app = express();


app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", async function (req, res) {
    try {
        const s3 = new AWS.S3({
            accessKeyId: "",
            secretAccessKey: "",
        });

        s3.headObject({Bucket: '', Key: ''}, (err, data) => {
            const range = req.headers.range;

            if (!range) {
                res.status(400).send("Requires Range header");
            }

            const videoSize = data.ContentLength;

            const CHUNK_SIZE = 10 ** 6;
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

            const contentLength = end - start + 1;
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4",
            };

            res.writeHead(206, headers);
        
            const s3Stream = s3.getObject({Bucket: '', Key: '', Range: `bytes=${start}-${end}`}).createReadStream();

            s3Stream.pipe(res);
        });
    } catch (err) {
        console.log(err);
    }
});

app.listen(3000);