import pool from '../configs/connectDB';

let getHomepage = async (req, res) => {
    const [rows, fields] = await pool.execute(`
             select s.student_id, s.student_name, s.age, c.class_name 
             from student as s join class as c on s.class_id = c.class_id`);

    const classes = await getClass();
    const message = req.session.message;
    req.session.message = null;
    return res.render('index.ejs', { dataUser: rows, classes: classes, message: message })
}

let getClass = async (req, res) => {
    const [classes, fieldsClass] = await pool.execute(`
    select c.class_id, c.class_name from class as c`);
    return classes;
}

let getUserByAge = async (req, res) => {
    let ageSearch = req.body.params;
    const [rows, fields] = await pool.execute(`
    select s.student_name, s.age, c.class_name 
    from student as s join class as c on s.class_id = c.class_id 
    where age = ?`, [ageSearch]);

    return res.render('index.ejs', { dataUser: rows, test: 'abc string test' })
}

let getDetailPage = async (req, res) => {
    let userId = req.params.id;
    let [user] = await pool.execute(`select * from student where student_id = ?`, [userId]);
    return res.send(JSON.stringify(user))
}

let createNewUser = async (req, res) => {
    let { student_name, age, class_id } = req.body;

    await pool.execute('insert into student(student_name, age, class_id) values (?, ?, ?)',
        [student_name, age, class_id]);

    return res.redirect('/')
}

let deleteUser = async (req, res) => {
    let userId = req.body.userId;
    await pool.execute('delete from student where student_id = ?', [userId])
    return res.redirect('/');
}

let getEditPage = async (req, res) => {
    let id = req.params.id;
    const classes = await getClass();
    console.log(classes);
    let [students] = await pool.execute('Select * from student where student_id = ?', [id]);
    return res.render('update.ejs', { dataUser: students[0], classes: classes });
}

let postUpdateUser = async (req, res) => {
    let { student_name, age, class_id, student_id } = req.body;
    try {
        await pool.execute('update student set student_name= ?, age = ? , class_id = ? where student_id = ?',
            [student_name, age, class_id, student_id]);
    } catch (error) {
        req.session.message = 'Update failed';
        res.redirect('/');
    }
    req.session.message = 'Update successful';

    res.redirect('/');
}

let getUploadFilePage = async (req, res) => {
    return res.render('uploadFile.ejs')
}


let handleUploadFile = async (req, res) => {
    if (req.q) {
        return res.send(req.fileValidationError);
    }
    else if (!req.file) {
        return res.send('Please select an image to upload');
    }
    res.send(`You have uploaded this image: <hr/><img src="/image/${req.file.filename}" width="500"><hr /><a href="/upload">Upload another image</a>`);
}


let handleUploadMultipleFiles = async (req, res) => {
    if (req.fileValidationError) {
        return res.send(req.fileValidationError);
    }
    else if (!req.files) {
        return res.send('Please select an image to upload');
    }

    let result = "You have uploaded these images: <hr />";
    const files = req.files;
    let index, len;

    // Loop through all the uploaded images and display them on frontend
    for (index = 0, len = files.length; index < len; ++index) {
        result += `<img src="/image/${files[index].filename}" width="300" style="margin-right: 20px;">`;
    }
    result += '<hr/><a href="/upload">Upload more images</a>';
    res.send(result);

}

module.exports = {
    getHomepage, getDetailPage, createNewUser, deleteUser, getEditPage, postUpdateUser,
    getUploadFilePage, handleUploadFile, handleUploadMultipleFiles
}