const config = require("../db");
const sql = require("mssql");
const fs = require("fs");
const fastcsv = require("fast-csv");
const path = require("path");

class Upload {
  async No4(filename) {
    let stream = fs.createReadStream(
      path.join("public/assets/upload", filename)
    );
    let csvData = [];
    let csvStream = fastcsv
      .parse()
      .on("data", function (data) {
        csvData.push(data);
      })
      .on("end", async function () {
        csvData.shift();

        //นำคำที่อ่านได้ในไฟล์ csv มา insert ลง database
        for (var i = 0; i < csvData.length; i++) {
          await sql.connect(config).then((pool) => {
            return pool
              .request()
              .input("Country", sql.VarChar, csvData[i][0])
              .input("City", sql.VarChar, csvData[i][1])
              .input("Year", sql.VarChar, csvData[i][2])
              .input("Pm25", sql.Float, parseFloat(csvData[i][3]))
              .input("Latitude", sql.Float, parseFloat(csvData[i][4]))
              .input("Longitude", sql.Float, parseFloat(csvData[i][5]))
              .input("Population", sql.Int, parseInt(csvData[i][6]))
              .input("Wbinc16_text", sql.VarChar, csvData[i][7])
              .input("Region", sql.VarChar, csvData[i][8])
              .input("Conc_Pm25", sql.VarChar, csvData[i][9])
              .input("Color_Pm25", sql.VarChar, csvData[i][10])
              .query(
                `INSERT INTO AirPollutionPM25  ( Country, City, Year, Pm25, Latitude, Longitude, Population, Wbinc16_text, Region, Conc_Pm25, Color_Pm25 )
                     VALUES (@Country,@City,@Year,@Pm25,@Latitude,@Longitude,@Population,@Wbinc16_text,@Region,@Conc_Pm25,@Color_Pm25);
                      
                      UPDATE AirPollutionPM25 
                      SET geom = geometry::STGeomFromText( 'POINT(' + CAST([Longitude] AS VARCHAR(20)) + ' ' + CAST([Latitude] AS VARCHAR(20)) + ')',4326) where Latitude IS NOT NULL and Longitude IS NOT NULL;
                      `
              );
          });

          if (i % 2 == 0) {
            console.log("Loading...");
          } else {
            console.log("Loading..");
          }
        }
      });

    stream.pipe(csvStream);
    return "Upload File Complete";
  }

  async No4A() {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT country,city FROM AirPollutionPM25 WHERE Pm25 > 50 AND Year = 2015`
    );

    const filename = this.writeCSV(result.recordset);
    return filename;
  }

  async No4B() {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT country,AVG(pm25) as AVG FROM AirPollutionPM25 GROUP BY country ORDER BY AVG(Pm25) DESC`
    );

    const filename = this.writeCSV(result.recordset);
    return filename;
  }

  async No4C(country) {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT country,city,year,pm25 FROM AirPollutionPM25 WHERE country='${country}'`
    );

    const filename = this.writeCSV(result.recordset);
    return filename;
  }

  async No4D(year, colorpm25) {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT SUM(population) AS Affected FROM AirPollutionPM25 WHERE year = ${year} AND color_Pm25 = '${colorpm25}'`
    );

    const filename = this.writeCSV(result.recordset);
    return filename;
  }

  async writeCSV(result) {
    //สร้างชื่อไฟล์โดยใช้วันที่
    const filename = new Date().toJSON().slice(0, 10);

    //เขียนไฟล์
    const writeCSV = fs.createWriteStream(
      `public/assets/download/${filename}.csv`
    );
    fastcsv.write(result, { headers: true }).pipe(writeCSV);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(1000);

    return filename + ".csv";
  }
}

module.exports = Upload;
