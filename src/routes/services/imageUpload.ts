import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 : any = new aws.S3();

aws.config.update({
  secretAccessKey: process.env.S3AWS_SECRETACCESSKEY,
  accessKeyId: process.env.S3AWS_ACCESSKEYID,
  region: process.env.S3AWS_REGION,
});

const fileFilter = (_req: any, file: { mimetype: string; }, cb: (arg0: Error, arg1: boolean) => void) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: "public-read",
    s3,
    bucket: process.env.S3AWS_BUCKETNAME,
    metadata: function (_req: any, _file: any, cb: (arg0: any, arg1: { fieldName: string; }) => void) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function (_req: any, _file: any, cb: (arg0: any, arg1: string) => void) {
      cb(null, Date.now().toString());
    },
  }),
});

export { upload };