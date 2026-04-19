# EulerEngine

EulerEngine is a robust backend platform designed for mathematical and programming problem solving, contests, and grading. Built with Django and Django REST Framework, it provides a comprehensive API for managing users, problems, competitions, and submissions.

## Features

- **Custom User Management**: Custom user model supporting email and username-based authentication, complete with registration and token-based login endpoints.
- **Problem Bank**: A central repository for problems categorized by topics (e.g., Algebra, Calculus, Polynomials) featuring problem statements, ratings, and step-by-step grading rubrics.
- **Contest System**: 
  - Time-bound competitions with defined start and end times.
  - User registration for specific contests.
  - Association of problems with contests, including contest-specific point values.
- **Submissions & Grading**: Users can submit answers to contest problems. The system tracks submissions, their grading status (Pending, Graded), and scores.
- **Leaderboards**: Dynamic leaderboards tracking users' total scores and ranks within specific contests.

## Tech Stack

- **Framework**: Django, Django REST Framework (DRF)
- **Database**: SQLite (default, configured for development)
- **Authentication**: DRF Token Authentication

## Project Structure

- `EulerEngine Backend/`: The main Django workspace.
  - `core/`: The core Django application containing the models, views, serializers, and URLs that make up the EulerEngine API.
  - `eulerengine_backend/`: The primary Django project configuration and settings.
- `Project_Phase_1-1.pdf`: Reference documentation containing project requirements and use cases.

## Setup Instructions

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
   Ensure you have installed Django and Django REST Framework. If you have a `requirements.txt`, run:
   ```bash
   pip install -r requirements.txt
   ```
   Otherwise, install manually:
   ```bash
   pip install django djangorestframework
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

## API Endpoints Overview

The `core` application exposes several RESTful endpoints through ViewSets and generic views:
- `/api/register/` - User Registration
- `/api/login/` - User Login & Token Generation
- `/api/users/` - User Management
- `/api/problems/` - Problem Bank Management
- `/api/rubrics/` - Rubrics Management
- `/api/contests/` - Contest Management
- `/api/contest-problems/` - Contest-Problem Association
- `/api/contest-registrations/` - Contest Registrations
- `/api/submissions/` - Submissions Management
- `/api/leaderboards/` - Leaderboard Access
