// import { userModel as Users } from '../models';
import aws from 'aws-sdk';
import fs from 'fs';

export default {
  signup(req, res) {
    aws.config.setPromisesDependency();
    aws.config.update({
      accessKeyId: process.env.S3AWS_ACCESSKEYID,
      secretAccessKey: process.env.S3AWS_SECRETACCESSKEY,
      region: process.env.S3AWS_REGION
    });
    const s3 = new aws.S3();
    let params = {
      ACL: 'public-read',
      Bucket: process.env.S3AWS_BUCKETNAME,
      Body: fs.createReadStream(req.file.path),
      Key: `userAvatar/${req.file.originalname}`
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log('Error occured while trying to upload to S3 bucket', err);
      }

      if (data) {
        fs.unlinkSync(req.file.path); // Empty temp folder
        const locationUrl = data.Location;
        /*let newUser = new Users({ ...req.body, avatar: locationUrl });
        newUser
          .save()
          .then(user => {
            res.json({ message: 'User created successfully', user });
          })
          .catch(err => {
            console.log('Error occured while trying to save to DB');
          });*/
      }
    });
  }
};