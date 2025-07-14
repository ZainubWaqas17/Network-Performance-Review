
const Excel = require("exceljs"); // library to read and write excel files
const { Readable } = require("stream"); //converts in memory file(buffer) into readable stream for exceljs

module.exports = async function processExcel(fileBuffer, siteList, start, end, penaltyRate) {
  console.time("📥 Total Time");

  // converts input data to JS Date objects
  const startDate = new Date(start);
  const endDate = new Date(end);
  // transforms siteList into a Set of uppercase trimmed strings for efficient lookup
  const siteSet = new Set(siteList.map((s) => s.trim().toUpperCase()));
  const grouped = {};

  // converts the in-memory file buffer into a stream (push(null) signals the end of the stream)
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  console.time("📂 Load Stream");

  //uses streaming reader of exceljs to avoid loading the whole Excel file into memory
  const workbookReader = new Excel.stream.xlsx.WorkbookReader(stream, {
    entries: "emit",
    sharedStrings: "cache",
    worksheets: "emit",
  });

  let headerMap = {};
  let isHeaderParsed = false;

  console.time("⏱ Row Processing");

  // process each row in excel file
  for await (const worksheet of workbookReader) {
    for await (const row of worksheet) {
      const values = row.values;

      // Parse header row once
      if (!isHeaderParsed) {
        values.forEach((val, index) => {
          if (typeof val === "string") {
            headerMap[val.trim()] = index;
          }
        });
        isHeaderParsed = true;
        continue;
      }

      // filter by site name  
      const site = (values[headerMap["Site"]] || "").toString().trim().toUpperCase();
      if (!siteSet.has(site)) continue;

      // parse and filter by date
      const dateCell = values[headerMap["Fragment Date"]];
      let jsDate;
      if (dateCell instanceof Date) {
        jsDate = dateCell;
      } else if (typeof dateCell === "number") {
        jsDate = new Date(Math.round((dateCell - 25569) * 86400 * 1000));
      } else {
        jsDate = new Date(dateCell);
      }
      if (isNaN(jsDate) || jsDate < startDate || jsDate > endDate) continue;

      // extract tech and downtime
      const tech = (values[headerMap["TEC"]] || "").toString().trim();
      const dt = parseFloat(values[headerMap["DT"]]) || 0;

      // group by site and accumulate DTs
      if (!grouped[site]) grouped[site] = { dt2g: 0, dt4g: 0 };
      if (tech === "2G") grouped[site].dt2g += dt;
      else if (tech === "4G") grouped[site].dt4g += dt;
    }
  }

  console.timeEnd("⏱ Row Processing");
  console.timeEnd("📂 Load Stream");

  // prepare final results
  const results = [];
  for (const site in grouped) {
    const dt2g = grouped[site].dt2g;
    const dt4g = grouped[site].dt4g;
    const common = Math.min(dt2g, dt4g);
    const only2G = dt2g - common;
    const only4G = dt4g - common;
    const totalOutageMin = only2G + only4G;
    const totalOutageDay = totalOutageMin / 1440;
    const category = totalOutageDay > 4 ? totalOutageDay - 4 : 0;
    const penalty = +(category * penaltyRate).toFixed(2);

    // push results per site
    results.push({
      site,
      downtime2G: +dt2g.toFixed(2),
      downtime4G: +dt4g.toFixed(2),
      commonOutage: +common.toFixed(2),
      only2G: +only2G.toFixed(2),
      only4G: +only4G.toFixed(2),
      totalOutageMin: +totalOutageMin.toFixed(2),
      totalOutageDay: +totalOutageDay.toFixed(2),
      category: +category.toFixed(2),
      penalty,
    });
  }

  console.log(`Processed ${results.length} site(s)`);
  console.timeEnd("Total Time");
  return results.length ? results : [{ error: "No matching data for sites or date range." }];
};
