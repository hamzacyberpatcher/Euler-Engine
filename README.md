# EulerEngine

EulerEngine is a robust platform designed for mathematical and programming problem solving, contests, and grading. Built with Django and Django REST Framework for the backend, and vanilla HTML/CSS/JS for the frontend, it provides a comprehensive system for managing users, problems, competitions, and submissions.

## Features

- **Custom User Management**: Custom user model supporting email and username-based authentication, complete with registration and token-based login.
- **Problem Bank**: A central repository for problems categorized by topics (e.g., Algebra, Calculus, Polynomials) featuring problem statements, ratings, reference solutions, and max points.
- **Contest System**: 
  - Time-bound competitions with defined start and end times.
  - User registration for specific contests.
  - Association of problems with contests, including contest-specific point values.
  - Real-time countdowns for upcoming contests.
- **Submissions & Grading**: Users can submit answers to contest problems. The system tracks submissions, their grading status (Pending, Graded), and scores.
- **Leaderboards**: Dynamic leaderboards tracking users' total scores and ranks within specific contests.
- **Admin Panel**: An interface for staff members to create contests, create problems, and assign problems to specific contests.

## Tech Stack

### Frontend
- **HTML5, CSS3, Vanilla JavaScript**
- **Architecture**: Single Page App-like experience with separate HTML files for different views (Home, Login, Register, Admin, Contest, Problem).
- **Styling**: Custom CSS (`style.css`) with responsive design and modern UI components.

### Backend
- **Framework**: Django, Django REST Framework (DRF)
- **Database**: SQLite (default, configured for development)
- **Authentication**: DRF Token Authentication

## Project Structure

- `frontend/`: The frontend application containing HTML pages, CSS styles, and JavaScript logic.
  - `index.html`: Home page displaying active contests.
  - `admin.html`: Admin panel for managing contests and problems.
  - `app.js`: Main JavaScript file handling API communication and UI logic.
  - `style.css`: Global stylesheet.
  - `login.html`, `register.html`: Authentication pages.
  - `contest.html`, `problem.html`, `registration.html`: Contest-specific views.
- `EulerEngine Backend/`: The main Django workspace.
  - `core/`: The core Django application containing the models, views, serializers, and URLs that make up the EulerEngine API.
  - `eulerengine_backend/`: The primary Django project configuration and settings.
- `Project_Phase_1-1.pdf`: Reference documentation containing project requirements and use cases.

## Setup Instructions

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EulerEngine
   ```

2. **Navigate to the backend directory**
   ```bash
   cd "EulerEngine Backend"
   ```

3. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

4. **Install dependencies**
   Ensure you have installed Django, Django REST Framework, and django-cors-headers.
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

5. **Apply database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create a superuser (admin)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```
   The API will now be accessible at `http://127.0.0.1:8000/`. You can access the Django admin panel at `http://127.0.0.1:8000/admin/`.

### Frontend Setup

1. **Open the frontend directory**
   Open a new terminal window and navigate to the frontend folder.
   ```bash
   cd EulerEngine/frontend
   ```

2. **Serve the frontend files**
   You can serve the files using Python's built-in HTTP server:
   ```bash
   python -m http.server 8080
   ```

3. **Access the application**
   Open your web browser and navigate to `http://localhost:8080/`. Make sure your backend server is running concurrently to allow the frontend to communicate with the API.

## API Endpoints Overview

The `core` application exposes several RESTful endpoints through ViewSets and generic views:
- `/api/register/` - User Registration
- `/api/login/` - User Login & Token Generation
- `/api/users/` - User Management
- `/api/problems/` - Problem Bank Management
- `/api/contests/` - Contest Management
- `/api/contest-problems/` - Contest-Problem Association
- `/api/contest-registrations/` - Contest Registrations
- `/api/submissions/` - Submissions Management
- `/api/leaderboards/` - Leaderboard Access
