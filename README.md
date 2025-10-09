# Rentify - Rental Marketplace Platform

A web-based rental marketplace that connects homeowners with renters through an intuitive platform for property discovery, listing, and rental applications.

## 🏗️ Project Structure

```
rentify/
├── backend/                 # Django REST Framework API
│   ├── rentify/            # Main Django project
│   ├── accounts/           # User authentication & profiles
│   ├── properties/         # Property listings management
│   ├── applications/       # Rental application system
│   └── requirements.txt    # Python dependencies
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Development environment
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 12+
- Docker (optional)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🎯 Features

### MVP 1.0
- ✅ User authentication (Homeowners & Renters)
- ✅ Property listing management
- ✅ Property browsing with filters
- ✅ Rental application system
- ✅ Admin dashboard

### Future Enhancements
- 🔄 Notifications system
- 🔄 Favorites/bookmarks
- 🔄 Payment integration
- 🔄 Map-based discovery
- 🔄 Chat system

## 🛠️ Tech Stack

- **Backend**: Django REST Framework, PostgreSQL, JWT Authentication
- **Frontend**: React.js, TailwindCSS, Axios
- **Deployment**: Docker, Render/Vercel
- **Storage**: AWS S3/Cloudinary for images

## 📊 User Roles

1. **Homeowner**: List properties, manage applications
2. **Renter**: Browse properties, submit applications
3. **Admin**: Moderate listings, manage users

## 🔧 Development

See individual README files in `backend/` and `frontend/` directories for detailed setup instructions.
