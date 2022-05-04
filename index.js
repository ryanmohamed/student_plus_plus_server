const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.json());
app.use(cors());

//how do we update our mysql db?
const db = require('./models');

//routers - middleware
const authRouter = require('./routes/Authorization');
app.use("/auth", authRouter);

const assignmentsRouter = require('./routes/Assignments');
app.use("/assignments", assignmentsRouter);

const courseRouter = require('./routes/Courses');
app.use("/courses", courseRouter);

const userRouter = require('./routes/Users');
app.use("/users", userRouter);


db.sequelize.sync().then(() => {
    //entry point of api - at the same time check if models in folder exist in the database, else create!
    app.listen(3001, () => {
        console.log('Server running on port 3001...');
    });
});



