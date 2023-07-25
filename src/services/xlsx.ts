import { readFile } from "fs-extra";
import XLSX from "xlsx";
import { actionLog, logger } from "./logger";
import { userUpdateOne } from "./mongo";

const log = logger(__filename)

export async function processXLSX(files: { [fieldname: string]: Express.Multer.File[] }, sheetNo: string) {
  let xlsxBuffer = await readFile(files.file[0].path)
  var workbook = XLSX.read(xlsxBuffer, { type: "buffer" });
  let sheetData = await processSheet(workbook, parseInt(sheetNo || "0"), files.file[0]?.originalname);
  return sheetData;
}

async function processSheet(workbook: XLSX.WorkBook, sheetNo: number, fileOriginal) {
  const stringDateNow = new Date().toLocaleDateString('vi')
  // var sheetNo = parseInt(req.body ? req.body.sheetNo : "1");
  // var workbook = XLSX.readFile('/app/uploads/'+ req.file.filename);
  var processingSheetNo = workbook.SheetNames[(sheetNo || 4) - 1]; //sheet 4 excel
  var worksheet = workbook.Sheets[processingSheetNo];
  if (!worksheet?.['!ref']) {
    throw new Error("File not valid");
  }
  let updated = 0
  let count = 0
  const sheetData: any = XLSX.utils.sheet_to_json(worksheet);
  for (let [index, val] of sheetData.entries()) {
    if (index == 0) continue;
    count++
    actionLog.info(`Xử lý tuyến: ${JSON.stringify(val?.['Mã tuyến'])}`);
    if (val?.['Mã tuyến']) {
      let resUpdate: any = await userUpdateOne({
        collection: 'T_TuyenKinhDoanhVanTai',
        filterObj: {
          $and: [
            { "MaTuyen": val?.['Mã tuyến'] },
            { "storage": "regular" },
            {
              "TinhTrangQuanLyTuyen._source.MaMuc": {
                $ne: "04"
              }
            }]
        },
        dataMongo: {
          TrangThaiBanGhi: null,
          updateService: `qlvt-fix-${stringDateNow}-${fileOriginal}`,
          ThoiGianGianCachToiThieu: 0
        }
      })
      if (resUpdate?.data?.userUpdateOne?.data?.modifiedCount == 1) {
        updated++
      }
      log.info(JSON.stringify(resUpdate?.data?.userUpdateOne))
    }

    await new Promise(r => setTimeout(r, 50));
    // debug
    // break;
  }
  return {
    rowRead: count,
    recordUpdated: updated
  }

  return
}