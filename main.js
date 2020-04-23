const { GoogleSpreadsheet } = require('google-spreadsheet');
var sslChecker = require("ssl-checker");
const config = require("./config.js");
let ssl_checker = sslChecker.default

let sheet_id = config.sheet_id;

async function load_sheet() {
    // spreadsheet key is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(sheet_id);

    //await doc.useServiceAccountAuth(config);
    // OR load directly from json file if not in secure environment
    await doc.useServiceAccountAuth(require('./cred.json'));
    // OR use API key -- only for read-only access to public sheets
    //doc.useApiKey('YOUR-API-KEY');
    
    await doc.loadInfo(); // loads document properties and worksheets
    //console.log(doc.title);
    //await doc.updateProperties({ title: 'renamed doc' });
    
    const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]

    if ( !sheet) {
      console.error('cannot load sheet')
      return
    }

    //console.log(sheet.title);
    //console.log(sheet.rowCount);
    
    // adding / removing sheets
    //const newSheet = await doc.addSheet({ title: 'hot new sheet!' });

    //console.log('ok')
    //await newSheet.delete();

    // read rows
    const rows = await sheet.getRows(); // can pass in { limit, offset }
    let ret = [];
    for (let row of rows) {
        //console.log(row._rawData)
        //console.log(row._sheet)
        ret.push(row._rawData)
    }
    return ret;

}

async function process() {
  let sites = await load_sheet();

  for (let site of sites) {
    let url = site[1];
    let port = site[2];
    if (port == "") port = 443;
    
    let check_ret = await ssl_checker(url, { method: "GET", port: port })//.then(console.info);
    console.log(check_ret)
  }
  
}

process();

