const Address = require("../models/addressModel");

// Load Address Page

const loadAddress = async (req, res) => {
  try {
    const User = req.session.userData;

    const address = await Address.find({ user: User._id });
    res.render("userAddress", { User, Address: address });
  } catch (error) {
    console.log(error);
  }
};

// Render Add Address Page

const loadAddAddress = async (req, res) => {
  try {
    const User = req.session.userData;
    res.render("addAddress", { User });
  } catch (error) {
    console.log(error.message);
  }
};

// Add Address

const addAddress = async (req, res) => {
  try {
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
      user: id,
      name: name,
      phone: phone,
      houseName: houseName,
      city: city,
      street: street,
      pincode: pincode,
      state: state,
      type: addressType,
    });
    const addressData = await address.save();
    if (addressData) {
      if (req.query.checkout) {
        res.redirect("/checkout");
      } else {
        res.redirect("/userAddress");
      }
    } else {
      const userData = req.session.userData;
      res.render("addAddress", {
        User: userData,
        errro: "Address Cannot be added",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Render Edit Address Page

const loadEditAddress = async (req, res) => {
  try {
    const userData = req.session.userData;
    const id = req.query.id;
    const address = await Address.findById(id);
    res.render("editAddress", { User: userData, Address: address });
  } catch (error) {
    console.log(error.message);
  }
};

// Edit Address

const editAddress = async (req, res) => {
  try {
    const id = req.body.address_id;
    const updateData = await Address.findById(id);
    if (req.body.name) {
      updateData.name = req.body.name;
    }
    if (req.body.phone) {
      updateData.phone = req.body.phone;
    }
    if (req.body.houseName) {
      updateData.houseName = req.body.houseName;
    }
    if (req.body.city) {
      updateData.city = req.body.city;
    }
    if (req.body.street) {
      updateData.street = req.body.street;
    }
    if (req.body.pincode) {
      updateData.pincode = req.body.pincode;
    }
    if (req.body.state) {
      updateData.state = req.body.state;
    }
    if (req.body.addressType) {
      updateData.type = req.body.addressType;
    }
    await updateData.save();

    res.redirect("/userAddress");
  } catch (error) {
    console.log(error.message);
  }
};

// Set a Default Address

const setDefaultAddress = async (req, res) => {
  try {
      const addressId = req.query.id;
      await Address.updateMany({}, { $set: { is_default: false } });
      const updatedAddress = await Address.findByIdAndUpdate(addressId, { $set: { is_default: true } }, { new: true });

      res.redirect('/userAddress')
  } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


module.exports = {
  loadAddress,
  loadAddAddress,
  addAddress,
  loadEditAddress,
  editAddress,
  setDefaultAddress
};
