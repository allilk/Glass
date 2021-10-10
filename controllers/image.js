require("dotenv").config();

const S3 = require("aws-sdk/clients/s3");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
	region,
	accessKeyId,
	secretAccessKey,
});

exports.upload = async (req, res) => {
	const uploadFile = async (file) => {
		const fileStream = fs.createReadStream(file.path);

		const uploadParams = {
			Bucket: bucketName,
			Body: fileStream,
			Key: file.filename,
		};

		return s3.upload(uploadParams).promise();
	};

	const file = req.file;
	const result = await uploadFile(file);

	await unlinkFile(file.path);

	return res.status(200).send({ key: result.Key });
};

exports.get = async (req, res) => {
	const { fileKey } = req.body;
	const getParams = {
		Key: fileKey,
		Bucket: bucketName,
		Expires: 60,
	};

	return res.status(200).send({
		url: s3.getSignedUrl("getObject", getParams),
	});
};
