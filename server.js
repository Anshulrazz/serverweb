const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const winston = require('winston');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup morgan for HTTP request logging
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));

// Setup winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => logger.info('MongoDB connected...'))
    .catch(err => logger.error(err));

// Blog Schema
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    imageUrl: {  // Change image to imageUrl
        type: String,
        required: true,
    },
});

const Blog = mongoose.model('Blog', blogSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    overview: {
        type: String,
        required: true,
    },
    imageUrl: {  // Change image to imageUrl
        type: String,
        required: true,
    },
    fileUrl: {  // Change file to fileUrl
        type: String,
        required: true,
    },
});

const Project = mongoose.model('Project', projectSchema);

// Create a new blog
app.post('/api/blogs', async (req, res) => {
    logger.info('Request to create a new blog');
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);

    const { title, content, imageUrl } = req.body;

    if (!title || !content || !imageUrl) {
        logger.error('Missing required fields for blog creation');
        return res.status(400).send({ message: 'All fields are required' });
    }

    const blog = new Blog({ title, content, imageUrl });
    try {
        await blog.save();
        logger.info('Blog created successfully');
        res.send({ message: 'Blog created successfully' });
    } catch (error) {
        logger.error('Error saving blog:', error);
        res.status(500).send({ message: 'Error creating blog', error });
    }
});

// Get all blogs
app.get('/api/blogs', async (req, res) => {
    logger.info('Request to fetch all blogs');
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        logger.error('Error fetching blogs:', error);
        res.status(500).send({ message: 'Error fetching blogs', error });
    }
});

// Create a new project
app.post('/api/projects', async (req, res) => {
    logger.info('Request to create a new project');
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);

    const { title, overview, imageUrl, fileUrl } = req.body;

    if (!title || !overview || !imageUrl || !fileUrl) {
        logger.error('Missing required fields for project creation');
        return res.status(400).send({ message: 'All fields are required' });
    }

    const project = new Project({ title, overview, imageUrl, fileUrl });
    try {
        await project.save();
        logger.info('Project created successfully');
        res.send({ message: 'Project created successfully' });
    } catch (error) {
        logger.error('Error saving project:', error);
        res.status(500).send({ message: 'Error creating project', error });
    }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
    logger.info('Request to fetch all projects');
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        logger.error('Error fetching projects:', error);
        res.status(500).send({ message: 'Error fetching projects', error });
    }
});

// Setup nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// Email route
app.post('/api/send-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        logger.error('Email is required');
        return res.status(400).send({ message: 'Email is required' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Anshul | Portfolio',
        text: 'Hello! This is Anshul Kumar',
        html: `
        <html>
        <link href="https://fonts.googleapis.com/css2?family=Yatra+One&display=swap" rel="stylesheet">
        <body style="margin: 0; padding: 0; font-family: "Yatra One", system-ui;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin: 20px auto;">
                <tr>
                    <td align="center" bgcolor="#4CAF50" style="padding: 20px 0; color: #ffffff; font-size: 24px;">
                        <h1 style="margin: 0;">Thank You for Subscribing!</h1>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="color: #333333; font-size: 16px;">
                                    <p style="margin: 0;">Hello,</p>
                                    <p style="margin: 20px 0;">Thank you for subscribing to our newsletter! We are excited to have you with us. Stay tuned for the latest updates, news, and special offers straight to your inbox.</p>
                                    <p style="margin: 20px 0;">We promise to keep you informed and engaged with the best content. If you have any questions or suggestions, feel free to reach out to us at any time.</p>
                                    <p style="margin: 20px 0;">Best regards,<br>Anshul Kumar</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" style="padding: 30px 30px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td align="center" style="color: #333333; font-size: 14px;">
                                    <p style="margin: 0;">Follow us on:</p>
                                    <a href="https://www.facebook.com/anshul.kumar.639692" style="text-decoration: none; color: #4CAF50; margin: 0 10px;">Facebook</a> |
                                    <a href="https://x.com/anshul_000012" style="text-decoration: none; color: #4CAF50; margin: 0 10px;">Twitter</a> |
                                    <a href="https://www.instagram.com/anshul_6396" style="text-decoration: none; color: #4CAF50; margin: 0 10px;">Instagram</a> |
                                    <a href="https://www.linkedin.com/in/anshul-kumar-b92421306/" style="text-decoration: none; color: #4CAF50; margin: 0 10px;">LinkedIn</a> |
                                    <a href="https://www.youtube.com/@codewith47" style="text-decoration: none; color: #4CAF50; margin: 0 10px;">Youtube</a>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="color: #999999; font-size: 12px; padding-top: 20px;">
                                    <p style="margin: 0;">You received this email because you subscribed to our newsletter.</p>
                                    <p style="margin: 0;">If you no longer wish to receive emails from us, <a href="#" style="text-decoration: none; color: #4CAF50;">unsubscribe here</a>.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            logger.error('Error sending email:', error);
            return res.status(500).send({ message: 'Error sending email', error });
        }

        logger.info('Email sent: ' + info.response);
        res.send({ message: 'Email sent successfully' });
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
