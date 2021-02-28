const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();


/* GET home page. */
router.get('/', authController.auth, function(req, res) {
    res.render('index', { 
        title: 'Tetris Battle',
        //cookies: req.cookies,
        session: req.session,
     });
  });

router.post('/', (req,res) => {
  const ID_LENGTH = 6;
  const sessionid = req.body.sessionid;
  const sessionChar = "abcdefghjklmnopqrstwxyz0123456789";
  let err= "";

  console.log(`Create/Joining session: ${sessionid}`);

  // error checking
  if (sessionid.length !== ID_LENGTH){    // 글자수 체크
    err = "Session ID must be 6 characters long";
  }else{
    for (let i = 0; i < ID_LENGTH; i++) { // 사용 가능한 문자로만 구성돼있는지 체크
      if (!(sessionChar.includes(sessionid.charAt(i)))){
        err = "Invalid character in ID";
        break;
      }
    }
  }
  // 에러 없을시에만 /game으로 이동
  if (err){
    return res.status(400).render('index', {
        title: 'Tetris Battle',
        sessionErr: err,
        message: '',
        session: req.session,
    });
  }else{
    return res.redirect(`/game#${sessionid}`);
  }
});

router.get('/game', function(req, res, next) {
    res.render('game', {
        title: 'Play - Tetris Battle',
        session: req.session,
    });
});

router.get('/register', (req, res)=>{
    res.render('register', {
        title: 'Register - Tetris Battle',
    });
})

router.get('/update_info', authController.auth, (req, res)=>{
    res.render('update_info', { 
        title: 'My Page - Tetris Battle',
        session: req.session,
    }); // views의 register 파일과 연동
})

router.get('/about', function(req, res) {
    res.render('about', {
        title: 'About - Tetris Battle',
        session: req.session,
        about: true,
    });
});

router.get('/logout', (req, res)=>{
    //res.clearCookie('jwt');
    res.clearCookie('sid');
    req.session.destroy();
    res.status(200).redirect("/");    // views의 login 파일과 연동
})

module.exports = router;