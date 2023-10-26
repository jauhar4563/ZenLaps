const isLogin = async (req, res, next) => {
    try {
        if (req.session.id3) {

        } else {
            res.redirect('/admin');
        }
        next();

    } catch (error) {
        console.log(error.message);
    }

}



const isLogout = async (req, res, next) => {
    try {

        if (req.session.id3) {
            res.redirect('/admin/home');
        }else{
            next();

        }
       

    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    isLogin,
    isLogout
}