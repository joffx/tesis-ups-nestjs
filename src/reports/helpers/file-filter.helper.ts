export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('No file'), false);
  const fileExtensions = file.mimetype.split('/')[1];
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  if (allowedExtensions.includes(fileExtensions)) {
    return callback(null, true);
  }
  callback(null, false);
};
