const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./../../lib/comon/config');
const utils = require('./../../lib/comon/utils');

const tokenList = {};

var Account = require('./../../db/model/account');
var AdmAccount = require('./../../db/model/accadmin');

async function editPut(req, res) {
  try {
    var account = await Account.findById(req.params.id).exec();
    account.set(req.body);
    var result = await account.save();
    res.send(result);
  } catch (err) {
    res.status(200).send(err);
  }
}

async function editGet(req, res) {
  try {
    Account.findById(req.params.id, function (err, account) {
      res.render('editAccount', {
        title: 'Edit Account',
        account: account,
      });
    });
  } catch (err) {
    res.status(400).send(err);
  }
}
// update db to mongo
async function editPost(req, res) {
  try {
    var account = await Account.findById(req.params.id).exec();
    if (!account) {
      return res.status(400).send({
        status: 'error',
        message: 'The user does not exist ',
      });
    }
    req.body.password = bcrypt.hashSync(req.body.password, 10);

    account.set(req.body);
    await account.save();

    return res.redirect('/list');
  } catch (err) {
    console.log(err);
    res.status(200).send(err);
  }
}

async function login(req, res, next) {
  try {
    var account = await AdmAccount.findOne({ email: req.body.email }).exec();
    var active = await AdmAccount.findOne({
      $and: [{ email: req.body.email }, { active: true }],
    });

    if (!account) {
      return res.status(400).send({
        status: 'error',
        message: 'The user does not exist ',
      });
    }
    if (!bcrypt.compareSync(req.body.password, account.password)) {
      return res.status(400).send({
        status: 'error',
        message: 'The password is not correct',
      });
    }
    if (!active) {
      return res.status(400).send({
        status: 'error',
        message: 'Please active your account',
      });
    }

    const user = {
      email: req.body.email,
      password: req.body.password,
    };
    const token = jwt.sign(user, config.secret, {
      expiresIn: config.tokenLife,
    });
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, {
      expiresIn: config.refreshTokenLife,
    });
    tokenList[refreshToken] = user;
    const response = {
      token,
      refreshToken,
    };
    // var check =  userToken.find({ email: req.body.email }, async (err, docs) => {
    //     if (docs.length) {
    //         // userToken.set(req.body);
    //         db.collection('usertokens').updateOne({email: req.body.email}, {$set:{token: response.token, refreshToken: response.refreshToken}})
    //     } else {
    //         var accToken = new userToken({
    //             email: req.body.email,
    //             token: response.token,
    //             refreshToken: response.refreshToken
    //         });
    //         var result =  accToken.save();
    //     }
    // }).exec();

    res.cookie('x-token', response.token);
    req.session.Admin = {
      email: account['email'],
      fname: account['fname'],
      lname: account['lname'],
      id: account['_id'],
    };
    res.redirect('./');
  } catch (err) {
    res.status(500).send(err);
  }
}

async function register(req, res) {
  try {
    AdmAccount.find({ email: req.body.email }, async (err, docs) => {
      if (docs.length) {
        res.status(400).json({
          code: 400,
          message: 'Mail already exists !!!',
        });
      } else {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        var account = new AdmAccount({
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email,
          password: req.body.password,
          picture: {
            path: req.file.path,
            size: req.file.size,
          },
          active: true,
        });
        await account.save();
        res.redirect('/');
      }
    }).exec();
  } catch (err) {
    res.status(500).send(err);
  }
}

async function refresh_token(req, res) {
  const { refreshToken } = req.body;
  if (refreshToken && refreshToken in tokenList) {
    try {
      await utils.verifyJwtToken(refreshToken, config.refreshTokenSecret);
      const user = tokenList[refreshToken];
      const token = jwt.sign(user, config.secret, {
        expiresIn: config.tokenLife,
      });
      const response = {
        token,
      };
      res.status(200).json(response);
    } catch (err) {
      res.status(403).json({
        message: 'Invalid refresh token',
      });
    }
  } else {
    res.status(400).json({
      message: 'Invalid request',
    });
  }
}

async function profile(req, res) {
  res.json(req.decoded);
}

async function created(req, res) {
  var datecreated = req.body.created;
  var todayStart = new Date(datecreated);
  var todayEnd = new Date(datecreated);
  todayEnd.setHours(23);
  todayEnd.setMinutes(59);
  todayEnd.setSeconds(59);
  todayEnd.setMilliseconds(999);
  try {
    if (datecreated) {
      var result = await Account.find(
        { created: { $gte: todayStart, $lte: todayEnd } },
        function (err, docs) {}
      );
      res.send({
        date: req.body,
        startDate: todayStart,
        endDate: todayEnd,
        count: result.length,
        result,
      });
    } else {
      Account.find({}, function (err, docs) {
        res.render('listCreated', {
          listCreated: docs,
        });
      });
    }
  } catch (err) {
    res.status(200).send(err);
  }
}

module.exports = {
  editPut,
  editGet,
  editPost,
  login,
  register,
  refresh_token,
  profile,
  created,
};
