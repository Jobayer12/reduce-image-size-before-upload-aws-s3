const express = require('express')

var moment = require('moment');
const aws = require('aws-sdk');
const storageS3 = require('multer-s3-transform')
const sharp = require('sharp');
var multer = require('multer')
const app = express();

var spacesEndpoint = new aws.Endpoint('****');

aws.config.update({
	secretAccessKey: '******',
	accessKeyId: '****',
	region: '****'
});

const s3 = new aws.S3({
	endpoint: spacesEndpoint,
});
const upload = multer({
	storage: storageS3({
		acl: 'public-read',
		contentType: function (req, file, cb) {
			cb(null, file.mimetype)
		},
		s3,
		bucket: 'dbt2',
		cacheControl: 'max-age=31536000',
		metadata: function (req, file, cb) {
			cb(null, {
				fieldName: file.fieldname
			});
		},
		key: function (req, file, cb) {
			ind = Math.floor(Math.random() * 10);
			currentTime = moment();
			dir = currentTime.format('YY').toString() + '/' + currentTime.format('WW').toString()
			cb(null, 'y/im/u/' + dir + '/' + Date.now().toString() + ind.toString() + path.extname(file.originalname));
		},
		shouldTransform: function (req, file, cb) {
			cb(null, /^image/i.test(file.mimetype))
		},
		transforms: [{
			id: 'original',
			key: function (req, file, cb) {
				ind = Math.floor(Math.random() * 10);
				currentTime = moment();
				dir = currentTime.format('YY').toString() + '/' + currentTime.format('WW').toString()
				cb(null, 'y/im/u/' + dir + '/' + Date.now().toString() + ind.toString() + '.webp');
			},
			transform: function (req, file, cb) {
				cb(null, sharp().webp())
			}
		}],

	}),
	limits: { fileSize: 25 * 1024 * 1024 }
});


const singleUpload = upload.single('image');

app.get('/', function(req,res){
	return res.send('hello');
})
app.post('/updateProfilePicture', function (req, res) {
	singleUpload(req, res, function (err) {
		if (err) {
			return res.status(422).json({ message: 'Image Upload Error' });
		}
		return res.status(200).json({
			imageUrl: req.file.transforms[0].location,
			code: 200,
			message: 'success'
		});
	});

});

app.listen(3200, () => {
	console.log('server on!')
})