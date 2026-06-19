# DevSphere
DevSphere is a centralized developer collaboration platform where users can sign in, create projects, upload and manage files, track tasks, report issues, document progress, showcase skills, and collaborate with team members in a GitHub-like workspace.

## Features
- User Authentication
- Project Management
- Task Tracking
- File Uploads
- Issue Reporting
- Developer Portfolio
- Automatic Resume Generator
- Projects & Teams
- Certificates & Experience

## Tech Stack

Frontend
React 19 — UI framework

Vite — build tool & dev server

React Router DOM v7 — client-side routing

Axios — API calls

CSS Variables — theming (dark/light mode)

Backend
Python / Django 5 — web framework

Django REST Framework — REST APIs

SimpleJWT — JWT authentication

django-cors-headers — CORS handling

ReportLab — PDF generation for resume

Pillow — image handling

Database
SQLite — local database (via Django ORM)

Other
GitHub REST API — repository sync

JWT Tokens — secure auth (7 day access, 30 day refresh)

## Installation

- Install all the required packages
- Install all the dependencies

Backend Setup

cd backend
python -m venv venv
venv\Scripts\activate
pip install django django-cors-headers djangorestframework djangorestframework-simplejwt reportlab pillow requests
python manage.py migrate
python manage.py runserver

Frontend Setup

cd frontend
npm install
npm run dev


