const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");//ประกาศตัวเเปรอ้างผู้ใช้บางรายเข้าสู่ระบบ JWT มักใช้เพื่อตรวจสอบสิทธิ์ผู้ใช้
var bcrypt = require("bcryptjs");//ประกาศตัวเเปรสำหรับแฮชรหัสผ่าน


//------------------------------------------signup------------------------------------------------------
exports.signup = (req, res) => {//ฟังก์ชันที่ใช้ในการลงทะเบียนผู้ใช้ใหม่ในแอปพลิเคชัน
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      res.send({ message: "User registered successfully!" });//เมื่อcreateเรียกใช้เมธอด หากสำเร็จ จะมีผู้ใช้ที่สร้างขึ้นในฐานข้อมูล 
    })             
    .catch(err => {
      res.status(500).send({ message: err.message });
    }); // หากมีข้อผิดพลาด ระบบจะส่งการตอบกลับพร้อมรหัสสถานะ 500 และข้อความแสดงข้อผิดพลาด
};


//------------------------------------------signin------------------------------------------------------
exports.signin = (req, res) => {//ฟังก์ชันที่ใช้เพื่อลงชื่อผู้ใช้ในแอปพลิเคชัน
  User.findOne({
    where: {
      username: req.body.username //โมเดลเพื่อค้นหาผู้ใช้ในฐานข้อมูลที่มีusernameตรงที่เรากรอกรึป่าว
    }
  })
    .then(user => {
      if (!user) {//หากไม่พบผู้ใช้ ระบบจะส่งการตอบกลับพร้อมรหัสสถานะ 404 และข้อความระบุว่าไม่พบผู้ใช้
        return res.status(404).send({ message: "User Not found." });
      }


//------------------------------------------bcrypt------------------------------------------------------
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,//ระบบจะเปรียบเทียบรหัสผ่านที่ให้ไว้กับรหัสผ่านที่แฮชซึ่งจัดเก็บไว้ในฐานข้อมูลโดยใช้compareSyncวิธีการ ของ bcrypt
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,//หากรหัสผ่านไม่ถูกต้อง ระบบจะส่งการตอบกลับพร้อมรหัสสถานะ 401 โทเค็นการเข้าถึงที่เป็นโมฆะ และข้อความแจ้งว่ารหัสผ่านไม่ถูกต้อง
          message: "Invalid Password!"
        });
      }


      
//------------------------------------------token------------------------------------------------------
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 //หากรหัสผ่านถูกต้อง รหัสผ่านจะสร้าง JSON Web Token (JWT) โดยใช้รหัสผู้ใช้ ข้อมูลลับ และเวลาหมดอายุ 86400 วินาที (24 ชั่วโมง)
      });
      res.status(200).send({// เเละส่งการตอบกลับพร้อมรหัสสถานะ 200 สำเร็จและ ID ผู้ใช้ ชื่อผู้ใช้ อีเมล และโทเค็น JWT ที่สร้างขึ้น
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });//หากมีข้อผิดพลาด เช่น หากมีปัญหากับฐานข้อมูล ระบบจะส่งการตอบกลับพร้อมรหัสสถานะ 500 และข้อความแสดงข้อผิดพลาด
};
