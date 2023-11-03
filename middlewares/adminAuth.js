const isLogin = async (req, res, next) => {
    try {
        if (req.session.admin) {

        } else {
            res.redirect('');
        }
        next();

    } catch (error) {
        console.log(error.message);
    }

}



const isLogout = async (req, res, next) => {
    try {

        if (req.session.admin) {
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