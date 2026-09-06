# Peblo Mini TV

Peblo Mini TV is a full-stack mini streaming platform with a user-facing TV interface and a Content Management System (CMS) for managing shows, seasons, and episodes.

## Features

### Frontend
- Browse available TV shows
- Search and explore content
- Category and language based content
- Show details and episode information
- Responsive TV-style interface

### CMS
- Dashboard for content management
- Add, edit and delete shows
- Publish / unpublish shows
- Manage seasons
- Manage episodes
- Search and filter shows
- Content management through an admin interface

### Backend
- REST API built with FastAPI
- PostgreSQL database integration
- CRUD operations for shows, seasons and episodes
- Publish / unpublish functionality
- Search API

## Tech Stack

- **Frontend:** React, TypeScript, Vite, CSS
- **CMS:** React, TypeScript, Vite, CSS
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL
- **API:** REST API

## Project Structure

```text
Peblo-mini-TV/
├── Backend/
│   └── main.py
├── CMS/
│   ├── src/
│   └── package.json
├── Frontend/
│   ├── src/
│   └── package.json
└── database/
    └── schema.sql
