import mysql from 'mysql2/promise';

console.log("Creating connection pool...");

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'demo_nodejs',
    password: '123456cc'
})

export default pool;
