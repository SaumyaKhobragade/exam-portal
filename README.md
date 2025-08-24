# CodeSecure - Online Examination Platform

## Overview
This project is a secure online coding examination platform designe---

## 📁 Project Structure

```
exam-portal/
├── src/
│   ├── controllers/     # Route handlers and business logic
│   ├── models/         # MongoDB schemas and models
│   ├── routes/         # Express route definitions
│   ├── middlewares/    # Authentication and validation middleware
│   ├── services/       # AI grading and external API services
│   ├── utils/          # Utility functions and helpers
│   ├── views/          # EJS templates for frontend
│   └── db/            # Database connection configuration
├── public/
│   ├── javascripts/   # Client-side JavaScript files
│   ├── stylesheets/   # CSS files and styling
│   └── images/        # Static images and assets
├── config/            # Configuration files
├── index.js           # Main application entry point
├── app.js             # Express app configuration
├── package.json       # Dependencies and scripts
└── README.md          # Project documentation
```

---

## 🎯 Usage

### For Organizations/Admins:
1. **Register** as an admin for your organization
2. **Create exams** with coding questions and test cases
3. **Schedule** exam sessions with specific durations
4. **Monitor** candidates in real-time during exams
5. **Review** results with AI-generated feedback and scores
6. **Export** reports and analytics for further analysis

### For Candidates/Students:
1. **Register** with your organization's domain email
2. **Browse** available exams on your dashboard
3. **Start** exam in secure fullscreen mode
4. **Code** in the integrated IDE with syntax highlighting
5. **Run tests** to validate your solutions
6. **Submit** before time expires
7. **View** results and AI feedback after evaluation

### For Developers:
1. **Set up** the development environment
2. **Configure** API keys and database connections
3. **Extend** AI grading services or add new features
4. **Customize** security measures and UI components
5. **Deploy** to your preferred hosting platformd companies to conduct coding tests seamlessly. It ensures fairness, prevents malpractice, and provides accurate, real-time code evaluation with advanced AI-powered grading and comprehensive security features.

---

## ✨ Features

### 🔐 **Security & Anti-Cheating**
- Advanced copy-paste prevention system with browser extension blocking
- Fullscreen enforcement with automatic exam termination on violations
- Tab/screen switching detection to prevent cheating
- Developer tools detection and blocking
- Right-click and context menu disabling
- Real-time security violation monitoring and logging

### 👥 **User Management & Authentication**
- Role-based access control (Owner, Admin, User/Candidate)
- JWT-based authentication with secure sessions
- Domain-specific organization management
- User registration with email verification
- Session validation and automatic logout

### 📝 **Exam Management**
- Interactive exam creation with rich text editor
- Multiple programming language support (Python, JavaScript, Java, C++, C#, Go, Rust)
- Test case validation and automated grading
- Real-time exam monitoring and progress tracking
- Flexible exam scheduling and duration management
- Question navigation with progress indicators

### 🤖 **AI-Powered Grading System**
- Multiple AI providers integration (OpenAI GPT, Google Gemini, Hugging Face)
- Intelligent fallback system for reliable grading
- Comprehensive code analysis (correctness, quality, efficiency, best practices)
- Detailed feedback generation with improvement suggestions
- Automated scoring with category-wise breakdown

### 💻 **Code Execution & IDE**
- Integrated web-based IDE with syntax highlighting
- Judge0 API integration for secure code execution
- Real-time test case evaluation
- Multiple programming languages support
- Input/output handling and error reporting
- Performance metrics (execution time, memory usage)

### 📊 **Analytics & Reporting**
- Admin dashboard for managing exams and users
- Real-time exam statistics and monitoring
- User performance analytics
- Detailed exam results and scoring reports
- Export functionality for results

---

## 🛠 Tech Stack

### **Backend**
- **Framework:** Node.js + Express.js (v5.1.0)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + bcrypt for secure authentication
- **Email Service:** Nodemailer for notifications

### **Frontend**
- **Template Engine:** EJS for server-side rendering
- **Styling:** Custom CSS with responsive design
- **JavaScript:** Vanilla JS with modern ES6+ features
- **UI Components:** Custom IDE, dashboards, and forms

### **AI & External Services**
- **AI Providers:** OpenAI GPT, Google Gemini AI, Hugging Face
- **Code Execution:** Judge0 API for secure sandboxed execution
- **Email:** SMTP integration for notifications

### **Security & DevOps**
- **Environment Variables:** dotenv for configuration management
- **CORS:** Cross-origin resource sharing configuration
- **Session Management:** Cookie-based secure sessions
- **Git:** Version control with comprehensive .gitignore

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or above)
- **MongoDB** (local or cloud instance)
- **Git** for version control

### Quick Start
```bash
# Clone the repository
git clone https://github.com/SaumyaKhobragade/exam-portal.git
cd exam-portal

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Or start production server
npm start
```

### Environment Configuration
Create a `.env` file in the root directory with the following variables:
```env
# Database
MONGODB_CONNECTION_STRING=your_mongodb_connection_string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# AI API Keys
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Email Configuration
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password

# Application
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

---

## Usage

1. Register as a candidate or admin.
2. Admin creates coding exams with questions and schedules.
3. Candidates participate in exams with live code editing.
4. Code is evaluated automatically; results are visible in real-time.
5. Tab switch and cheating attempts are logged and flagged.
6. Admin reviews candidates’ performance and downloads reports.

---

## Folder Structure
```
/backend # Express server and API
/frontend # React client application
/execution-server # Sandboxed code runner (optional Docker setup)
```


---

## 🚀 Future Enhancements

### **Phase 1 (Short-term)**
- Multi-tenancy support for SaaS deployment
- Advanced analytics dashboard with performance metrics
- Mobile application for iOS and Android
- White-label customization options

### **Phase 2 (Medium-term)**
- AI-powered proctoring with webcam monitoring
- Blockchain-based certificate verification
- Integration marketplace for LMS systems
- Advanced plagiarism detection algorithms

### **Phase 3 (Long-term)**
- Microservices architecture for scalability
- Real-time collaboration features
- Machine learning models for predictive analytics
- Global multi-language and multi-timezone support

### **Technical Improvements**
- Performance optimization and caching
- Automated testing and CI/CD pipeline
- Security compliance (GDPR, FERPA, SOC2)
- Load balancing and auto-scaling capabilities

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or support, please contact:

- Saumya Khobragade - khobragadesaumya@gmail.com
- Saptanshu Wanjari - saptanshuwanjari63@gmail.com
- Hardik Sharma - 26hardiksharma@gmail.com
- Jalad Bhairao - jaladbhairav@gmail.com    
- Pramansh Patil - pramansh.cse@gmail.com

---

*Built with ❤️ during the iTechRoots Hackathon 2025.*
