from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.http import JsonResponse



urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),  # Your API endpoints
    # Optionally add a root endpoint that shows API info instead of redirecting
    # path('', api_root, name='api_root'),
]