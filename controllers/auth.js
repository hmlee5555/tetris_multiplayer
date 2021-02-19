const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST, // 배포할 땐 그 ip주소 입력
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

exports.login = async (req, res) => {
    try{
        const { email, password } = req.body;
        //let modal = document.querySelector(".modal-wrapper");

        if( !email || !password ){
            //modal.style.display = "flex";
            return res.status(400).render('index', {
                message: 'Please fill in all fields'
            })
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) =>{
            console.log(results);
            if( !results || !(await bcrypt.compare(password, results[0].password))){
                //modal.style.display = "flex";
                res.status(401).render('index', {
                    message: 'Email or Password is incorrect'
                })
            } else{
                const id = results[0].id;
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                }); // jwt.sign({ id = id }, process.env.JWT_SECRET) 와 같음

                console.log("The token is "+token);
                
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24*60*60*1000 // 밀리 세컨드로 바꿈
                    ),
                    httpOnly: true  // 브라우서에서만 쿠키 사용 가능
                }

                //res.cookie('jwt', token, cookieOptions );   // 로그인 이후 브라우저에 쿠키 넣음
                req.session.token = token;
                res.status(200).redirect("/");  // 리다이렉트
            }
        })

    } catch (error){
        console.log(error);
    }
}

exports.register = (req, res)=>{
    console.log(req.body);

    /*
    // form 에서 name='name' 인 것
    const name = req.body.name;
    // form 에서 name='email' 인 것
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    */
    
    // 위의 주석과 기능 동일
    const { name, email, password, passwordConfirm } = req.body;

    if( !(name && email && password && passwordConfirm) ){
        // 빈칸 다 채워라
        return res.render('register', {
            message: "Please fill in all fields"
        })
    }

    db.query('SELECT name FROM users WHERE name = ?', [name], async (error, results)=>{
        if(error){  // connection, web, ...etc something wrong
            console.log(error);
        }
        if( results.length > 0 ){
            return res.render('register', {
                message: "Nickname already in use"
            })
        }
        else{
            db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results)=>{
                if(error){  // connection, web, ...etc something wrong
                    console.log(error);
                }

                if( results.length > 0 ){
                    return res.render('register', {
                        message: "Email already in use"
                    })
                } else if( password !== passwordConfirm ){
                    return res.render('register', {
                        message: "Passwords do not match"
                    })
                }

                let hashedPassword = await bcrypt.hash(password, 8);
                console.log(hashedPassword);

                db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword }, (error, results)=>{
                    if(error){
                        console.log(error);
                    }else{
                        console.log(results);
                        console.log("User registered");
                        return res.render('index');
                    }
                })
            });
        }
    });
}

exports.update = async (req, res)=>{
    console.log(req.body);

    /*
    // form 에서 name='name' 인 것
    const name = req.body.name;
    // form 에서 name='email' 인 것
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    */
    
    // 위의 주석과 기능 동일
    const { name, email, password, passwordConfirm } = req.body;

    if(req.session.user.name == name){
        console.log("User name was not changed!");
        if(!password){
            return res.render('update_info', {
                message: 'Please provide password',
                session: req.session
            })
        }
        if( password !== passwordConfirm ){
            return res.render('update_info', {
                message: "Passwords do not match",
                session: req.session
            })
        }
        
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);
        db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (error, results)=>{
            if(error){
                console.log(error);
            }else{
                console.log(results);
                console.log("User registered");
                return res.render('index', { 
                    title: 'Tetris Homepage',
                    //cookies: req.cookies,
                    session: req.session,
                 });
            }
        })
    }
    else{
        console.log("User name changed!");
        db.query('SELECT name FROM users WHERE name = ?', [name], async (error, results)=>{
            if(error){  // connection, web, ...etc something wrong
                console.log(error);
            }
            if( results.length > 0 ){
                return res.render('update_info', {
                    message: "Passwords do not match",
                    session: req.session
                })
            }
            else{
                if(!password){
                    return res.render('update_info', {
                        message: 'Please provide password',
                        session: req.session
                    })
                }
                if( password !== passwordConfirm ){
                    return res.render('update_info', {
                        message: "Passwords do not match",
                        session: req.session
                    })
                }
                
                let hashedPassword = await bcrypt.hash(password, 8);
                console.log(hashedPassword);
                db.query('UPDATE users SET password = ?, name = ? WHERE email = ?', [hashedPassword, name, email], (error, results)=>{
                    if(error){
                        console.log(error);
                    }else{
                        console.log(results);
                        res.status(200).redirect("/");  // 리다이렉트
                        /*
                        return res.render('index', { 
                            title: 'Tetris Homepage',
                            //cookies: req.cookies,
                            session: req.session,
                         });
                        */
                    }
                })
            }
        });
    }
}

exports.auth = (req, res, next)=>{
    // 클라이언트 쿠키에서 토큰을 가져옴
    //let token = req.cookies.jwt;
    // 세션
    
    let token = req.session.token;
    // 토큰이 있다면 토큰을 복호화한 후 db에서 유저정보 가져옴
    
    if (token){
        jwt.verify(token, process.env.JWT_SECRET, async function(err, decoded){
            await console.log(decoded.id);
            await db.query('SELECT * FROM users WHERE id= ?', [decoded.id], (error, results) =>{
                console.log(results[0]);
                req.session.user = results[0];
                next();
            })
        })
    } else{
        next();
    }
}

