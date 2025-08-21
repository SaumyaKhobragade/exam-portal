# Online Examination Platform (Coding Focus)

## Overview
This project is a secure online coding examination platform designed for institutes and companies to conduct coding tests seamlessly. It ensures fairness, prevents malpractice, and provides accurate, real-time code evaluation.

---

## Features

- User authentication and role-based access control (admin, candidate)
- Real-time tracking of code submissions and test progress
- Tab/screen switching detection to prevent cheating
- Secure code execution using sandboxed environments or external code execution APIs
- Support for multiple coding languages and test case evaluation
- Instant or deferred feedback for candidates
- Admin dashboard for managing exams, monitoring candidates, and viewing results

---

## Tech Stack

- **Frontend:** React.js (with integrated code editor such as Monaco Editor or CodeMirror)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Real-time Communication:** Socket.IO / WebSockets
- **Code Execution:** Dockerized execution environment or integration with external APIs (e.g., Judge0)
- **Authentication:** JWT based authentication and secure sessions

---

## Installation & Setup

### Prerequisites
- Node.js (v14 or above)
- MongoDB (local or cloud instance)
- Docker (if running code execution locally)

### Clone the repo
```
git clone https://github.com/yourusername/online-examination-platform.git
cd online-examination-platform
```

### Backend Setup
```
cd backend
npm install
```

### Frontend Setup
```
cd frontend
npm install
npm start
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

## Future Enhancements

- Plagiarism detection module
- Advanced analytics dashboard for admins
- Support for more programming languages and custom test cases
- Mobile-friendly responsive UI
- Integration with third-party authentication providers

---

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, enhancements, or feature requests.

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or support, please contact:

- Saumya Khobragade, Saptanshu Wanjari, Hardik Sharma - khobragadesaumya@gmail.com

---

*Built with ❤️ during the iTechRoots Hackathon 2025.*
