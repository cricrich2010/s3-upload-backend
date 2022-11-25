/*node express app tat uploads and downloads objects from amazon S3*/
var express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var fileupload = require("express-fileupload");
var amazonS3 = require('aws-sdk');
const { Redshift } = require('aws-sdk');

var app = express();
app.use(cors());
app.use(fileupload());


require("dotenv").config();
// Initializing the amazonS3 object.
console.log(process.env.ACCESS_KEY_ID)
console.log(process.env.REGION)
console.log(process.env.S3_BUCKET)

amazonS3.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    subregion: process.env.REGION,
    region: process.env.REGION
});

var s3Bucket = new amazonS3.S3({ params: { Bucket: process.env.S3_BUCKET } });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// upload route
app.post('/api/upload', function (req, res) {

    if (req.files) {
        var file = req.files.file,
            filename = file.name,
            username = req.body.username;
        var paramsS3 = {
            Key: `${username}/${filename}`,
            Body: file.data,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        // upload file to S3
        s3Bucket.upload(paramsS3, function (err, data) {
            if (err) {
                console.log('Error occured while trying to upload to AWS: ', err);
                res.send(err);
            } else {
                console.log("Upload Success", data.Location);
                res.json(data);
            }
        });
    } else {
        console.log('no files')
    }
});

// app listen
app.listen(8080, function () {
    console.log('Working on port 8080');
});