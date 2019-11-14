module.exports = (db) => {
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
  return {
    getUserWithEmail,
    getUserWithId,
    addUser
  }
};