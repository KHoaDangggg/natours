import User from '../models/userModel.mjs';

(async () => {
    const user = (await User.findOne({ email: 'scouteli@gmail.com' }))._id;
    console.log(user);
})();
