var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Tetris Homepage' });
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
    res.render('index', { title: 'Tetris Homepage', sessionErr: err });
  }else{
    res.redirect(`/game#${sessionid}`);
  }
});

module.exports = router;
