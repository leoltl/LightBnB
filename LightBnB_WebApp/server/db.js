const properties = require('./json/properties.json');

module.exports = makeLightbnbDB = (db) => {
  /// Users

  /**
   * Get a single user from the database given their email.
   * @param {String} email The email of the user.
   * @return {Promise<{}>} A promise to the user.
   */
  const getUserWithEmail = function (email) {
    return db.query(`
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1;
    `, [email]).then(res => res.rows.length === 0 ? null : res.rows[0])
  }

  /**
   * Get a single user from the database given their id.
   * @param {string} id The id of the user.
   * @return {Promise<{}>} A promise to the user.
   */
  const getUserWithId = function (id) {
    return db.query(`
    SELECT *
    FROM users
    WHERE id = $1
    LIMIT 1;
    `, [id]).then(res => res.rows.length === 0 ? null : res.rows[0])
  }


  /**
   * Add a new user to the database.
   * @param {{name: string, password: string, email: string}} user
   * @return {Promise<{}>} A promise to the user.
   */
  const addUser = function ( { name, email, password } ) {
    return db.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `, [name, email, password])
  }

  /// Reservations

  /**
   * Get all reservations for a single user.
   * @param {string} guest_id The id of the user.
   * @return {Promise<[{}]>} A promise to the reservations.
   */
  const getAllReservations = function(guest_id, limit = 10) {
    return db.query(`
    SELECT properties.*, reservations.*, avg(rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id 
    WHERE reservations.guest_id = $1
    AND reservations.end_date < now()::date
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;
    `,[guest_id, limit]).then(res => res.rows)
  }

  /// Properties

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
    .then(res => {
      console.log(res.rows)
      return res.rows
    });
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
    getUserWithEmail,
    getUserWithId,
    addUser,
    getAllReservations,
    getAllProperties,
    addProperty
  }
}
