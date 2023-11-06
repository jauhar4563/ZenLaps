const Address = require('../models/addressModel')
const User = require('../models/userModel.js')

const loadAddress = async(req,res)=>{
    try{
        const address = await Address.find();
        const userData = req.session.userData;
        res.render('userAddress',{User:userData,Address:address});
    }catch(error){
        console.log(error);
    }
}

const loadAddAddress = async( req,res )=>{
    try{
        const userData = req.session.userData;
        res.render('addAddress',{User:userData});
    }catch(error){
        console.log(error.message);
    }
}

const addAddress = async(req,res)=>{
    try{
        const id = req.session.user_id;
        const name = req.body.name;
        const phone = req.body.phone;
        const houseName = req.body.houseName;
        const city = req.body.city;
        const street = req.body.street;
        const state = req.body.state;
        const pincode = req.body.pincode;
        const addressType = req.body.addressType;
        const address = new Address({
            user:id,
            name: name,
            phone: phone,
            houseName: houseName,
            city:city,
            street:street,
            pincode:pincode,
            state:state,
            type:addressType,

          });
          const addressData = await address.save();
          if(addressData){
            res.redirect('/userAddress');
          }else{
            const userData = req.session.userData;
            res.render('addAddress',{User:userData,errro:"Address Cannot be added"});
          }
    }catch(error){
        console.log(error.message)
    }
}

const loadEditAddress = async(req,res)=>{
    try{
        const userData = req.session.userData;
        const id = req.query.id;
        const address = await Address.findById(id);
        res.render('editAddress',{User:userData,Address:address});
    }catch(error){
        console.log(error.message);
    }
}

const editAddress = async(req,res)=>{
    try{
        const id = req.body.address_id;
        const updateData = await Address.findById(id);
        if (req.body.name) {
            updateData.name = req.body.name;
          }
        if(req.body.phone){
            updateData.phone = req.body.phone;
        }
        if(req.body.houseName){
            updateData.houseName = req.body.houseName;
        }
        if(req.body.city){
            updateData.city = req.body.city;
        }
        if(req.body.street){
            updateData.street = req.body.street;
        }
        if(req.body.pincode){
            updateData.pincode = req.body.pincode;
        }
        if(req.body.state){
            updateData.state = req.body.state;
        }
        if(req.body.addressType){
            updateData.type = req.body.addressType;
        }
        await updateData.save();

        res.redirect('/userAddress');
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    loadAddress,
    loadAddAddress,
    addAddress,
    loadEditAddress,
    editAddress
}