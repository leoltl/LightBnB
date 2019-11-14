module.exports = makeDB = (db) => {
  /**
   * Get all properties.
   * @param {{}} options An object containing query options.
   * @param {*} limit The numbeCOALESCE( r of results, 'NA') to return.
   * @return {Promise<[{}]>}  A promise to the properties.
   */
  const getAllProperties = function(options, limit = 10) {
    const queryParams = [];
    
    //handle selecting and joining relevant tables
    let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    LEFT JOIN property_reviews ON properties.id = property_id
    `;

    //handle where clause
    if (Object.values(options).some(item => item !== '')) {
      queryString += 'WHERE ';
      for (let key in options) {
        if (key === 'minimum_rating') { continue; }
        queryString += queryParams.length === 0 ? '' : ' AND ';
        switch (key) {
          case 'city':
            queryParams.push(`%${options[key]}%`);
            queryString += `city ILIKE $${queryParams.length}`;
            continue;
          case 'owner_id':
            queryParams.push(parseInt(options[key]));
            queryString += `owner_id = $${queryParams.length}`;
            continue;
          case 'minimum_price_per_night':
            queryParams.push(parseInt(options[key]) || 0);
            queryString += `cost_per_night >= $${queryParams.length}`;
            continue;
          case 'maximum_price_per_night':
            queryParams.push(parseInt(options[key]) || 100000000);
            queryString += `cost_per_night < $${queryParams.length}`;
            continue;
        }
      }
    }
    
    //handle group by and having clause
    queryString += " GROUP BY properties.id"
    if (options.minimum_rating) {
      queryParams.push(parseInt(options.minimum_rating) || 0);
      queryString += ` HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
    }
    queryParams.push(limit);
    queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;

    // 5
    console.log(queryString, queryParams);

    // 6 
    return db.query(queryString, queryParams)
    .then(res =>  res.rows);
  }


  /**
   * Add a property to the database
   * @param {{}} property An object containing all of the property details.
   * @return {Promise<{}>} A promise to the property.
   */
  const addProperty = function(property) {
    const columns = Object.keys(property);
    const values = Object.values(property);

    return db.query(`
    INSERT INTO properties 
    (${columns.join(',')})
    VALUES 
    (${columns.map((_, i) => `$${i + 1}`).join(', ')})
    RETURNING *
    `, values);
  }

  return {
    getAllProperties,
    addProperty
  }
}
