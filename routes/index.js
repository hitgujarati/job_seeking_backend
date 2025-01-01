var express = require('express');
var router = express.Router();
const userSchema = require("../models/userSchema");
const jobSchema = require("../models/jobSchema");
const applicationSchema = require("../models/applicationSchema");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config()
const multer = require('multer');
const path = require('path');


// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');  // Save files in public/uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);  // Unique filename with timestamp
  }
});

// Multer middleware for file upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimetypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (allowedMimetypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPEG are allowed.'));
    }
  }
});





/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index', { title: 'Express' });
});

var role = ({ role }) => {
  if (role === "job seeker") {
    return res.status(400).json({
      msg: "job seeker is not allowed to access this resources !!",
    })
  }
}


// USER ROUTER.................................................................
//Register
router.post('/register', async function (req, res, next) {
  try {
    const { name, email, phone, role, password } = req.body;

    if (!name || !email || !phone || !role || !password) {
      return res.status(400).json({
        status: false,
        msg: "Plese fill full form"
      })
    }

    const isEmail = await userSchema.findOne({ email });
    if (isEmail) {
      return res.status(400).json({
        msg: "Email is alredy exists  !!"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userSchema.create({
      name, email, phone, role, password: hashedPassword
    })


    var token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE });
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      secure: true,
      sameSite: "None"
    }

    res.status(200).cookie("token", token, options).json({
      status: true,
      msg: "User registered successfully !!",
      user,
      token
    })

  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "User Not registered !!",
    })
  }
});

//Login
router.post('/login', async function (req, res, next) {
  try {
    const { email, password, role } = req.body;

    // console.log(req.body);

    if (!email || !password || !role) {
      return res.status(400).json({
        msg: "Plese provide email,password or role !!",
      })
    }

    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(400).json({
        msg: "invalid email or password !!",
      })
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(400).json({
        msg: "invalid email or password !!",
      })
    }

    if (user.role !== role) {
      return res.status(400).json({
        msg: "user not found with this role !!",
      })
    }

    var token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRE });
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      secure: true,
      sameSite: "None"
    }

    res.status(200).cookie("token", token, options).json({
      status: true,
      msg: "User logged in successfully !!",
      user,
      token
    })


  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: false,
      msg: "User Not logged in  !!",
    })
  }
});

//Log out 
router.get('/logout', authMiddleware, async function (req, res, next) {
  try {
    res.status(200).cookie("token", "",
      {
        secure: true,
        sameSite: "None"
      }
    ).json({
      status: true,
      msg: "User logged out successfully !!",
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "User Not logged out !!",
    })
  }
});

router.get('/getuser', authMiddleware, async function (req, res, next) {
  try {
    const user = req.user;
    // console.log(user);
    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "not user",
    })
  }
});



// JOB ROUTER..................................................................
//getAllJobs
router.get('/getAllJobs', async function (req, res, next) {
  try {
    const jobs = await jobSchema.find({ expired: false });

    res.status(200).json({
      status: true,
      msg: "All jobs gotten !!",
      jobs
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "Not all jobs gotten !!",
    })
  }
});

// create job
router.post('/postjob', authMiddleware, async function (req, res, next) {
  try {
    role(req.user);

    const { title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo } = req.body;

    if (!title || !description || !category || !country || !city || !location) {
      return res.status(400).json({
        msg: "please provide full job details !!",
      })
    }

    if ((!salaryFrom || !salaryTo) && !fixedSalary) {
      return res.status(400).json({
        msg: "please either provide fixed salary or ranged salary  !!",
      })
    }

    if (salaryFrom && salaryTo && fixedSalary) {
      return res.status(400).json({
        msg: "can not entered fixed salary and ranged salary  !!",
      })
    }

    const postedBy = req.user._id;
    const job = await jobSchema.create({ title, description, category, country, city, location, fixedSalary, salaryFrom, salaryTo, postedBy });

    res.status(200).json({
      status: true,
      msg: "job posted successfully !!",
      job,
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "job posted fail !!",
      error
    })
  }
});

//getMy jobs
router.get('/getmyjobs', authMiddleware, async function (req, res, next) {
  try {
    role(req.user);

    const myjobs = await jobSchema.find({ postedBy: req.user._id });

    res.status(200).json({
      status: true,
      msg: "My jobs gotten !!",
      myjobs
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "No any jobs available !!",
    })
  }
});

//update job
router.put('/updatejobs/:id', authMiddleware, async function (req, res, next) {
  try {
    role(req.user);

    const { id } = req.params;
    let job = await jobSchema.findById(id);
    if (!job) {
      return res.status(404).json({
        msg: "oops, job not found!!",
      })
    }

    job = await jobSchema.findByIdAndUpdate(id, req.body);

    res.status(200).json({
      status: true,
      msg: "job updated successfully !!",
      job
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "Not job updated successfully  !!",
    })
  }
});

//Delete job
router.delete('/deletejob/:id', authMiddleware, async function (req, res, next) {
  try {
    role(req.user);

    const { id } = req.params;
    let job = await jobSchema.findById(id);
    if (!job) {
      return res.status(404).json({
        msg: "oops, job not found!!",
      })
    }

    await jobSchema.deleteOne();

    res.status(200).json({
      status: true,
      msg: "job deleted successfully !!",
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "not job deleted successfully !!",
    })
  }
});

router.get('/job/:id', authMiddleware, async function (req, res, next) {
  try {
    const { id } = req.params;
    const Job = await jobSchema.findById(id);
    if (!Job) {
      return res.status(404).json({
        msg: "job not found!!",
      })
    }

    res.status(200).json({
      status: true,
      Job,
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "invalid id/cast error!!",
    })
  }
});



// APPLICATION ROUTER..........................................................
//employer Get All Applications
router.get('/employer/getall', authMiddleware, async function (req, res, next) {
  try {
    role(req.user);
    const { _id } = req.user;
    const application = await applicationSchema.find({ "employerID.user": _id });

    res.status(200).json({
      status: true,
      msg: "applications gotten !!",
      application
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "Not applications gotten  !!",
    })
  }
});


//job seeker Get All Applications
router.get('/jobseeker/getall', authMiddleware, async function (req, res, next) {
  try {
    const { role } = req.user;
    if (role === "employer") {
      return res.status(400).json({
        msg: "employer is not allowed to access this resources !!",
      })
    }
    const { _id } = req.user;
    const application = await applicationSchema.find({ "applicantID.user": _id });

    res.status(200).json({
      status: true,
      msg: "applications gotten !!",
      application
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "Not applications gotten !!",
    })
  }
});

//job Seeker Delete Application
router.delete('/deleteapplication/:id', authMiddleware, async function (req, res, next) {
  try {
    const { role } = req.user;
    if (role === "employer") {
      return res.status(400).json({
        msg: "employer is not allowed to access this resources !!",
      })
    }
    const { id } = req.params;

    const application = await applicationSchema.findById(id);

    if (!application) {
      return res.status(404).json({
        msg: "oops,application not found !!",
      })
    }

    await application.deleteOne();

    res.status(200).json({
      status: true,
      msg: "Application Deleted successfully !!",
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "Not Application Deleted !!",
    })
  }
});


// Create application
router.post('/postapplication', authMiddleware, upload.single('resume'), async function (req, res) {
  try {
    const { role } = req.user;
    if (role === "employer") {
      return res.status(400).json({
        msg: "employer is not allowed to access this resources !!",
      })
    }

    const { name, email, coverLetter, phone, address, jobId } = req.body;

    // const { resume } = req.file.originalname;
    const resume = req.file ? req.file.originalname : null;

    // console.log("this is", req.body);

    if (!name || !email || !coverLetter || !phone || !address || !jobId || !resume) {
      return res.status(400).json({
        msg: "Please fill all required fields.",
      });
    }

    const jobDetails = await jobSchema.findById(jobId);
    if (!jobDetails) {
      return res.status(404).json({
        msg: "Job not found.",
      });
    }

    const applicantID = {
      user: req.user._id,
      role: "job seeker"
    };

    const employerID = {
      user: jobDetails.postedBy,
      role: "employer"
    };

    const application = await applicationSchema.create({
      name,
      email,
      coverLetter,
      phone,
      address,
      applicantID,
      employerID,
      resume
    });

    res.status(200).json({
      status: true,
      msg: "Your application was submitted successfully!",
      application
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: false,
      msg: "Failed to submit your application.",
      error: error.message || error
    });
  }
});

module.exports = router;




