from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-lhbcm5$w39$u@&n=zx(gvr#u&+_p545kbg@x-=r=%ukr25%m+9'

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'myapp',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be high up
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    #'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend_project.wsgi.application'

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'sqlite:///db.sqlite3'),
        conn_max_age=600
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================== AUTHENTICATION SETTINGS ====================
LOGIN_URL = '/api/auth/login/'
LOGIN_REDIRECT_URL = None
LOGOUT_REDIRECT_URL = None

# ==================== CORS SETTINGS ====================
CORS_ALLOWED_ORIGINS = [
    # Production URLs - DOMAINS ONLY, NO PATHS
    "https://clicktoeat-pw67.onrender.com",
    "https://clicktoeat-frontend.onrender.com",
    "https://clicktoeat-admin.onrender.com",
    
    # Vercel deployments - All current frontend/admin URLs
    "https://clickto-eat.vercel.app",  # Main frontend
    "https://clickto-laddk59ty-bryans-projects-e4c7e470.vercel.app",  # Frontend preview
    "https://clickto-eat-rxo1-ip41vktxo-bryans-projects-e4c7e470.vercel.app",  # Admin preview
    "https://clickto-eat-rxo1.vercel.app",
    "https://clickto-eat-rxo1-41618asb3-bryans-projects-e4c7e470.vercel.app",
    "https://clickto-eat-rxo1-ipppgapnc-bryans-projects-e4c7e470.vercel.app",
    "https://clickto-ekjcpfwia-bryans-projects-e4c7e470.vercel.app",
    
    # Development URLs
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Allow all Vercel preview deployments (including future ones)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ==================== CSRF SETTINGS ====================
CSRF_TRUSTED_ORIGINS = [
    # Production URLs
    "https://clicktoeat-pw67.onrender.com",
    "https://clicktoeat-frontend.onrender.com",
    "https://clicktoeat-admin.onrender.com",
    
    # Vercel deployments
    "https://clickto-eat.vercel.app",
    "https://clickto-laddk59ty-bryans-projects-e4c7e470.vercel.app",
    "https://clickto-eat-rxo1-ip41vktxo-bryans-projects-e4c7e470.vercel.app",
    "https://clickto-eat-rxo1.vercel.app",
    "https://clickto-eat-rxo1-41618asb3-bryans-projects-e4c7e470.vercel.app",
    "https://clickto-eat-rxo1-ipppgapnc-bryans-projects-e4c7e470.vercel.app",
    "https://clickto-ekjcpfwia-bryans-projects-e4c7e470.vercel.app",
    'https://*.vercel.app',
    "https://clickto-4ukxdfnjg-bryans-projects-e4c7e470.vercel.app",
    
    
    # Development URLs
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# ==================== SESSION AND COOKIE SETTINGS ====================
# Cross-domain session cookie settings (required for Vercel + Render)
SESSION_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False

CORS_ALLOW_ALL_ORIGINS = True  # Only for local testing!
# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.db'  # Store sessions in database
SESSION_COOKIE_AGE = 1209600  # 2 weeks in seconds
SESSION_SAVE_EVERY_REQUEST = False  # Only save when modified
SESSION_COOKIE_NAME = 'sessionid'
APPEND_SLASH = True

# ==================== REST FRAMEWORK SETTINGS ====================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}
