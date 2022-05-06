const config = require("../db");
const sql = require("mssql");

class mapModel {
  async getAllPoint() {
    await sql.connect(config);
    const result = await sql.query("SELECT * FROM AirPollutionPM25");

    return await this.toGeoJSON(result.recordset);
  }

  async No5A(year) {
    await sql.connect(config);
    // Query ข้อมูลจาก SQL
    const result = await sql.query(
      `SELECT TOP(1000) * FROM AirPollutionPM25 WHERE year = '${year}' `
    );

    return await this.toGeoJSON(result.recordset);
  }

  async No5B() {
    await sql.connect(config);
    const result = await sql.query(
      `DECLARE @TH geometry
      
              SELECT @TH=geom
               FROM AirPollutionPM25
               WHERE country='Thailand' AND city='Bangkok'
              
              
               SELECT TOP(50) * FROM AirPollutionPM25  WHERE geom IS NOT NULL
              ORDER BY geom.STDistance(@TH);  `
    );

    return await this.toGeoJSON(result.recordset);
  }

  async No5C() {
    await sql.connect(config);
    const result = await sql.query(
      `DECLARE @TH geometry
      
      SELECT @TH=geom
       FROM AirPollutionPM25
       WHERE country='Thailand' AND city='Bangkok'
      
      
       SELECT TOP(100) * FROM AirPollutionPM25  WHERE geom IS NOT NULL AND country != 'Thailand'
      ORDER BY geom.STDistance(@TH);  `
    );

    return await this.toGeoJSON(result.recordset);
  }

  async No5D() {
    await sql.connect(config);
    const polygon = await sql.query(
      `DECLARE @BK geometry
              SELECT @BK=geometry::EnvelopeAggregate(geom)
              FROM AirPollutionPM25
              WHERE country ='Thailand'

              SELECT @BK.STEnvelope() AS Polygon `
    );

    const result = await sql.query(
      `SELECT * FROM AirPollutionPM25 WHERE country = 'Thailand'`
    );

    const polygonPoint = polygon.recordset[0].Polygon.points;
    let polygonPointArray = [];

    polygonPoint.map((p) => {
      polygonPointArray.push([p.x, p.y]);
    });

    let features = {
      type: "Feature",
      properties: {
        Info: "MBR covering all city points in Thailand.",
      },
      geometry: {
        type: "polygon",
        rings: [polygonPointArray],
      },
    };

    return {
      result: await this.toGeoJSON(result.recordset),
      polygon: features,
    };
  }

  async No5E() {
    await sql.connect(config);
    const result = await sql.query(
      `DECLARE @C VARCHAR(2550)
      
      SELECT Top(1)  @C=country FROM AirPollutionPM25 WHERE year = 2011 GROUP BY country ORDER BY COUNT(city) DESC
              
      SELECT * FROM AirPollutionPM25 WHERE country = @C  `
    );

    return await this.toGeoJSON(result.recordset);
  }

  async No5F(year) {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT  * FROM AirPollutionPM25 WHERE year = '${year}' AND wbinc16_text = 'Low income'`
    );

    return await this.toGeoJSON(result.recordset);
  }

  //นำข้อมูลที่ดึงมาจาก Database มาทำให้อยู่ในรูปแบบ GeoJSON
  async toGeoJSON(result) {
    try {
      let FeatureCollection = { type: "FeatureCollection", features: [] };
      let features = {
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [] },
      };

      for (var i = 0; i < result.length; i++) {
        Object.assign(features.properties, {
          country: result[i].country,
          city: result[i].city,
          year: result[i].Year,
          pm25: result[i].pm25,
          population: result[i].population,
          wbinc16_text: result[i].wbinc16_text,
          region: result[i].region,
          conc_pm25: result[i].conc_pm25,
          color_pm25: result[i].color_pm25,
        });

        if (result[i].geom === null) {
          features.geometry.coordinates = [];
        } else {
          let x = result[i].geom.points[0].x;
          let y = result[i].geom.points[0].y;
          features.geometry.coordinates = [x, y];
        }

        FeatureCollection.features.push(features);

        features = {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [] },
        };
      }

      return FeatureCollection;
    } catch (error) {
      return [];
    }
  }
}

module.exports = mapModel;
