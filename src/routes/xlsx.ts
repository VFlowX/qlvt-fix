import { actionLog, logger } from '@services/logger';
import { processXLSX } from '@services/xlsx';
import express from 'express';
import multer from 'multer';
const log = logger(__filename)
var upload = multer({
  storage: multer.diskStorage({
    destination: function (_req, file, cb) {
      if (file.fieldname === "file") {
        cb(null, './uploads/xlsx/')
      }
      else if (file.fieldname === "tepdinhkem") {
        cb(null, './uploads/tepdinhkem/');
      }
    },
    filename: function (_req, file, cb) {
      // cb(null, `${Date.now()}_${file.originalname}`);
      cb(null, `${file.originalname}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    file.originalname = Buffer.from(file.originalname.normalize("NFD").replace(/\p{Diacritic}/gu, "").replaceAll('đ', 'd'), 'latin1').toString('utf8')
    cb(null, true)
  },
});
const router = express.Router();
router.post('/ping', async function (_req, res) {
  res.status(200).send("QLVT bugfix is up and running!")
})

router.post('/chuyen_tuyen_luu_tam_excel/preview', upload.fields([{
  name: 'file', maxCount: 1
}]), async (req, res) => {
  if (!req.files) {
    res.status(400).send('File not found');
    return
  }
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  actionLog.info(`chuyen_tuyen_luu_tam_excel/preview: ${files?.file?.[0].originalname}`)

  // let responseFileName = String(files?.file?.[0].originalname).replace('.xlsx', '.docx');
  const result = await processXLSX(files, req.body?.sheetNo);
  actionLog.info(JSON.stringify(result))
  res.status(200).send(result);
})
export default router