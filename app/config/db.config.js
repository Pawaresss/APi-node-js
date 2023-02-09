module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "",
  DB: "login",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// ไฟล์นี้เป็นการ config กับฐานข้อมูลนะครับ