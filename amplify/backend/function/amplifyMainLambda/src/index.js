
const axios = require('axios');
const {Buffer} = require('buffer')
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Amplify = require('aws-amplify').default;
const { API, Auth, Storage } = Amplify

exports.handler = async (event) => {

   const evBody = JSON.parse(event.body)
   console.log("Course ID >>", evBody.courseid);
   console.log("Picture >>", evBody.picture);
   console.log("Folder >>", evBody.folder);
   console.log("Bucket >>", evBody.bucket);

   const courseId = evBody.courseid;
   const bucket = evBody.bucket;
   const folder = evBody.folder;
   const fullFileName = evBody.picture;
   const arr = fullFileName.split(".");
   const fileName = arr[0];
   const ext = arr[1];
   const getUrl = "https://de.khnu.km.ua/vtestpic.aspx?M=k"+courseId+"&I="+fileName+"&R="+ext;

   let resp = await axios.get(
      getUrl, { responseType: "arraybuffer" }
    )
    .then(response => Buffer.from(response.data, 'binary'))
    .then( async element => {
        let result = await putObject(bucket, folder+fullFileName, element).then(r => {
            console.log("Inserted Successfully!");
            return r;
        });
        console.log("Result >> ", result);
        return result;
    });

    return {
        statusCode: 200,
        headers: {
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(resp),
    };
};

async function putObject (bucket, fileName, file) {
  try {
      const params = {
          Bucket: bucket,
          Key: fileName,
          Body: file,
          ContentEncoding: 'base64',
          ContentType: 'image/jpeg'
      }

      const data = await s3.putObject(params).promise();
      console.log("Data was successfully inserted")
      return `{"result": "Successfully inserted: ${fileName}"}`;
  } catch (e) {
      //throw new Error(`Could not retrieve file from S3: ${e.message}`)
      return `{"result": "Error: ${e.message}"}`;
  }
}
